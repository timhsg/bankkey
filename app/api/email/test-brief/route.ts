import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { computeDailyBrief } from '@/lib/email/compute-daily-brief'
import { renderDailyBriefHTML, renderDailyBriefText } from '@/lib/email/templates/daily-brief'

// ════════════════════════════════════════════════════════════════════════
//  Route de test — s'envoyer le brief matinal immédiatement
//  Permet de prévisualiser sans attendre le cron de 08h15.
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY non configurée' }, { status: 500 })
  }

  const admin = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const brief = await computeDailyBrief(admin, user.id, appUrl)
  if (!brief) {
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: 'Aucun dossier actionnable aujourd\'hui — le brief ne serait pas envoyé (anti-spam).',
    })
  }

  const count = brief.hotPendingCount || brief.newCount
  const result = await sendEmail({
    to: user.email!,
    subject: `[Test] ${count} dossier${count > 1 ? 's' : ''} à traiter ce matin — BankKey`,
    html: renderDailyBriefHTML(brief),
    text: renderDailyBriefText(brief),
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    sent: true,
    sent_to: user.email,
    preview: {
      new: brief.newCount,
      hot_pending: brief.hotPendingCount,
      leads: brief.leads.length,
    },
  })
}
