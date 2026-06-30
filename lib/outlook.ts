/**
 * Utilitaires Outlook / Microsoft 365 — OAuth2 + lecture via Microsoft Graph.
 *
 * Scaffold : actif uniquement si MICROSOFT_CLIENT_ID + MICROSOFT_CLIENT_SECRET
 * sont configurés (app Azure). Sinon `outlookConfigured()` renvoie false et
 * l'UI bascule sur le transfert email universel.
 *
 * Aucune dépendance ajoutée — appels Graph en fetch brut.
 */

import type { GmailMessage } from './gmail'

const TENANT = 'common'
const AUTH_URL  = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`
const GRAPH = 'https://graph.microsoft.com/v1.0'

const SCOPES = [
  'offline_access',
  'openid',
  'email',
  'User.Read',
  'Mail.Read',
  'Mail.Send',
]

export function outlookConfigured(): boolean {
  return !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET)
}

function redirectUri(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return `${base}/api/outlook/callback`
}

/** URL vers laquelle rediriger l'utilisateur pour autoriser BankKey */
export function getOutlookAuthUrl(userId: string): string {
  const p = new URLSearchParams({
    client_id:     process.env.MICROSOFT_CLIENT_ID!,
    response_type: 'code',
    redirect_uri:  redirectUri(),
    response_mode: 'query',
    scope:         SCOPES.join(' '),
    state:         userId,
    prompt:        'consent',
  })
  return `${AUTH_URL}?${p.toString()}`
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

/** Échange le code d'autorisation contre des tokens */
export async function exchangeOutlookCode(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id:     process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    code,
    redirect_uri:  redirectUri(),
    grant_type:    'authorization_code',
    scope:         SCOPES.join(' '),
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Outlook token exchange: ${res.status} ${await res.text()}`)
  return res.json() as Promise<TokenResponse>
}

/** Rafraîchit l'access_token à partir du refresh_token */
export async function refreshOutlookToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id:     process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type:    'refresh_token',
    scope:         SCOPES.join(' '),
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Outlook token refresh: ${res.status} ${await res.text()}`)
  return res.json() as Promise<TokenResponse>
}

// ── Client valide avec refresh automatique ──────────────────────────────────────
//
//  ⚠️ Même bug que celui corrigé sur Gmail :
//  l'access_token Microsoft expire en ~1h. Avant, `processUserOutlook` l'utilisait
//  brut, sans jamais le rafraîchir → la synchro Outlook tombait en 401 après 1h.
//
//  `getValidOutlookToken()` regarde l'expiration : si le token est encore bon, on
//  le renvoie tel quel ; sinon on le rafraîchit ET on persiste le nouveau token
//  (+ le nouveau refresh_token, car Azure le fait tourner) via `onRefresh`.

export interface OutlookCredentials {
  accessToken: string
  refreshToken: string | null
  /** Timestamp ms d'expiration (depuis profiles.outlook_token_expiry). */
  expiryDate?: number | null
  /** Appelé quand le token est rafraîchi → à persister en base. */
  onRefresh?: (tokens: {
    accessToken: string
    refreshToken: string | null
    expiryDate: number
  }) => void | Promise<void>
}

/**
 * Renvoie un access_token Outlook valide, en le rafraîchissant si nécessaire.
 * Marge de sécurité de 2 min pour ne pas envoyer un token qui expire pendant l'appel.
 */
export async function getValidOutlookToken(creds: OutlookCredentials): Promise<string> {
  const SKEW_MS = 2 * 60_000
  const stillValid = creds.expiryDate && creds.expiryDate - SKEW_MS > Date.now()
  if (stillValid) return creds.accessToken

  // Token expiré (ou expiration inconnue) → on tente un refresh.
  if (!creds.refreshToken) {
    // Pas de refresh_token : on renvoie l'access token tel quel (échouera
    // proprement en 401 et le courtier devra reconnecter Outlook).
    return creds.accessToken
  }

  const refreshed = await refreshOutlookToken(creds.refreshToken)
  const newExpiry = Date.now() + (refreshed.expires_in ?? 3600) * 1000

  if (creds.onRefresh) {
    // Persistance best-effort — ne doit jamais faire planter la synchro.
    await Promise.resolve(
      creds.onRefresh({
        accessToken:  refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? creds.refreshToken,
        expiryDate:   newExpiry,
      }),
    ).catch((e) => console.error('[outlook] échec persistance token rafraîchi', e))
  }

  return refreshed.access_token
}

/** Email du compte Microsoft connecté */
export async function getOutlookEmail(accessToken: string): Promise<string | null> {
  const res = await fetch(`${GRAPH}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data = await res.json() as { mail?: string; userPrincipalName?: string }
  return data.mail ?? data.userPrincipalName ?? null
}

interface GraphMessage {
  id: string
  conversationId: string
  subject: string
  receivedDateTime: string
  from?: { emailAddress?: { name?: string; address?: string } }
  body?: { contentType: string; content: string }
  bodyPreview?: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Récupère les emails non lus (boîte de réception) au format GmailMessage commun */
export async function getOutlookUnread(accessToken: string, max = 20): Promise<GmailMessage[]> {
  const url =
    `${GRAPH}/me/mailFolders/inbox/messages` +
    `?$filter=isRead eq false&$top=${max}` +
    `&$select=id,conversationId,subject,receivedDateTime,from,body,bodyPreview`

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error(`Outlook messages: ${res.status}`)

  const data = await res.json() as { value: GraphMessage[] }
  const results: GmailMessage[] = []

  for (const m of data.value ?? []) {
    const raw = m.body?.content ?? m.bodyPreview ?? ''
    const text = m.body?.contentType === 'html' ? stripHtml(raw) : raw.trim()
    if (!text || text.length < 10) continue

    results.push({
      id:         m.id,
      threadId:   m.conversationId,
      fromName:   m.from?.emailAddress?.name ?? '',
      fromEmail:  m.from?.emailAddress?.address ?? '',
      subject:    m.subject || '(sans objet)',
      body:       text,
      receivedAt: new Date(m.receivedDateTime),
    })
  }
  return results
}

/** Marque un email comme lu */
export async function markOutlookRead(accessToken: string, messageId: string): Promise<void> {
  await fetch(`${GRAPH}/me/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isRead: true }),
  })
}
