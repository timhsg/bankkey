/**
 * Utilitaires Gmail — OAuth2 + lecture + envoi
 *
 * Flux complet :
 * 1. getOAuthUrl()          → URL Google → l'utilisateur accepte
 * 2. exchangeCode(code)     → access_token + refresh_token → stocker dans Supabase
 * 3. getRecentEmails(...)   → liste des emails entrants non traités
 * 4. sendReply(...)         → envoi de la réponse depuis le compte connecté
 */

import { google } from 'googleapis'

// ── Config ────────────────────────────────────────────────────────────────────

// Détection robuste de l'URL de redirection :
// 1. GOOGLE_REDIRECT_URI explicite (prioritaire)
// 2. NEXT_PUBLIC_APP_URL si défini
// 3. VERCEL_URL si on est sur Vercel (production / preview)
// 4. localhost en dernier recours (dev local uniquement)
function detectRedirectUri(): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/gmail/callback`
  if (process.env.NEXT_PUBLIC_APP_URL) return `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
  return 'http://localhost:3000/api/gmail/callback'
}

const REDIRECT_URI = detectRedirectUri()

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
]

// ── OAuth ─────────────────────────────────────────────────────────────────────

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    REDIRECT_URI,
  )
}

// ── Client authentifié + refresh automatique ───────────────────────────────────
//
//  ⚠️ Bug historique corrigé ici :
//  Avant, on faisait `setCredentials({ access_token, refresh_token })` SANS
//  `expiry_date`. La librairie Google considérait alors le token comme toujours
//  valide et ne le rafraîchissait JAMAIS. Résultat : la connexion Gmail marchait
//  juste après l'autorisation, puis tombait en panne ~1h plus tard (token expiré
//  → 401), donc plus aucun email synchronisé ensuite.
//
//  Fix :
//   1. On passe `expiry_date` → la librairie sait quand rafraîchir
//      (si inconnu = anciennes lignes, on met `1` pour forcer un refresh).
//   2. On écoute l'événement `tokens` → on persiste le nouveau token en base
//      via `onRefresh`, pour que la prochaine exécution reparte d'un token frais.

export interface GmailCredentials {
  accessToken: string
  refreshToken: string
  /** Timestamp ms d'expiration (depuis profiles.gmail_token_expiry). */
  expiryDate?: number | null
  /** Appelé quand la librairie rafraîchit le token → à persister en base. */
  onRefresh?: (tokens: { accessToken: string; expiryDate: number | null }) => void | Promise<void>
}

function authedClient(creds: GmailCredentials) {
  const auth = createOAuthClient()
  auth.setCredentials({
    access_token:  creds.accessToken,
    refresh_token: creds.refreshToken,
    // expiry inconnu → on force un refresh immédiat en marquant le token expiré.
    expiry_date:   creds.expiryDate ?? 1,
  })

  if (creds.onRefresh) {
    auth.on('tokens', (t) => {
      if (!t.access_token) return
      // Persistance best-effort (ne doit jamais faire planter la synchro).
      void Promise.resolve(
        creds.onRefresh!({ accessToken: t.access_token, expiryDate: t.expiry_date ?? null }),
      ).catch((e) => console.error('[gmail] échec persistance token rafraîchi', e))
    })
  }

  return auth
}

/** Génère l'URL vers laquelle rediriger l'utilisateur */
export function getOAuthUrl(userId: string) {
  return createOAuthClient().generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',     // Force le refresh_token à chaque connexion
    state: userId,         // On récupère l'userId dans le callback
  })
}

/** Échange le code d'autorisation contre des tokens */
export async function exchangeCode(code: string) {
  const { tokens } = await createOAuthClient().getToken(code)
  return tokens // { access_token, refresh_token, expiry_date, ... }
}

/** Récupère l'email du compte Google connecté */
export async function getConnectedEmail(creds: GmailCredentials) {
  const auth = authedClient(creds)
  const oauth2 = google.oauth2({ version: 'v2', auth })
  const { data } = await oauth2.userinfo.get()
  return data.email ?? null
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GmailMessage {
  id: string
  threadId: string
  fromName: string
  fromEmail: string
  subject: string
  body: string          // Texte brut extrait
  receivedAt: Date
}

// ── Helpers d'extraction ──────────────────────────────────────────────────────

function extractEmail(header: string): string {
  return (header.match(/<([^>]+)>/) ?? header.match(/([^\s]+@[^\s]+)/))?.[1] ?? header
}

function extractName(header: string): string {
  const m = header.match(/^([^<]+)</)
  return m ? m[1].trim().replace(/"/g, '') : header
}

function decodeBase64(encoded: string): string {
  return Buffer.from(
    encoded.replace(/-/g, '+').replace(/_/g, '/'),
    'base64',
  ).toString('utf-8')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(payload: any): string {
  if (!payload) return ''

  // Texte plain directement
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64(payload.body.data)
  }

  // Parcourir les parties (multipart/*)
  if (payload.parts) {
    // Préférer text/plain
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain') {
        const text = extractText(part)
        if (text) return text
      }
    }
    // Fallback : toutes les parties récursivement
    for (const part of payload.parts) {
      const text = extractText(part)
      if (text) return text
    }
  }

  // Fallback HTML → stripping basique
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return decodeBase64(payload.body.data)
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  return ''
}

// ── Lecture ───────────────────────────────────────────────────────────────────

/**
 * Récupère les emails non traités (INBOX, non lus)
 * Filtre les expéditeurs automatiques (no-reply, notifications, etc.)
 */
export async function getUnreadEmails(
  creds: GmailCredentials,
  maxResults = 20,
): Promise<GmailMessage[]> {
  const auth = authedClient(creds)

  const gmail = google.gmail({ version: 'v1', auth })

  // IMPORTANT : on NE filtre PAS par expéditeur ni par catégorie ici.
  // Les leads (Empruntis, SeLoger, Pretto…) sont envoyés depuis des adresses
  // no-reply/notification ET classés par Gmail dans Promotions/Updates.
  // Les exclure ferait rater l'essentiel des leads. On récupère donc large
  // (INBOX, non lus, < 30 jours) et c'est l'agent de pertinence (strict,
  // "default reject") qui écarte le bruit en aval.
  const list = await gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX', 'UNREAD'],
    q: 'newer_than:30d',
    maxResults,
  })

  const messages = list.data.messages ?? []
  const results: GmailMessage[] = []

  for (const msg of messages) {
    if (!msg.id) continue

    const full = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    })

    const headers = full.data.payload?.headers ?? []
    const getHeader = (name: string) =>
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ''

    const fromRaw = getHeader('from')
    const body    = extractText(full.data.payload)

    // Ignorer les emails vides (probablement des tracking pixels ou auto-réponses)
    if (!body.trim() || body.trim().length < 10) continue

    results.push({
      id:          msg.id,
      threadId:    full.data.threadId ?? '',
      fromName:    extractName(fromRaw),
      fromEmail:   extractEmail(fromRaw),
      subject:     getHeader('subject') || '(sans objet)',
      body,
      receivedAt:  new Date(parseInt(full.data.internalDate ?? '0', 10)),
    })
  }

  return results
}

// ── Marquage ──────────────────────────────────────────────────────────────────

/** Marque un email comme lu (pour éviter de le retraiter) */
export async function markAsRead(
  creds: GmailCredentials,
  messageId: string,
) {
  const auth = authedClient(creds)
  const gmail = google.gmail({ version: 'v1', auth })

  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { removeLabelIds: ['UNREAD'] },
  })
}

// ── Envoi ─────────────────────────────────────────────────────────────────────

/** Envoie une réponse dans le même thread Gmail */
export async function sendReply(
  creds: GmailCredentials,
  to: string,
  subject: string,
  body: string,
  threadId?: string,
) {
  const auth = authedClient(creds)
  const gmail = google.gmail({ version: 'v1', auth })

  const replySubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`

  const raw = [
    `To: ${to}`,
    `Subject: ${replySubject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n')

  const encoded = Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded, threadId },
  })
}

// ── Push temps réel (Gmail watch + Pub/Sub) ─────────────────────────────────────
//
//  `watch` demande à Google de publier une notification sur un topic Pub/Sub à
//  chaque nouvel email — bien plus rapide que le polling cron (réponse < 1 min).
//  La surveillance EXPIRE après 7 jours max → la renouveler chaque jour
//  (cf. /api/cron/renew-gmail-watch).
//
//  Pré-requis côté Google Cloud (à configurer une fois) :
//   1. Activer l'API Cloud Pub/Sub
//   2. Créer un topic (ex : gmail-leads)
//   3. Donner au compte `gmail-api-push@system.gserviceaccount.com` le rôle
//      "Pub/Sub Publisher" sur ce topic
//   4. Créer une souscription PUSH vers
//      https://bankkey.ch/api/gmail/push?token=<GMAIL_PUSH_TOKEN>
//   5. Renseigner GMAIL_PUBSUB_TOPIC + GMAIL_PUSH_TOKEN en variables d'env.

/** Démarre/renouvelle la surveillance temps réel de la boîte. */
export async function watchInbox(
  creds: GmailCredentials,
): Promise<{ historyId: string | null; expiration: string | null }> {
  const topicName = process.env.GMAIL_PUBSUB_TOPIC
  if (!topicName) throw new Error('GMAIL_PUBSUB_TOPIC non configuré')

  const auth = authedClient(creds)
  const gmail = google.gmail({ version: 'v1', auth })

  const { data } = await gmail.users.watch({
    userId: 'me',
    requestBody: {
      topicName,                      // projects/<projet>/topics/<topic>
      labelIds: ['INBOX'],
      labelFilterBehavior: 'INCLUDE',
    },
  })

  return {
    historyId:  data.historyId ?? null,
    expiration: data.expiration ?? null,   // epoch ms (string)
  }
}

/** Arrête la surveillance temps réel. */
export async function stopWatch(creds: GmailCredentials): Promise<void> {
  const auth = authedClient(creds)
  const gmail = google.gmail({ version: 'v1', auth })
  await gmail.users.stop({ userId: 'me' })
}
