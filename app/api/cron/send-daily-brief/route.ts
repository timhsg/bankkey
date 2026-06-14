import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { computeDailyBrief } from '@/lib/email/compute-daily-brief'
import { renderDailyBriefHTML, renderDailyBriefText } from '@/lib/email/templates/daily-brief'

// ════════════════════════════════════════════════════════════════════════
//  Cron Vercel — brief matinal quotidien
//  Déclenché à 08h15 UTC (après la sync Gmail de 08h00).
//
//  Pour chaque cabinet actif avec ≥1 dossier actionnable :
//   1. Calcule le brief (nouveaux + prioritaires non traités)
//   2. N'envoie QUE s'il y a quelque chose à traiter (anti-spam)
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 60

interface SendResult {
  userId: string
  email: string
  sent: boolean
  skipped?: boolean
  error?: string
}

export async function GET(request: NextRequest) {
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

  const now = Date.now()
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, email, subscription_plan, subscription_status, trial_ends_at')
    .not('email', 'is', null)

  if (!profiles?.length) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Aucun cabinet' })
  }

  // Seulement les comptes actifs ou en essai valide
  const eligible = profiles.filter(p => {
    if (p.subscription_plan === 'pro' && (p.subscription_status === 'active' || p.subscription_status === 'trialing')) return true
    if (p.trial_ends_at && new Date(p.trial_ends_at).getTime() > now) return true
    return false
  })

  const results: SendResult[] = []

  for (const profile of eligible) {
    try {
      const brief = await computeDailyBrief(admin, profile.id, appUrl)

      // Rien d'actionnable → on n'envoie pas (anti-spam, préserve l'habitude)
      if (!brief) {
        results.push({ userId: profile.id, email: profile.email, sent: false, skipped: true })
        continue
      }

      const count = brief.hotPendingCount || brief.newCount
      const subject = `${count} dossier${count > 1 ? 's' : ''} à traiter ce matin — BankKey`

      const result = await sendEmail({
        to: profile.email,
        subject,
        html: renderDailyBriefHTML(brief),
        text: renderDailyBriefText(brief),
      })

      results.push({
        userId: profile.id,
        email: profile.email,
        sent: result.ok,
        error: result.ok ? undefined : result.error,
      })

      // Respect du rate limit Resend (~10/s)
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
  const skipped = results.filter(r => r.skipped).length
  console.log(`[cron daily-brief] Envoyés: ${sentCount} / Ignorés (RAS): ${skipped} / Erreurs: ${results.filter(r => !r.sent && !r.skipped).length}`)

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    eligible: eligible.length,
    sent: sentCount,
    skipped,
  })
}
