import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

// ════════════════════════════════════════════════════════════════════════
//  Webhook Stripe
//  Synchronise l'état d'abonnement dans Supabase à chaque événement Stripe
// ════════════════════════════════════════════════════════════════════════

// Force le runtime nodejs (pas edge) — stripe.webhooks.constructEvent nécessite crypto Node
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('[webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {

      // ─── Subscription créée / mise à jour ──────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await syncSubscription(admin, sub)
        break
      }

      // ─── Subscription supprimée ──────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await admin
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_plan: 'trial',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }

      // ─── Paiement réussi ─────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as Stripe.Invoice & { subscription?: string }).subscription
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          await syncSubscription(admin, sub)
        }
        break
      }

      // ─── Paiement échoué ────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await admin
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }

      default:
        // Événements non gérés — OK
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`[webhook] error processing ${event.type}`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook error' },
      { status: 500 }
    )
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncSubscription(admin: any, sub: Stripe.Subscription) {
  const status = sub.status  // trialing | active | past_due | canceled | etc.
  const plan = (status === 'active' || status === 'trialing') ? 'pro' : 'trial'

  // Compatibilité types Stripe : current_period_end peut être sous formes différentes
  const periodEnd = (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end

  await admin
    .from('profiles')
    .update({
      stripe_subscription_id: sub.id,
      subscription_status: status,
      subscription_plan: plan,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
    })
    .eq('stripe_customer_id', sub.customer as string)
}
