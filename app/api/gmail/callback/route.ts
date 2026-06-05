import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { exchangeCode, getConnectedEmail } from '@/lib/gmail'

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

  try {
    // Échanger le code contre les tokens
    const tokens = await exchangeCode(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Tokens manquants — refresh_token absent (déjà connecté ?)')
    }

    // Récupérer l'email du compte connecté
    const gmailEmail = await getConnectedEmail(tokens.access_token, tokens.refresh_token)

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

    return NextResponse.redirect(`${appUrl}/pro?connected=gmail`)

  } catch (err) {
    console.error('[gmail/callback]', err)
    return NextResponse.redirect(`${appUrl}/pro/onboarding?error=token_save_failed`)
  }
}
