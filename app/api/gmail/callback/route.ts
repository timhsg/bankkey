import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { exchangeCode, getConnectedEmail, watchInbox } from '@/lib/gmail'

/**
 * Callback OAuth Google.
 * Google redirige ici après que l'utilisateur a accepté les permissions.
 * URL : /api/gmail/callback?code=xxx&state=userId
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code   = searchParams.get('code')
  const userId = searchParams.get('state')  // passé dans getOAuthUrl()
  const error  = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (error || !code || !userId) {
    console.error('[gmail/callback] OAuth error:', error)
    return NextResponse.redirect(`${appUrl}/pro/onboarding?error=oauth_failed`)
  }

  // ── Sécurité : le state (userId) doit correspondre à la SESSION en cours.
  // Sans ça, un attaquant pourrait injecter ses tokens Gmail dans le compte
  // d'une victime (CSRF d'association de compte OAuth).
  const sessionClient = await createClient()
  const { data: { user: sessionUser } } = await sessionClient.auth.getUser()
  if (!sessionUser || sessionUser.id !== userId) {
    console.error('[gmail/callback] state ne correspond pas à la session')
    return NextResponse.redirect(`${appUrl}/pro/login?error=session_mismatch`)
  }

  try {
    // Échanger le code contre les tokens
    const tokens = await exchangeCode(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Tokens manquants — refresh_token absent (déjà connecté ?)')
    }

    // Récupérer l'email du compte connecté
    const gmailEmail = await getConnectedEmail({
      accessToken:  tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate:   tokens.expiry_date ?? null,
    })

    // Stocker les tokens dans Supabase (admin client pour bypass RLS)
    const supabase = createAdminClient()
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        gmail_connected_email:   gmailEmail,
        gmail_access_token:      tokens.access_token,
        gmail_refresh_token:     tokens.refresh_token,
        gmail_token_expiry:      tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (dbError) throw dbError

    // Démarrer la surveillance temps réel immédiatement (non bloquant :
    // si Pub/Sub n'est pas encore configuré, le cron de secours prend le relais).
    if (process.env.GMAIL_PUBSUB_TOPIC) {
      try {
        await watchInbox({
          accessToken:  tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate:   tokens.expiry_date ?? null,
        })
      } catch (watchErr) {
        console.error('[gmail/callback] démarrage watch échoué (non bloquant)', watchErr)
      }
    }

    return NextResponse.redirect(`${appUrl}/pro?connected=gmail`)

  } catch (err) {
    console.error('[gmail/callback]', err)
    return NextResponse.redirect(`${appUrl}/pro/onboarding?error=token_save_failed`)
  }
}
