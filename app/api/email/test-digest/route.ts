import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { computeDigestForUser } from '@/lib/email/compute-digest'
import { renderMonthlyDigestHTML, renderMonthlyDigestText } from '@/lib/email/templates/monthly-digest'

// ════════════════════════════════════════════════════════════════════════
//  Route de test — envoyer le digest à son propre email
//  Permet de prévisualiser sans attendre le 1er du mois
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

  const digest = await computeDigestForUser(admin, user.id, appUrl)
  if (!digest) {
    return NextResponse.json({ error: 'Impossible de calculer le digest' }, { status: 500 })
  }

  const result = await sendEmail({
    to: user.email!,
    subject: `[Test] Votre bilan ${digest.monthLabel} — BankKey`,
    html: renderMonthlyDigestHTML(digest),
    text: renderMonthlyDigestText(digest),
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    sent_to: user.email,
    resend_id: result.id,
    digest_preview: {
      month: digest.monthLabel,
      total_prospects: digest.totalProspects,
      hot: digest.hotProspects,
      accepted: digest.accepted,
    },
  })
}
