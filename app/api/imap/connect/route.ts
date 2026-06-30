import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { testImapConnection, type ImapConfig } from '@/lib/imap'

// ════════════════════════════════════════════════════════════════════════
//  POST /api/imap/connect — Connexion d'une boîte IMAP
//
//  Body JSON : { host, port, secure, user, password }
//  1. Vérifie la session (et interdit le compte démo partagé)
//  2. Teste la connexion IMAP en direct
//  3. Si OK, sauvegarde les identifiants sur le profil
//
//  ⚠️ Le mot de passe est stocké en clair (comme les tokens Gmail aujourd'hui),
//     protégé par RLS. À chiffrer dans une itération ultérieure.
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (user.email === 'demo@bankkey.ch') {
    return NextResponse.json(
      { error: 'Le compte démo est partagé — la connexion d\'une boîte est désactivée.' },
      { status: 403 },
    )
  }

  let body: Partial<ImapConfig>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const host = (body.host ?? '').trim()
  const user_ = (body.user ?? '').trim()
  const password = body.password ?? ''
  const port = Number(body.port) || 993
  const secure = body.secure !== false // TLS par défaut

  if (!host || !user_ || !password) {
    return NextResponse.json(
      { error: 'Serveur, identifiant et mot de passe sont requis.' },
      { status: 400 },
    )
  }

  const cfg: ImapConfig = { host, port, secure, user: user_, password }

  // 1. Tester la connexion AVANT d'enregistrer quoi que ce soit
  const test = await testImapConnection(cfg)
  if (!test.ok) {
    return NextResponse.json(
      { error: `Connexion impossible : ${test.error ?? 'identifiants ou serveur incorrects'}` },
      { status: 422 },
    )
  }

  // 2. Sauvegarder sur le profil (admin client pour bypass RLS)
  const admin = createAdminClient()
  const { error: dbError } = await admin
    .from('profiles')
    .update({
      imap_host:            cfg.host,
      imap_port:            cfg.port,
      imap_secure:          cfg.secure,
      imap_user:            cfg.user,
      imap_password:        cfg.password,
      imap_connected_email: test.email ?? cfg.user,
      updated_at:           new Date().toISOString(),
    })
    .eq('id', user.id)

  if (dbError) {
    console.error('[imap/connect]', dbError)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, email: test.email ?? cfg.user })
}

// Déconnexion IMAP : efface les identifiants
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  await admin
    .from('profiles')
    .update({
      imap_host: null,
      imap_user: null,
      imap_password: null,
      imap_connected_email: null,
      imap_last_processed_at: null,
    })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}
