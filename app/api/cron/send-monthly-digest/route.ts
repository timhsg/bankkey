import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { computeDigestForUser } from '@/lib/email/compute-digest'
import { renderMonthlyDigestHTML, renderMonthlyDigestText } from '@/lib/email/templates/monthly-digest'

// ════════════════════════════════════════════════════════════════════════
//  Cron Vercel — envoi du bilan mensuel par email
//  Déclenchement : 1er du mois à 09h UTC via vercel.json
//
//  Pour chaque cabinet actif :
//  1. Calcule les stats du mois précédent
//  2. Génère l'email HTML + texte
//  3. Envoie via Resend
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 60

interface SendResult {
  userId: string
  email: string
  sent: boolean
  error?: string
}

export async function GET(request: NextRequest) {
  // Auth Vercel cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY non configurée' }, { status: 500 })
  }

  const admin = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${process.env.VERCEL_URL}`

  // Récupérer tous les profils avec un email valide et abonnement actif ou en essai
  const now = Date.now()
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, email, subscription_plan, subscription_status, trial_ends_at')
    .not('email', 'is', null)

  if (!profiles?.length) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Aucun cabinet à notifier' })
  }

  const eligibleProfiles = profiles.filter(p => {
    if (p.subscription_plan === 'pro' && (p.subscription_status === 'active' || p.subscription_status === 'trialing')) return true
    if (p.trial_ends_at && new Date(p.trial_ends_at).getTime() > now) return true
    return false
  })

  const results: SendResult[] = []

  for (const profile of eligibleProfiles) {
    try {
      const digest = await computeDigestForUser(admin, profile.id, appUrl)
      if (!digest) {
        results.push({ userId: profile.id, email: profile.email, sent: false, error: 'Profil introuvable' })
        continue
      }

      const html = renderMonthlyDigestHTML(digest)
      const text = renderMonthlyDigestText(digest)
      const subject = `Votre bilan ${digest.monthLabel} — BankKey`

      const result = await sendEmail({
        to: profile.email,
        subject,
        html,
        text,
      })

      results.push({
        userId: profile.id,
        email: profile.email,
        sent: result.ok,
        error: result.ok ? undefined : result.error,
      })

      // Petit délai pour éviter le rate limit Resend (10 emails/sec)
      await new Promise(r => setTimeout(r, 150))
    } catch (err) {
      results.push({
        userId: profile.id,
        email: profile.email,
        sent: false,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      })
    }
  }

  const sentCount = results.filter(r => r.sent).length
  const errorCount = results.filter(r => !r.sent).length

  console.log(`[cron monthly-digest] Envoyés: ${sentCount} / Erreurs: ${errorCount}`)

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    eligible: eligibleProfiles.length,
    sent: sentCount,
    errors: errorCount,
    details: results,
  })
}
