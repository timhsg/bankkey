import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// ════════════════════════════════════════════════════════════════════════
//  /api/gmail/push — Webhook Pub/Sub (Gmail temps réel)
//
//  Google publie ici à chaque nouvel email d'une boîte sous surveillance
//  (cf. lib/gmail.ts → watchInbox). On déclenche alors immédiatement le
//  pipeline de traitement pour ce courtier — au lieu d'attendre le cron.
//
//  Sécurité : token partagé dans l'URL (?token=GMAIL_PUSH_TOKEN), configuré
//  dans la souscription Pub/Sub. Sans token valide → 401.
//
//  Important : on répond TOUJOURS 200 (sauf token invalide) pour éviter que
//  Pub/Sub ne rejoue la notification en boucle. Le cron de secours (5 min)
//  rattrape ce qu'une notification raterait.
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 60

interface PubSubPush {
  message?: { data?: string; messageId?: string; publishTime?: string }
  subscription?: string
}

export async function POST(request: NextRequest) {
  // 1. Auth par token dans l'URL
  const token = new URL(request.url).searchParams.get('token')
  const expected = process.env.GMAIL_PUSH_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Décoder la notification Pub/Sub
  let body: PubSubPush
  try {
    body = (await request.json()) as PubSubPush
  } catch {
    return NextResponse.json({ ok: true }) // illisible → ack
  }

  const dataB64 = body.message?.data
  if (!dataB64) return NextResponse.json({ ok: true })

  let emailAddress: string | null = null
  let historyId: string | number | null = null
  try {
    const decoded = JSON.parse(Buffer.from(dataB64, 'base64').toString('utf-8')) as {
      emailAddress?: string
      historyId?: string | number
    }
    emailAddress = decoded.emailAddress ?? null
    historyId = decoded.historyId ?? null
  } catch {
    console.warn('[gmail/push] payload Pub/Sub illisible')
    return NextResponse.json({ ok: true }) // payload illisible → ack
  }

  console.log(`[gmail/push] notification — email=${emailAddress ?? '?'} historyId=${historyId ?? '?'}`)

  if (!emailAddress) return NextResponse.json({ ok: true })

  // 3. Retrouver le courtier propriétaire de cette boîte
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .ilike('gmail_connected_email', emailAddress)
    .maybeSingle()

  // Filet de sécurité : si on ne retrouve pas le compte par email (casse,
  // adresse stockée différemment…), on déclenche un traitement GLOBAL.
  // La déduplication par gmail_message_id empêche tout doublon.
  const targetUserId: string | null = profile?.id ?? null
  if (targetUserId) {
    console.log(`[gmail/push] profil trouvé userId=${targetUserId} → process ciblé`)
  } else {
    console.warn(`[gmail/push] aucun profil pour ${emailAddress} → process global (fallback)`)
  }

  // 4. Déclencher le pipeline existant (réutilise /api/gmail/process)
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  ).replace(/\/+$/, '') // retire un éventuel slash final
  const cronSecret = process.env.CRON_SECRET

  try {
    const res = await fetch(`${appUrl}/api/gmail/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cronSecret ?? ''}`,
      },
      // userId ciblé si trouvé, sinon objet vide = traitement global
      body: JSON.stringify(targetUserId ? { userId: targetUserId } : {}),
    })
    const txt = await res.text().catch(() => '')
    console.log(`[gmail/push] process → HTTP ${res.status} ${txt.slice(0, 200)}`)
  } catch (err) {
    console.error('[gmail/push] déclenchement process échoué', err)
    // On ack quand même : le cron de secours rattrapera.
  }

  return NextResponse.json({ ok: true })
}
