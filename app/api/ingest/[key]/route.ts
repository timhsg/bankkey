import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { extractFromPayload, detectIngestSource } from '@/lib/ingest/parser'
import { runQualificationAgent } from '@/lib/agents/qualification'
import { runScoringAgent } from '@/lib/agents/scoring'
import { runProspectionAgent } from '@/lib/agents/prospection'
import { rateLimit } from '@/lib/rate-limit'
import { activityEmailReceived, activityQualified } from '@/lib/activity'
import { sendHotLeadNotification, HOT_LEAD_THRESHOLD } from '@/lib/email/send-hot-lead'
import type { QualificationResult } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  /api/ingest/[key] — Endpoint webhook universel
//
//  Reçoit un payload JSON arbitraire depuis n'importe quelle source :
//  - Zapier, Make, n8n
//  - Formulaire WordPress (Contact Form 7, WPForms, Gravity)
//  - CRM custom (Salesforce, HubSpot, Aprico)
//  - Embed widget BankKey
//  - Script custom du courtier
//
//  Sécurité : authentification par la clé secrète dans l'URL
//  Rate limit : 100 leads / heure par cabinet (anti-abus)
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 60

interface RouteParams {
  params: Promise<{ key: string }>
}

// CORS pour permettre les appels depuis le formulaire web du courtier
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { key } = await params

  // Validation de la clé
  if (!key || !key.startsWith('ik_') || key.length < 20) {
    return NextResponse.json(
      { error: 'Clé d\'ingestion invalide' },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  // Rate limit par clé : 100 leads / heure
  const limit = rateLimit(`ingest:${key}`, 100, 60 * 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Limite de leads atteinte (100/heure). Contactez le support si besoin.' },
      { status: 429, headers: { ...CORS_HEADERS, 'Retry-After': '3600' } },
    )
  }

  const admin = createAdminClient()

  // Lookup du courtier propriétaire de cette clé
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, sector, broker_memory, subscription_plan, subscription_status, trial_ends_at')
    .eq('ingest_key', key)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Clé d\'ingestion non reconnue' },
      { status: 404, headers: CORS_HEADERS },
    )
  }

  // Vérification que le compte est actif (essai en cours ou Pro actif)
  const now = Date.now()
  const isTrialActive = profile.trial_ends_at && new Date(profile.trial_ends_at).getTime() > now
  const isPro = profile.subscription_plan === 'pro' && profile.subscription_status === 'active'

  if (!isTrialActive && !isPro) {
    return NextResponse.json(
      { error: 'Compte expiré ou inactif' },
      { status: 403, headers: CORS_HEADERS },
    )
  }

  // Parse du payload
  let rawPayload: unknown
  try {
    rawPayload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'JSON invalide' },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const { qualification: extractedQual, rawTextForLLM } = extractFromPayload(rawPayload)
  const sourceType = detectIngestSource(request.headers, rawPayload)

  // Pipeline de qualification
  // Si on a déjà extrait pas mal d'infos via le parser, on évite l'appel LLM qualification
  // (économie de tokens) — sauf si tout est vide
  const hasMinimumData =
    !!extractedQual.firstName ||
    !!extractedQual.email ||
    !!extractedQual.phone ||
    !!extractedQual.price ||
    (extractedQual.description ?? '').length > 50

  let qualification: QualificationResult

  if (hasMinimumData) {
    // Utilisation directe des données extraites + valeurs par défaut pour les manquantes
    qualification = {
      type: 'acheteur',
      firstName: extractedQual.firstName ?? null,
      lastName: extractedQual.lastName ?? null,
      email: extractedQual.email ?? null,
      phone: extractedQual.phone ?? null,
      contactInfo: null,
      propertyType: extractedQual.propertyType ?? null,
      address: extractedQual.address ?? null,
      surface: null,
      rooms: null,
      price: extractedQual.price ?? null,
      monthly_income: extractedQual.monthly_income ?? null,
      down_payment: extractedQual.down_payment ?? null,
      existing_debts_monthly: null,
      employment_status: extractedQual.employment_status ?? null,
      is_couple: null,
      sell_timeline: null,
      purchase_timeline: null,
      financing_status: null,
      description: extractedQual.description ?? 'Lead reçu via intégration externe',
      motivationSignals: [],
      urgencySignals: [],
    }
  } else {
    // Données trop pauvres : laissons le LLM essayer d'extraire quelque chose
    try {
      qualification = await runQualificationAgent(rawTextForLLM, profile.sector ?? 'credit')
    } catch (err) {
      console.error('[ingest] qualification LLM failed', err)
      return NextResponse.json(
        { error: 'Impossible de qualifier le lead — payload trop pauvre' },
        { status: 422, headers: CORS_HEADERS },
      )
    }
  }

  // Scoring + prospection
  let scoring, prospection
  try {
    scoring = await runScoringAgent(qualification, profile.sector ?? 'credit', profile.broker_memory)
    prospection = await runProspectionAgent(qualification, scoring, profile.sector ?? 'credit', profile.broker_memory)
  } catch (err) {
    console.error('[ingest] scoring/prospection failed', err)
    // On stocke quand même la qualif partielle pour que le courtier voie le lead
    scoring = null
    prospection = null
  }

  // Insertion dans la base
  const sourceLabel = (() => {
    const labels: Record<string, string> = {
      'zapier': 'Zapier',
      'make': 'Make',
      'hubspot': 'HubSpot',
      'salesforce': 'Salesforce',
      'embed-widget': 'Formulaire site web',
      'wordpress': 'WordPress',
      'custom': 'Intégration externe',
    }
    return labels[sourceType] ?? sourceType
  })()

  const fullName = [qualification.firstName, qualification.lastName].filter(Boolean).join(' ') || 'Lead externe'

  const { data: inserted, error: insertError } = await admin
    .from('prospects')
    .insert({
      user_id: profile.id,
      source: 'webhook',
      sector: profile.sector ?? 'credit',
      email_from_name: fullName,
      email_from: qualification.email,
      email_subject: `Lead via ${sourceLabel}`,
      email_body: rawTextForLLM,
      qualification,
      scoring,
      prospection,
      detected_source: { sourceId: sourceType, sourceName: sourceLabel, confidence: 'high', method: 'webhook' },
      ingest_metadata: {
        source: sourceType,
        user_agent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      },
      status: 'new',
      received_at: new Date().toISOString(),
      activity: [
        activityEmailReceived(sourceLabel),
        ...(scoring ? [activityQualified(scoring.score, scoring.temperature)] : []),
      ],
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[ingest] insert failed', insertError)
    return NextResponse.json(
      { error: 'Erreur de sauvegarde' },
      { status: 500, headers: CORS_HEADERS },
    )
  }

  // Notification "lead chaud" si score ≥ 70 (non-bloquant)
  if (inserted?.id && scoring && scoring.score >= HOT_LEAD_THRESHOLD) {
    await sendHotLeadNotification({
      supabase: admin,
      prospectId: inserted.id,
      userId: profile.id,
      qualification,
      scoring,
      prospection: prospection ?? null,
    })
  }

  return NextResponse.json(
    {
      ok: true,
      prospect_id: inserted?.id,
      score: scoring?.score ?? null,
      temperature: scoring?.temperature ?? null,
      message: 'Lead reçu et qualifié',
    },
    { status: 200, headers: CORS_HEADERS },
  )
}
