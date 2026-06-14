import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getUnreadEmails, markAsRead } from '@/lib/gmail'
import { runQualificationAgent } from '@/lib/agents/qualification'
import { runScoringAgent } from '@/lib/agents/scoring'
import { runProspectionAgent } from '@/lib/agents/prospection'
import { classifyRelevance } from '@/lib/agents/relevance'
import { detectSource } from '@/lib/sources/detection'
import { activityEmailReceived, activityFiltered, activityQualified } from '@/lib/activity'
import { rateLimit } from '@/lib/rate-limit'
import { sendHotLeadNotification, HOT_LEAD_THRESHOLD } from '@/lib/email/send-hot-lead'
import type { SectorId } from '@/lib/sectors'

/**
 * Traitement des emails entrants.
 *
 * Deux modes d'appel :
 * 1. Vercel Cron Job (toutes les 5 min) — header Authorization: Bearer CRON_SECRET
 * 2. Appel manuel depuis le dashboard (bouton "Synchroniser")
 *
 * Pour chaque agence connectée Gmail :
 *   → Récupère les emails non lus
 *   → Déduplique (gmail_message_id déjà traité ?)
 *   → Lance le pipeline qualification → scoring → prospection
 *   → Stocke le prospect dans Supabase
 *   → Marque l'email comme lu
 */
export async function POST(request: NextRequest) {
  // ── Authentification ──
  // Deux voies SEULEMENT :
  //  1. Cron machine de confiance : Authorization: Bearer CRON_SECRET
  //  2. Navigateur authentifié : session Supabase valide (cookies)
  // Le header "X-Internal-Request" n'est PLUS accepté (bypass supprimé).
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`

  const body = await request.json().catch(() => ({})) as { userId?: string }

  // Détermine quel·s utilisateur·s traiter, selon la voie d'auth
  let targetUserId: string | null = null   // null = tous (cron global)

  if (isCron) {
    // Appel machine : peut cibler un user précis (body.userId) ou tous
    targetUserId = body.userId ?? null
  } else {
    // Appel navigateur : session obligatoire, et on ne traite QUE soi-même.
    // body.userId est ignoré → impossible de déclencher le compte d'un autre.
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const limit = rateLimit(`gmail-sync:${user.id}`, 6, 60 * 60_000)
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Limite de synchronisation atteinte (6/heure). Réessayez plus tard.', resetAt: limit.resetAt },
        { status: 429 },
      )
    }
    targetUserId = user.id
  }

  const supabase = createAdminClient()

  // Cibler un utilisateur spécifique ou traiter tout le monde (cron global)
  let query = supabase
    .from('profiles')
    .select('id, sector, broker_memory, gmail_access_token, gmail_refresh_token, gmail_token_expiry')
    .not('gmail_access_token', 'is', null)
    .not('gmail_refresh_token', 'is', null)

  if (targetUserId) {
    query = query.eq('id', targetUserId) as typeof query
  }

  const { data: profiles, error: profilesError } = await query

  if (profilesError || !profiles?.length) {
    return NextResponse.json({ processed: 0, message: 'Aucun compte Gmail connecté' })
  }

  let totalProcessed = 0
  const errors: string[] = []

  for (const profile of profiles) {
    try {
      const processed = await processUserEmails(
        supabase,
        profile.id,
        profile.gmail_access_token,
        profile.gmail_refresh_token,
        (profile.sector as SectorId) ?? 'credit',
        profile.broker_memory ?? null,
      )
      totalProcessed += processed

      // Mettre à jour le timestamp du dernier traitement
      await supabase
        .from('profiles')
        .update({ gmail_last_processed_at: new Date().toISOString() })
        .eq('id', profile.id)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[process] userId=${profile.id}`, msg)
      errors.push(`${profile.id}: ${msg}`)
    }
  }

  return NextResponse.json({ processed: totalProcessed, errors })
}

// ── Traitement par utilisateur ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processUserEmails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  accessToken: string,
  refreshToken: string,
  sector: SectorId,
  brokerMemory: import('@/types').BrokerMemory | null,
): Promise<number> {
  const emails = await getUnreadEmails(accessToken, refreshToken, 20)
  let count = 0

  for (const email of emails) {
    // Déduplication : cet email a-t-il déjà été traité ?
    const { data: existing } = await supabase
      .from('prospects')
      .select('id')
      .eq('user_id', userId)
      .eq('gmail_message_id', email.id)
      .single()

    if (existing) continue  // Déjà analysé

    // Ne pas analyser les propres emails envoyés
    if (!email.body.trim() || email.body.trim().length < 30) continue

    try {
      // 0a. Détection automatique de la source (Empruntis, SeLoger, etc.)
      const detected = detectSource(
        email.fromEmail ?? '',
        email.subject ?? '',
        email.body,
      )

      // 0b. Pré-filtrage : éviter spam, newsletter, perso, auto-reply
      const relevance = await classifyRelevance(
        email.fromEmail ?? '',
        email.subject ?? '',
        email.body,
      )

      // Si non pertinent, on stocke quand même avec un statut "filtré" pour traçabilité
      if (!relevance.relevant) {
        await supabase.from('prospects').insert({
          user_id:           userId,
          source:            'gmail',
          gmail_message_id:  email.id,
          gmail_thread_id:   email.threadId,
          email_from_name:   email.fromName,
          email_from:        email.fromEmail,
          email_subject:     email.subject,
          email_body:        email.body,
          sector,
          status:            'filtered',
          relevance:         relevance,
          detected_source:   detected,
          received_at:       email.receivedAt,
          activity:          [
            activityEmailReceived(detected.sourceName),
            activityFiltered(relevance.reason ?? 'Email non pertinent'),
          ],
        })
        continue
      }

      // 1-3. Pipeline des 3 agents si pertinent
      const qualification = await runQualificationAgent(email.body, sector)
      const scoring       = await runScoringAgent(qualification, sector, brokerMemory)
      const prospection   = await runProspectionAgent(qualification, scoring, sector, brokerMemory)

      // Stocker dans Supabase avec activité initiale
      const { data: inserted } = await supabase
        .from('prospects')
        .insert({
          user_id:           userId,
          source:            'gmail',
          gmail_message_id:  email.id,
          gmail_thread_id:   email.threadId,
          email_from_name:   email.fromName,
          email_from:        email.fromEmail,
          email_subject:     email.subject,
          email_body:        email.body,
          sector,
          qualification,
          scoring,
          prospection,
          detected_source:   detected,
          relevance:         relevance,
          status:            'new',
          received_at:       email.receivedAt.toISOString(),
          activity:          [
            activityEmailReceived(detected.sourceName),
            activityQualified(scoring.score, scoring.temperature),
          ],
        })
        .select('id')
        .single()

      // Notification "lead chaud" si score ≥ 70 (non-bloquant)
      if (inserted?.id && scoring.score >= HOT_LEAD_THRESHOLD) {
        await sendHotLeadNotification({
          supabase,
          prospectId: inserted.id,
          userId,
          qualification,
          scoring,
          prospection,
        })
      }

      // Marquer comme lu pour ne pas le retraiter
      await markAsRead(accessToken, refreshToken, email.id)
      count++

    } catch (err) {
      console.error(`[process] email ${email.id}:`, err)
      // Continuer sur les autres emails même si l'un échoue
    }
  }

  return count
}
