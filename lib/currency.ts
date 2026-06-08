// ════════════════════════════════════════════════════════════════════════
//  Détection automatique de la devise selon la localisation utilisateur
//
//  Stratégie en 3 niveaux :
//  1. Cookie `bk_currency` (choix explicite utilisateur — prioritaire)
//  2. Header Vercel x-vercel-ip-country (géolocalisation IP server-side)
//  3. navigator.language côté client (fallback)
//
//  Devises supportées : EUR (€), CHF
// ════════════════════════════════════════════════════════════════════════

export type CurrencyCode = 'EUR' | 'CHF'

export interface Currency {
  code: CurrencyCode
  symbol: string           // "€" ou "CHF"
  label: string            // "Euro" ou "Franc suisse"
  locale: string           // "fr-FR" ou "fr-CH"
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  EUR: { code: 'EUR', symbol: '€',   label: 'Euro',         locale: 'fr-FR' },
  CHF: { code: 'CHF', symbol: 'CHF', label: 'Franc suisse', locale: 'fr-CH' },
}

// Pays utilisant CHF (Suisse + Liechtenstein)
const CHF_COUNTRIES = new Set(['CH', 'LI'])

// Pays utilisant EUR (zone euro principalement)
const EUR_COUNTRIES = new Set([
  'FR', 'BE', 'LU', 'DE', 'AT', 'IT', 'ES', 'PT', 'NL',
  'IE', 'FI', 'GR', 'SK', 'SI', 'EE', 'LV', 'LT', 'MT', 'CY', 'HR',
  'MC', 'AD', 'SM', 'VA',
])

/**
 * Détecte la devise depuis un code pays ISO 2-letter
 */
export function currencyFromCountry(country: string | null | undefined): CurrencyCode {
  if (!country) return 'EUR'
  const upper = country.toUpperCase()
  if (CHF_COUNTRIES.has(upper)) return 'CHF'
  if (EUR_COUNTRIES.has(upper)) return 'EUR'
  return 'EUR'  // Défaut européen
}

/**
 * Détecte la devise depuis navigator.language (client-side)
 */
export function currencyFromBrowser(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'EUR'
  const lang = navigator.language || 'fr-FR'
  if (/-CH$/i.test(lang)) return 'CHF'
  if (/-LI$/i.test(lang)) return 'CHF'
  return 'EUR'
}

/**
 * Conversion approximative EUR ↔ CHF
 * Taux conservateur : 1 EUR = 0.95 CHF (variations 0.90-1.00 selon période)
 * On préfère sous-évaluer en CHF pour ne pas sur-vendre
 */
export const EUR_TO_CHF = 0.95
export const CHF_TO_EUR = 1 / EUR_TO_CHF

export function convertPrice(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount
  if (from === 'EUR' && to === 'CHF') return Math.round(amount * EUR_TO_CHF)
  if (from === 'CHF' && to === 'EUR') return Math.round(amount * CHF_TO_EUR)
  return amount
}

/**
 * Formate un montant avec sa devise dans la locale appropriée
 */
export function formatPrice(amount: number, currency: CurrencyCode): string {
  const cur = CURRENCIES[currency]
  const formatted = amount.toLocaleString(cur.locale)
  // Suisse : symbole avant; France : symbole après
  return currency === 'CHF' ? `${formatted} CHF` : `${formatted} €`
}

/**
 * Tarification produit (devise de référence : EUR)
 * Tarif lancement programme pilote
 */
export const PRICING_EUR = {
  trial: 0,
  pro: 199,
}

/**
 * Tarif lancement : même montant en EUR et CHF.
 * Le Suisse paie ~5% de plus en valeur réelle, acceptable pour la simplicité.
 * Sera réévalué après 30 cabinets pilotes signés.
 */
export function getDisplayPrice(plan: 'trial' | 'pro', _currency: CurrencyCode): number {
  if (plan === 'trial') return 0
  return 199
}
