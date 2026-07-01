import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe, resolveStripePrice, getAppUrl, type CheckoutPlan, type CheckoutInterval } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Plan + intervalle (optionnels). Défaut : Solo mensuel — rétrocompatible
    // avec l'ancien appel sans corps.
    const body = await request.json().catch(() => ({})) as { plan?: CheckoutPlan; interval?: CheckoutInterval }
    const plan: CheckoutPlan = body.plan === 'cabinet' ? 'cabinet' : 'solo'
    const interval: CheckoutInterval = body.interval === 'year' ? 'year' : 'month'
    // 1. Vérifier l'authentification utilisateur
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Compte démo partagé : pas de paiement possible
    if (user.email === 'demo@bankkey.ch') {
      return NextResponse.json(
        { error: 'Le compte démo ne permet pas de souscrire. Créez votre propre compte gratuit.' },
        { status: 403 },
      )
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
    const priceId = resolveStripePrice(plan, interval)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Aucun tarif Stripe configuré pour ce plan' },
        { status: 500 }
      )
    }

    const appUrl = getAppUrl()
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,  // Essai standard. Fondateurs : 3 mois via code promo (coupon Stripe).
        metadata: { user_id: user.id, plan, interval },
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
