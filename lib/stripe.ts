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

export const STRIPE_PRICE_ID_PRO = process.env.STRIPE_PRICE_ID_PRO ?? ''

/**
 * URL publique de l'application (pour les redirects Stripe)
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
