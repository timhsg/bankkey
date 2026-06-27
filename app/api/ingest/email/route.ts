import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { runQualificationAgent } from '@/lib/agents/qualification'
import { runScoringAgent } from '@/lib/agents/scoring'
import { runProspectionAgent } from '@/lib/agents/prospection'
import { rateLimit } from '@/lib/rate-limit'
import { activityEmailReceived, activityQualified } from '@/lib/activity'
import { sendHotLeadNotification, HOT_LEAD_THRESHOLD } from '@/lib/email/send-hot-lead'

// ════════════════════════════════════════════════════════════════════════
//  /api/ingest/email — Email Inbound (Resend / SendGrid / Postmark)
//
//  Permet aux courtiers de transférer leurs emails de leads vers une
//  adresse unique de type :  x<hash>@in.bankkey.ch (générée à l'inscription)
//
//  Ce endpoint accepte un POST JSON (format Resend Inbound) :
//    { from, to, subject, text, html, headers }
//
//  Routage : on récupère l'adresse "to" → on cherche profiles.forwarding_address
//  → on exécute le pipeline standard (qualif → score → prospection).
//
//  Auth : la sécurité repose sur le secret de webhook Resend Inbound
//         (header `svix-signature` ou bearer token configuré côté Resend)
//         → on vérifie via WEBHOOK_INBOUND_SECRET en env.
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 60

interface InboundPayload {
  from?: string | { email?: string; name?: string }
  to?: string | string[]
  subject?: string
  text?: string
  html?: string
  headers?: Record<string, string>
  // Resend format
  data?: {
    from?: string
    to?: string[]
    subject?: string
    text?: string
    html?: string
  }
}

export async function POST(request: NextRequest) {
  // 1. Vérification du secret — fail-closed en production.
  //    Sans secret, n'importe qui pourrait POSTer de faux leads et déclencher
  //    le pipeline IA (coût LLM + pollution de la base). On exige donc le secret
  //    en prod ; en dev local on laisse passer pour faciliter les tests.
  const expectedSecret = process.env.WEBHOOK_INBOUND_SECRET
  if (!expectedSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[inbound] WEBHOOK_INBOUND_SECRET manquant en production — requête refusée')
      return NextResponse.json({ error: 'Endpoint non configuré' }, { status: 503 })
    }
    // dev/local sans secret : toléré
  } else {
    const auth = request.headers.get('authorization') ?? ''
    const provided = auth.replace(/^Bearer\s+/i, '')
    if (provided !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let payload: InboundPayload
  try {
    payload = (await request.json()) as InboundPayload
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  // Resend wrap parfois le body sous { type, data }
  const data = payload.data ?? payload

  // 2. Extraction des champs essentiels
  const toRaw = Array.isArray(data.to) ? data.to[0] : (data.to as string | undefined)
  const fromField = typeof data.from === 'string' ? data.from : (data.from as { email?: string })?.email
  const fromEmailMatch = fromField?.match(/<([^>]+)>/) ?? (fromField ? [fromField, fromField] : null)
  const fromEmail = fromEmailMatch ? fromEmailMatch[1] : null
  const fromName = typeof data.from === 'string'
    ? (data.from.replace(/<[^>]+>/, '').trim().replace(/^"|"$/g, '') || null)
    : (data.from as { name?: string })?.name ?? null

  const subject = data.subject ?? '(sans sujet)'
  const text = data.text ?? stripHtml(data.html ?? '')

  if (!toRaw || !text) {
    return NextResponse.json(
      { error: 'Payload incomplet : champs to/text requis' },
      { status: 400 },
    )
  }

  // Normalisation de l'adresse destinataire
  const toEmail = (toRaw.match(/<([^>]+)>/) ?? [toRaw, toRaw])[1].toLowerCase().trim()

  // Rate limit : 30 emails / heure par adresse de forward
  const limit = rateLimit(`inbound:${toEmail}`, 30, 60 * 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Trop d\'emails reçus pour cette adresse' },
      { status: 429 },
    )
  }

  // 3. Lookup du courtier propriétaire de cette adresse de forward
  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, sector, broker_memory, forwarding_address, subscription_plan, subscription_status, trial_ends_at')
    .ilike('forwarding_address', toEmail)
    .maybeSingle()

  if (profileError || !profile) {
    console.warn('[inbound] aucune correspondance pour', toEmail)
    // On répond 200 pour éviter que Resend ne rejoue indéfiniment
    return NextResponse.json({ ok: false, reason: 'forwarding_address inconnue' })
  }

  // 4. Vérif abonnement
  const isActive = checkActiveSubscription(profile)
  if (!isActive) {
    return NextResponse.json(
      { ok: false, reason: 'compte inactif' },
      { status: 402 },
    )
  }

  // 5. Pipeline IA standard
  let qualification, scoring, prospection
  try {
    qualification = await runQualificationAgent(
      `Sujet : ${subject}\nDe : ${fromName ?? ''} <${fromEmail ?? ''}>\n\n${text}`,
      profile.sector ?? 'credit',
    )
  } catch (err) {
    console.error('[inbound] qualification failed', err)
    return NextResponse.json(
      { error: 'Erreur de qualification' },
      { status: 500 },
    )
  }

  try {
    scoring = await runScoringAgent(qualification, profile.sector ?? 'credit', profile.broker_memory)
    prospection = await runProspectionAgent(qualification, scoring, profile.sector ?? 'credit', profile.broker_memory)
  } catch (err) {
    console.error('[inbound] scoring/prospection failed', err)
    scoring = null
    prospection = null
  }

  // 6. Insertion en DB
  const senderName = fromName
    ?? [qualification.firstName, qualification.lastName].filter(Boolean).join(' ')
    ?? 'Email transféré'

  const { data: inserted, error: insertError } = await admin
    .from('prospects')
    .insert({
      user_id: profile.id,
      source: 'email_forward',
      sector: profile.sector ?? 'credit',
      email_from_name: senderName,
      email_from: fromEmail ?? qualification.email,
      email_subject: subject,
      email_body: text,
      qualification,
      scoring,
      prospection,
      detected_source: {
        sourceId: 'email_forward',
        sourceName: 'Email transféré',
        confidence: 'high',
        method: 'inbound',
      },
      status: 'new',
      received_at: new Date().toISOString(),
      activity: [
        activityEmailReceived('Email transféré'),
        ...(scoring ? [activityQualified(scoring.score, scoring.temperature)] : []),
      ],
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[inbound] insert failed', insertError)
    return NextResponse.json({ error: 'Erreur de sauvegarde' }, { status: 500 })
  }

  // 7. Notification hot lead (non-bloquant)
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

  return NextResponse.json({
    ok: true,
    prospect_id: inserted?.id,
    score: scoring?.score ?? null,
    temperature: scoring?.temperature ?? null,
  })
}

// ── Helpers ───────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function checkActiveSubscription(profile: {
  subscription_plan: string | null
  subscription_status: string | null
  trial_ends_at: string | null
}): boolean {
  if (profile.subscription_plan === 'pro' && profile.subscription_status !== 'canceled') return true
  if (profile.trial_ends_at && new Date(profile.trial_ends_at).getTime() > Date.now()) return true
  return false
}
