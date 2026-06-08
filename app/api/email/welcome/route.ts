import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { renderWelcomeHTML, renderWelcomeText } from '@/lib/email/templates/welcome'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// ════════════════════════════════════════════════════════════════════════
//  /api/email/welcome — envoi de l'email de bienvenue
//  Appelé depuis /pro/login juste après une inscription réussie
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Rate limit : 3 welcome emails / IP / heure (anti-abuse)
  const ip = getClientIp(request.headers)
  const limit = rateLimit(`welcome:${ip}`, 3, 60 * 60_000)
  if (!limit.ok) {
    return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    // En dev sans Resend : on log et on retourne OK silencieusement
    console.log('[welcome] RESEND_API_KEY manquant — email non envoyé pour', user.email)
    return NextResponse.json({ ok: true, sent: false, reason: 'Resend non configuré' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // Lire le profil pour récupérer le prénom (si déjà renseigné)
  const { data: profile } = await supabase
    .from('profiles')
    .select('broker_memory')
    .eq('id', user.id)
    .single()

  const memory = profile?.broker_memory as { fullName?: string; agencyName?: string } | null
  const firstName = memory?.fullName?.split(' ')[0] ?? null
  const agencyName = memory?.agencyName ?? null

  const result = await sendEmail({
    to: user.email!,
    subject: 'Bienvenue dans BankKey · démarrons en 3 minutes',
    html: renderWelcomeHTML({ firstName, agencyName, appUrl }),
    text: renderWelcomeText({ firstName, agencyName, appUrl }),
  })

  if (!result.ok) {
    console.error('[welcome] échec envoi', result.error)
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  // Optionnel : marquer dans le profil qu'on a envoyé le welcome
  await supabase
    .from('profiles')
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.json({ ok: true, sent: true, resend_id: result.id })
}
