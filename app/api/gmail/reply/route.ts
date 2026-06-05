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
    .select('gmail_access_token, gmail_refresh_token')
    .eq('id', user.id)
    .single()

  if (!profile?.gmail_access_token || !profile?.gmail_refresh_token) {
    return NextResponse.json({ error: 'Gmail non connecté' }, { status: 400 })
  }

  try {
    await sendReply(
      profile.gmail_access_token,
      profile.gmail_refresh_token,
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
