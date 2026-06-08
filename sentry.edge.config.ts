// ════════════════════════════════════════════════════════════════════════
//  Sentry — Configuration côté edge runtime (middleware Next.js)
// ════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? 'development',
    tracesSampleRate: 0.1,
    enabled: process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview',
  })
}
