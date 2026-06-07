// ════════════════════════════════════════════════════════════════════════
//  Rate limiting in-memory simple (suffisant pour MVP)
//  Pour production à grande échelle : passer à Upstash Redis
// ════════════════════════════════════════════════════════════════════════

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Cleanup automatique toutes les 10 min pour ne pas leak la mémoire
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    buckets.forEach((b, key) => {
      if (b.resetAt < now) buckets.delete(key)
    })
  }, 10 * 60 * 1000)
}

/**
 * Vérifie le rate limit pour une clé donnée (IP, user ID, etc.)
 * @param key Identifiant unique (IP ou user ID)
 * @param maxRequests Nombre max de requêtes dans la fenêtre
 * @param windowMs Fenêtre en millisecondes
 * @returns true si OK, false si rate limité
 */
export function rateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60 * 1000,
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: maxRequests - 1, resetAt }
  }

  if (bucket.count >= maxRequests) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count++
  return { ok: true, remaining: maxRequests - bucket.count, resetAt: bucket.resetAt }
}

/**
 * Récupère l'IP de la requête (best-effort)
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headers.get('x-real-ip')
    ?? headers.get('cf-connecting-ip')
    ?? 'unknown'
  )
}
