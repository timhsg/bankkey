import type { NextRequest } from 'next/server'

// ════════════════════════════════════════════════════════════════════════
//  Autorisation des routes cron.
//  Vercel injecte automatiquement `Authorization: Bearer ${CRON_SECRET}`
//  sur les invocations cron quand la variable CRON_SECRET est définie.
//
//  Règle de sécurité :
//   - CRON_SECRET défini  → exige le Bearer exact.
//   - CRON_SECRET absent  → autorisé UNIQUEMENT hors production (dev local).
//     En production, un secret manquant = accès refusé (pas de cron ouvert).
// ════════════════════════════════════════════════════════════════════════

export function isCronAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production'
  }
  return authHeader === `Bearer ${cronSecret}`
}
