/**
 * Source IMAP — connexion à n'importe quelle boîte mail standard.
 *
 * Couvre les courtiers qui ne sont ni Google ni Microsoft : Yahoo, iCloud,
 * OVH, Infomaniak, Gandi, ProtonMail (via Bridge), boîte d'hébergeur, etc.
 *
 * Contrairement à Gmail/Outlook (OAuth), IMAP utilise un identifiant + mot de
 * passe (souvent un « mot de passe d'application » côté Yahoo/iCloud/Gmail).
 *
 * `imapflow` et `mailparser` sont importés dynamiquement : ils ne sont chargés
 * que lorsqu'un courtier utilise réellement IMAP — les flux Gmail/Outlook ne
 * paient pas ce coût.
 */

import type { GmailMessage } from './gmail'

export interface ImapConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
}

export interface ImapApi {
  /** Récupère les emails non lus (< 30 jours). */
  getUnread: (max?: number) => Promise<GmailMessage[]>
  /** Marque un email comme lu (par UID). */
  markSeen: (uid: string) => Promise<void>
}

const stripHtml = (html: string): string =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

/**
 * Ouvre une connexion IMAP, exécute `fn`, puis ferme proprement la connexion.
 * Une seule connexion est tenue pour tout le traitement d'un courtier
 * (récupération + marquage), ce qui évite de rouvrir une session par message.
 */
export async function withImap<T>(
  cfg: ImapConfig,
  fn: (api: ImapApi) => Promise<T>,
): Promise<T> {
  const { ImapFlow } = await import('imapflow')
  const { simpleParser } = await import('mailparser')

  const client = new ImapFlow({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
    logger: false,
    // Tolérance certificats : on reste strict par défaut (TLS valide attendu).
  })

  await client.connect()
  const lock = await client.getMailboxLock('INBOX')

  const api: ImapApi = {
    async getUnread(max = 20): Promise<GmailMessage[]> {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const uids = await client.search({ seen: false, since }, { uid: true })
      if (!uids || uids.length === 0) return []

      // Les plus récents d'abord, limités à `max`.
      const selected = uids.slice(-max).reverse()
      const results: GmailMessage[] = []

      for await (const msg of client.fetch(
        selected,
        { uid: true, source: true, envelope: true },
        { uid: true },
      )) {
        if (!msg.source) continue
        const parsed = await simpleParser(msg.source as Buffer)

        const rawText =
          parsed.text ??
          (parsed.html ? stripHtml(parsed.html) : '') ??
          ''
        const text = rawText.trim()
        if (!text || text.length < 10) continue

        const fromAddr = parsed.from?.value?.[0]
        results.push({
          id: String(msg.uid),
          threadId: parsed.messageId ?? String(msg.uid),
          fromName: fromAddr?.name ?? '',
          fromEmail: fromAddr?.address ?? '',
          subject: parsed.subject || '(sans objet)',
          body: text,
          receivedAt: parsed.date ?? new Date(),
        })
      }
      return results
    },

    async markSeen(uid: string): Promise<void> {
      await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
    },
  }

  try {
    return await fn(api)
  } finally {
    lock.release()
    await client.logout().catch(() => { /* best-effort */ })
  }
}

/**
 * Teste une connexion IMAP (au moment où le courtier renseigne ses identifiants).
 * Renvoie `{ ok: true, email }` si la connexion + ouverture INBOX réussissent.
 */
export async function testImapConnection(
  cfg: ImapConfig,
): Promise<{ ok: boolean; email?: string; error?: string }> {
  try {
    const { ImapFlow } = await import('imapflow')
    const client = new ImapFlow({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.password },
      logger: false,
    })
    await client.connect()
    const lock = await client.getMailboxLock('INBOX')
    lock.release()
    await client.logout().catch(() => {})
    // L'identifiant IMAP est presque toujours l'adresse email.
    return { ok: true, email: cfg.user }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Connexion IMAP échouée' }
  }
}
