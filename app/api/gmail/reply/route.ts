import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendReply } from '@/lib/gmail'

/** Envoie la réponse pré-rédigée depuis le compte Gmail de l'agence */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { to, subject, body, threadId } = await request.json() as {
    to: string; subject: string; body: string; threadId?: string
  }

  if (!to || !body) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // Récupérer les tokens Gmail de l'utilisateur
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('gmail_access_token, gmail_refresh_token, gmail_token_expiry')
    .eq('id', user.id)
    .single()

  if (!profile?.gmail_access_token || !profile?.gmail_refresh_token) {
    return NextResponse.json({ error: 'Gmail non connecté' }, { status: 400 })
  }

  try {
    await sendReply(
      {
        accessToken:  profile.gmail_access_token,
        refreshToken: profile.gmail_refresh_token,
        expiryDate:   profile.gmail_token_expiry ? new Date(profile.gmail_token_expiry).getTime() : null,
        onRefresh: async (next) => {
          await admin
            .from('profiles')
            .update({
              gmail_access_token: next.accessToken,
              gmail_token_expiry: next.expiryDate ? new Date(next.expiryDate).toISOString() : null,
            })
            .eq('id', user.id)
        },
      },
      to,
      subject ?? '',
      body,
      threadId,
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[gmail/reply]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur envoi' },
      { status: 500 },
    )
  }
}
