import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getUnreadEmails, markAsRead, type GmailMessage } from '@/lib/gmail'
import { outlookConfigured, getOutlookUnread, markOutlookRead, getValidOutlookToken } from '@/lib/outlook'
import { withImap, type ImapConfig } from '@/lib/imap'
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

  const { data: profiles } = await query

  let totalProcessed = 0
  const errors: string[] = []

  // ── Comptes Gmail ──
  for (const profile of profiles ?? []) {
    try {
      totalProcessed += await processUserEmails(
        supabase,
        profile.id,
        profile.gmail_access_token,
        profile.gmail_refresh_token,
        profile.gmail_token_expiry,
        (profile.sector as SectorId) ?? 'credit',
        profile.broker_memory ?? null,
      )
      await supabase
        .from('profiles')
        .update({ gmail_last_processed_at: new Date().toISOString() })
        .eq('id', profile.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[process] gmail userId=${profile.id}`, msg)
      errors.push(`gmail ${profile.id}: ${msg}`)
    }
  }

  // ── Comptes Outlook (uniquement si l'app Azure est configurée) ──
  if (outlookConfigured()) {
    try {
      let oQuery = supabase
        .from('profiles')
        .select('id, sector, broker_memory, outlook_access_token, outlook_refresh_token, outlook_token_expiry')
        .not('outlook_access_token', 'is', null)
      if (targetUserId) oQuery = oQuery.eq('id', targetUserId) as typeof oQuery

      const { data: oProfiles } = await oQuery
      for (const profile of oProfiles ?? []) {
        try {
          totalProcessed += await processUserOutlook(
            supabase,
            profile.id,
            profile.outlook_access_token,
            profile.outlook_refresh_token,
            profile.outlook_token_expiry,
            (profile.sector as SectorId) ?? 'credit',
            profile.broker_memory ?? null,
          )
          await supabase
            .from('profiles')
            .update({ outlook_last_processed_at: new Date().toISOString() })
            .eq('id', profile.id)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error(`[process] outlook userId=${profile.id}`, msg)
          errors.push(`outlook ${profile.id}: ${msg}`)
        }
      }
    } catch {
      // Colonnes outlook_* absentes (migration 010 non appliquée) → on ignore.
    }
  }

  // ── Comptes IMAP (Yahoo, iCloud, OVH, custom…) ──
  {
    let iQuery = supabase
      .from('profiles')
      .select('id, sector, broker_memory, imap_host, imap_port, imap_secure, imap_user, imap_password')
      .not('imap_password', 'is', null)
    if (targetUserId) iQuery = iQuery.eq('id', targetUserId) as typeof iQuery

    const { data: iProfiles, error: iErr } = await iQuery
    // Si la colonne imap_* n'existe pas (migration 015 non appliquée), iErr est
    // renseigné et iProfiles est null → on saute proprement.
    if (!iErr) {
      for (const profile of iProfiles ?? []) {
        if (!profile.imap_host || !profile.imap_user || !profile.imap_password) continue
        try {
          totalProcessed += await processUserImap(
            supabase,
            profile.id,
            {
              host:     profile.imap_host,
              port:     profile.imap_port ?? 993,
              secure:   profile.imap_secure ?? true,
              user:     profile.imap_user,
              password: profile.imap_password,
            },
            (profile.sector as SectorId) ?? 'credit',
            profile.broker_memory ?? null,
          )
          await supabase
            .from('profiles')
            .update({ imap_last_processed_at: new Date().toISOString() })
            .eq('id', profile.id)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error(`[process] imap userId=${profile.id}`, msg)
          errors.push(`imap ${profile.id}: ${msg}`)
        }
      }
    }
  }

  return NextResponse.json({ processed: totalProcessed, errors })
}

// ── Traitement par utilisateur ────────────────────────────────────────────────

/**
 * Boucle de traitement partagée Gmail / Outlook.
 * Reçoit une liste d'emails normalisés + un callback markRead spécifique à la source.
 */
async function processInbox(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  sector: SectorId,
  brokerMemory: import('@/types').BrokerMemory | null,
  emails: GmailMessage[],
  source: 'gmail' | 'outlook' | 'imap',
  markRead: (messageId: string) => Promise<void>,
): Promise<number> {
  let count = 0

  for (const email of emails) {
    // Déduplication (l'id du message est stocké dans gmail_message_id pour les 2 sources)
    const { data: existing } = await supabase
      .from('prospects')
      .select('id')
      .eq('user_id', userId)
      .eq('gmail_message_id', email.id)
      .maybeSingle()

    if (existing) continue
    if (!email.body.trim() || email.body.trim().length < 30) continue

    try {
      const detected = detectSource(email.fromEmail ?? '', email.subject ?? '', email.body)
      const relevance = await classifyRelevance(email.fromEmail ?? '', email.subject ?? '', email.body)

      if (!relevance.relevant) {
        await supabase.from('prospects').insert({
          user_id:          userId,
          source,
          gmail_message_id: email.id,
          gmail_thread_id:  email.threadId,
          email_from_name:  email.fromName,
          email_from:       email.fromEmail,
          email_subject:    email.subject,
          email_body:       email.body,
          sector,
          status:           'filtered',
          relevance,
          detected_source:  detected,
          received_at:      email.receivedAt.toISOString(),
          activity: [
            activityEmailReceived(detected.sourceName),
            activityFiltered(relevance.reason ?? 'Email non pertinent'),
          ],
        })
        continue
      }

      const qualification = await runQualificationAgent(email.body, sector)
      const scoring       = await runScoringAgent(qualification, sector, brokerMemory)
      const prospection   = await runProspectionAgent(qualification, scoring, sector, brokerMemory)

      const { data: inserted } = await supabase
        .from('prospects')
        .insert({
          user_id:          userId,
          source,
          gmail_message_id: email.id,
          gmail_thread_id:  email.threadId,
          email_from_name:  email.fromName,
          email_from:       email.fromEmail,
          email_subject:    email.subject,
          email_body:       email.body,
          sector,
          qualification,
          scoring,
          prospection,
          detected_source:  detected,
          relevance,
          status:           'new',
          received_at:      email.receivedAt.toISOString(),
          activity: [
            activityEmailReceived(detected.sourceName),
            activityQualified(scoring.score, scoring.temperature),
          ],
        })
        .select('id')
        .single()

      if (inserted?.id && scoring.score >= HOT_LEAD_THRESHOLD) {
        await sendHotLeadNotification({ supabase, prospectId: inserted.id, userId, qualification, scoring, prospection })
      }

      await markRead(email.id)
      count++
    } catch (err) {
      console.error(`[process] ${source} email ${email.id}:`, err)
      // Continuer sur les autres emails même si l'un échoue
    }
  }

  return count
}

async function processUserEmails(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiry: string | null,
  sector: SectorId,
  brokerMemory: import('@/types').BrokerMemory | null,
): Promise<number> {
  // Credentials avec expiry + persistance du token rafraîchi.
  // Corrige le bug où la synchro Gmail cassait ~1h après la connexion.
  const creds = {
    accessToken,
    refreshToken,
    expiryDate: tokenExpiry ? new Date(tokenExpiry).getTime() : null,
    onRefresh: async (next: { accessToken: string; expiryDate: number | null }) => {
      await supabase
        .from('profiles')
        .update({
          gmail_access_token: next.accessToken,
          gmail_token_expiry: next.expiryDate ? new Date(next.expiryDate).toISOString() : null,
        })
        .eq('id', userId)
    },
  }

  const emails = await getUnreadEmails(creds, 20)
  return processInbox(supabase, userId, sector, brokerMemory, emails, 'gmail',
    (id) => markAsRead(creds, id))
}

async function processUserOutlook(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  accessToken: string,
  refreshToken: string | null,
  tokenExpiry: string | null,
  sector: SectorId,
  brokerMemory: import('@/types').BrokerMemory | null,
): Promise<number> {
  // Récupère un token valide (refresh + persistance si expiré).
  // Corrige le bug où la synchro Outlook cassait ~1h après la connexion.
  const validToken = await getValidOutlookToken({
    accessToken,
    refreshToken,
    expiryDate: tokenExpiry ? new Date(tokenExpiry).getTime() : null,
    onRefresh: async (next) => {
      await supabase
        .from('profiles')
        .update({
          outlook_access_token:  next.accessToken,
          outlook_refresh_token: next.refreshToken,
          outlook_token_expiry:  new Date(next.expiryDate).toISOString(),
        })
        .eq('id', userId)
    },
  })

  const emails = await getOutlookUnread(validToken, 20)
  return processInbox(supabase, userId, sector, brokerMemory, emails, 'outlook',
    (id) => markOutlookRead(validToken, id))
}

async function processUserImap(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  cfg: ImapConfig,
  sector: SectorId,
  brokerMemory: import('@/types').BrokerMemory | null,
): Promise<number> {
  // Une seule connexion IMAP est tenue pour toute la session (lecture + marquage).
  return withImap(cfg, async (api) => {
    const emails = await api.getUnread(20)
    return processInbox(supabase, userId, sector, brokerMemory, emails, 'imap',
      (id) => api.markSeen(id))
  })
}
