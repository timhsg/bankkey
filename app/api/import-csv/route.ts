import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { extractFromPayload } from '@/lib/ingest/parser'
import { runScoringAgent } from '@/lib/agents/scoring'
import { activityEmailReceived, activityQualified } from '@/lib/activity'
import type { QualificationResult } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  /api/import-csv — Import CSV en masse
//
//  Le client envoie un tableau de lignes mappées vers les champs BankKey.
//  Pour chaque ligne, on crée un prospect avec scoring (pas de prospection
//  par défaut — trop coûteux en LLM si 500 lignes).
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 60

interface ImportPayload {
  // Tableau de lignes déjà mappées (clé = champ BankKey)
  rows: Array<Record<string, string>>
  // Si true, calcule le scoring IA (coût LLM)
  runScoring?: boolean
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  let body: ImportPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    return NextResponse.json({ error: 'Aucune ligne à importer' }, { status: 400 })
  }

  if (body.rows.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 lignes par import' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Lire le profil pour scoring
  const { data: profile } = await admin
    .from('profiles')
    .select('sector, broker_memory')
    .eq('id', user.id)
    .single()

  const sector = profile?.sector ?? 'credit'
  const brokerMemory = profile?.broker_memory ?? null
  const shouldRunScoring = body.runScoring !== false

  let imported = 0
  let skipped = 0
  const errors: Array<{ index: number; error: string }> = []

  for (let i = 0; i < body.rows.length; i++) {
    const row = body.rows[i]
    try {
      // Extraction via le parser flexible (utilisé aussi pour les webhooks)
      const { qualification: extracted } = extractFromPayload(row)

      // Construction de la qualification complète
      const qualification: QualificationResult = {
        type: 'acheteur',
        firstName: extracted.firstName ?? null,
        lastName: extracted.lastName ?? null,
        email: extracted.email ?? null,
        phone: extracted.phone ?? null,
        contactInfo: null,
        propertyType: extracted.propertyType ?? null,
        address: extracted.address ?? null,
        surface: null, rooms: null,
        price: extracted.price ?? null,
        monthly_income: extracted.monthly_income ?? null,
        down_payment: extracted.down_payment ?? null,
        existing_debts_monthly: null,
        employment_status: extracted.employment_status ?? null,
        is_couple: null,
        sell_timeline: null,
        purchase_timeline: null,
        financing_status: null,
        description: extracted.description ?? 'Importé depuis CSV',
        motivationSignals: [],
        urgencySignals: [],
      }

      // Skip si vraiment trop pauvre (pas de nom ni email)
      if (!qualification.firstName && !qualification.email && !qualification.phone) {
        skipped++
        continue
      }

      // Scoring (optionnel pour économiser les tokens)
      let scoring = null
      if (shouldRunScoring) {
        try {
          scoring = await runScoringAgent(qualification, sector, brokerMemory)
        } catch (err) {
          console.error('[import-csv] scoring failed for row', i, err)
        }
      }

      const fullName = [qualification.firstName, qualification.lastName].filter(Boolean).join(' ') || 'Lead importé'

      await admin.from('prospects').insert({
        user_id: user.id,
        source: 'csv-import',
        sector,
        email_from_name: fullName,
        email_from: qualification.email,
        email_subject: `Lead importé CSV`,
        email_body: JSON.stringify(row),
        qualification,
        scoring,
        prospection: null,  // Pas de génération d'email pour import en masse
        detected_source: { sourceId: 'csv', sourceName: 'Import CSV', confidence: 'high', method: 'manual' },
        status: 'new',
        received_at: new Date().toISOString(),
        activity: [
          activityEmailReceived('Import CSV'),
          ...(scoring ? [activityQualified(scoring.score, scoring.temperature)] : []),
        ],
      })

      imported++
    } catch (err) {
      errors.push({
        index: i,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      })
    }
  }

  return NextResponse.json({
    ok: true,
    imported,
    skipped,
    total: body.rows.length,
    errors: errors.slice(0, 10),  // max 10 erreurs détaillées
  })
}
