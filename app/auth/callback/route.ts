import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ════════════════════════════════════════════════════════════════════════
//  /auth/callback — Échange du code OAuth contre une session Supabase
//
//  Appelé après "Continuer avec Google" : Supabase redirige ici avec un
//  paramètre ?code=. On l'échange contre une session, puis on redirige
//  l'utilisateur vers son espace.
//
//  - Nouveau compte (sans broker_memory.agencyName) → /pro/onboarding
//  - Compte existant → /pro
//  - Erreur → /pro/login?error=oauth_failed
// ════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/pro'

  if (!code) {
    return NextResponse.redirect(`${origin}/pro/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchange failed', error)
    return NextResponse.redirect(`${origin}/pro/login?error=oauth_failed`)
  }

  // Vérifier si c'est une première connexion (pas encore d'agence renseignée)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('broker_memory')
      .eq('id', user.id)
      .maybeSingle()

    const hasOnboarded = !!profile?.broker_memory?.agencyName
    const target = hasOnboarded ? next : '/pro/onboarding'

    // Tentative non-bloquante d'envoi du welcome email
    if (!hasOnboarded) {
      try {
        await fetch(`${origin}/api/email/welcome`, {
          method: 'POST',
          headers: { cookie: request.headers.get('cookie') ?? '' },
        })
      } catch {
        // Pas bloquant
      }
    }

    return NextResponse.redirect(`${origin}${target}`)
  }

  return NextResponse.redirect(`${origin}/pro/login?error=no_user`)
}
