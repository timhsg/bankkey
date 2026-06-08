// ════════════════════════════════════════════════════════════════════════
//  Notification "lead chaud" — orchestration
//
//  Appelé après création d'un prospect (via Gmail process ou webhook ingest)
//  quand scoring.score >= 70. Vérifie le toggle courtier, déduplique via
//  prospects.notifications_sent, puis envoie via Resend.
//
//  Non-bloquant côté appelant : on attrape toutes les erreurs et log,
//  jamais on ne fait échouer l'insertion du prospect.
// ════════════════════════════════════════════════════════════════════════

import { sendEmail } from './resend'
import {
  renderHotLeadHTML,
  renderHotLeadText,
  buildHotLeadSubject,
} from './templates/hot-lead-notification'
import type { QualificationResult, ScoringResult, ProspectionResult } from '@/types'

// Seuil "lead chaud" — gardé constant pour qu'on puisse l'ajuster un seul endroit
export const HOT_LEAD_THRESHOLD = 70

interface SendHotLeadParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any // SupabaseClient (admin)
  prospectId: string
  userId: string
  qualification: QualificationResult
  scoring: ScoringResult
  prospection: ProspectionResult | null
}

/**
 * Envoie la notification si toutes les conditions sont réunies.
 * Retourne `{ sent: boolean, reason?: string }` pour le debug,
 * mais ne lève jamais d'erreur — l'appelant n'a pas à s'en soucier.
 */
export async function sendHotLeadNotification(
  params: SendHotLeadParams,
): Promise<{ sent: boolean; reason?: string }> {
  const { supabase, prospectId, userId, qualification, scoring, prospection } = params

  try {
    // Gating sur le score (l'appelant filtre normalement, on re-checke par sécurité)
    if (!scoring || scoring.score < HOT_LEAD_THRESHOLD) {
      return { sent: false, reason: `score ${scoring?.score ?? '?'} < ${HOT_LEAD_THRESHOLD}` }
    }

    // Charge profil courtier + état des notifications déjà envoyées
    const [{ data: profile }, { data: prospectRow }] = await Promise.all([
      supabase
        .from('profiles')
        .select('email, email_hot_notifications')
        .eq('id', userId)
        .single(),
      supabase
        .from('prospects')
        .select('notifications_sent')
        .eq('id', prospectId)
        .single(),
    ])

    if (!profile?.email) {
      return { sent: false, reason: 'profil sans email' }
    }
    if (profile.email_hot_notifications === false) {
      return { sent: false, reason: 'notifications désactivées' }
    }

    // Dédup : si on a déjà envoyé pour ce prospect, on stoppe
    const alreadySent = prospectRow?.notifications_sent?.hot_lead
    if (alreadySent) {
      return { sent: false, reason: 'déjà notifié' }
    }

    if (!process.env.RESEND_API_KEY) {
      console.log('[hot-lead] RESEND_API_KEY manquant — email non envoyé pour', profile.email)
      return { sent: false, reason: 'Resend non configuré' }
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const fullName =
      [qualification.firstName, qualification.lastName].filter(Boolean).join(' ').trim() ||
      'Prospect sans nom'

    const city = extractCity(qualification.address)

    const data = {
      prospectId,
      fullName,
      score: scoring.score,
      temperature: scoring.temperature,
      city,
      briefing: prospection?.callScript?.briefing ?? null,
      need: prospection?.callScript?.need ?? null,
      monthlyIncome: qualification.monthly_income,
      downPayment: qualification.down_payment,
      employmentStatus: qualification.employment_status,
      appUrl,
    }

    const result = await sendEmail({
      to: profile.email,
      subject: buildHotLeadSubject({ fullName, score: scoring.score, city }),
      html: renderHotLeadHTML(data),
      text: renderHotLeadText(data),
    })

    if (!result.ok) {
      console.error('[hot-lead] échec envoi', result.error)
      return { sent: false, reason: result.error }
    }

    // Marque le prospect comme notifié (dédup pour les futurs déclencheurs)
    await supabase
      .from('prospects')
      .update({
        notifications_sent: {
          ...(prospectRow?.notifications_sent ?? {}),
          hot_lead: new Date().toISOString(),
        },
      })
      .eq('id', prospectId)

    return { sent: true }
  } catch (err) {
    console.error('[hot-lead] erreur inattendue', err)
    return { sent: false, reason: err instanceof Error ? err.message : 'erreur inconnue' }
  }
}

/**
 * Extrait une ville depuis un champ adresse libre.
 * Heuristique simple : dernier segment après virgule, sinon retourne l'adresse complète
 * si elle fait moins de 40 caractères, sinon null.
 */
function extractCity(address: string | null): string | null {
  if (!address) return null
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length > 1) {
    // Nettoyage code postal éventuel : "69002 Lyon" → "Lyon"
    return parts[parts.length - 1].replace(/^\d{4,5}\s+/, '').trim() || null
  }
  return address.length <= 40 ? address : null
}
