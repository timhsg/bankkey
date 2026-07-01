import Stripe from 'stripe'

// ════════════════════════════════════════════════════════════════════════
//  Client Stripe partagé — côté serveur uniquement
// ════════════════════════════════════════════════════════════════════════

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required in env')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Legacy / fallback (plan unique historique).
export const STRIPE_PRICE_ID_PRO = process.env.STRIPE_PRICE_ID_PRO ?? ''

// Price IDs par plan + intervalle (à créer dans Stripe → un Price par cellule).
// Si une cellule est absente, on retombe sur STRIPE_PRICE_ID_PRO.
const STRIPE_PRICES: Record<string, string | undefined> = {
  'solo:month':    process.env.STRIPE_PRICE_SOLO_MONTH,
  'solo:year':     process.env.STRIPE_PRICE_SOLO_YEAR,
  'cabinet:month': process.env.STRIPE_PRICE_CABINET_MONTH,
  'cabinet:year':  process.env.STRIPE_PRICE_CABINET_YEAR,
}

export type CheckoutPlan = 'solo' | 'cabinet'
export type CheckoutInterval = 'month' | 'year'

/** Résout le Price ID Stripe pour un plan + intervalle (fallback legacy). */
export function resolveStripePrice(plan: CheckoutPlan, interval: CheckoutInterval): string {
  return STRIPE_PRICES[`${plan}:${interval}`] || STRIPE_PRICE_ID_PRO
}

/**
 * URL publique de l'application (pour les redirects Stripe)
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
