import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { watchInbox } from '@/lib/gmail'
import { encryptSecret, decryptSecret } from '@/lib/crypto'

// ════════════════════════════════════════════════════════════════════════
//  Cron — renouvellement de la surveillance Gmail (Pub/Sub watch)
//
//  La surveillance Gmail expire après 7 jours max. On la renouvelle chaque
//  jour pour tous les comptes connectés, afin de garder l'ingestion temps réel.
//  Appelé par GitHub Actions (.github/workflows/cron.yml).
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.GMAIL_PUBSUB_TOPIC) {
    return NextResponse.json({ ok: false, reason: 'GMAIL_PUBSUB_TOPIC non configuré' })
  }

  const admin = createAdminClient()
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, gmail_access_token, gmail_refresh_token, gmail_token_expiry')
    .not('gmail_access_token', 'is', null)
    .not('gmail_refresh_token', 'is', null)

  let renewed = 0
  const errors: string[] = []

  for (const p of profiles ?? []) {
    try {
      await watchInbox({
        accessToken:  decryptSecret(p.gmail_access_token)!,
        refreshToken: decryptSecret(p.gmail_refresh_token)!,
        expiryDate:   p.gmail_token_expiry ? new Date(p.gmail_token_expiry).getTime() : null,
        onRefresh: async (next) => {
          await admin
            .from('profiles')
            .update({
              gmail_access_token: encryptSecret(next.accessToken),
              gmail_token_expiry: next.expiryDate ? new Date(next.expiryDate).toISOString() : null,
            })
            .eq('id', p.id)
        },
      })
      renewed++
    } catch (err) {
      errors.push(`${p.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(`[cron renew-gmail-watch] renouvelés : ${renewed} | erreurs : ${errors.length}`)
  return NextResponse.json({ ok: true, renewed, errors })
}
