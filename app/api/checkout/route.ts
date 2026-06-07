import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICE_ID_PRO, getAppUrl } from '@/lib/stripe'

export async function POST() {
  try {
    // 1. Vérifier l'authentification utilisateur
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 2. Vérifier ou créer le customer Stripe
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email,
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // 3. Créer la session de checkout
    if (!STRIPE_PRICE_ID_PRO) {
      return NextResponse.json(
        { error: 'STRIPE_PRICE_ID_PRO non configuré' },
        { status: 500 }
      )
    }

    const appUrl = getAppUrl()
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID_PRO, quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,  // Essai gratuit aligné avec la promesse marketing
        metadata: { user_id: user.id },
      },
      success_url: `${appUrl}/pro/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/pro/billing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
