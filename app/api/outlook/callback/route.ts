import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { exchangeOutlookCode, getOutlookEmail } from '@/lib/outlook'
import { encryptSecret } from '@/lib/crypto'

/**
 * Callback OAuth Microsoft.
 * URL : /api/outlook/callback?code=xxx&state=userId
 * Mêmes garde-fous de sécurité que Gmail : la session doit correspondre au state.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code   = searchParams.get('code')
  const userId = searchParams.get('state')
  const error  = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (error || !code || !userId) {
    return NextResponse.redirect(`${appUrl}/pro/sources?error=outlook_oauth_failed`)
  }

  // Sécurité : le state doit correspondre à la session en cours
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${appUrl}/pro/login?error=session_mismatch`)
  }

  try {
    const tokens = await exchangeOutlookCode(code)
    if (!tokens.access_token) throw new Error('access_token manquant')

    const email = await getOutlookEmail(tokens.access_token)
    const expiry = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString()

    const supabase = createAdminClient()
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        outlook_connected_email: email,
        outlook_access_token:    encryptSecret(tokens.access_token),
        outlook_refresh_token:   encryptSecret(tokens.refresh_token ?? null),
        outlook_token_expiry:    expiry,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (dbError) throw dbError

    return NextResponse.redirect(`${appUrl}/pro/sources?connected=outlook`)
  } catch (err) {
    console.error('[outlook/callback]', err)
    return NextResponse.redirect(`${appUrl}/pro/sources?error=outlook_token_save_failed`)
  }
}
