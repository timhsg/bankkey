import { Resend } from 'resend'

// ════════════════════════════════════════════════════════════════════════
//  Client Resend partagé — envoi d'emails transactionnels
// ════════════════════════════════════════════════════════════════════════

let cachedResend: Resend | null = null

export function getResend(): Resend {
  if (cachedResend) return cachedResend
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY manquante en env')
  cachedResend = new Resend(key)
  return cachedResend
}

// Adresse d'envoi par défaut
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? 'BankKey <hello@bankkey.ch>'
export const EMAIL_REPLY_TO = process.env.RESEND_REPLY_TO ?? 'contact@bankkey.ch'

/**
 * Helper pour envoyer un email avec gestion d'erreur uniforme
 */
export async function sendEmail(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo ?? EMAIL_REPLY_TO,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: data?.id ?? 'sent' }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur Resend' }
  }
}
