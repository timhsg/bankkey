// ════════════════════════════════════════════════════════════════════════
//  Sentry — Configuration côté navigateur
//  Initialisé uniquement si SENTRY_DSN est configuré (no-op sinon)
// ════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',

    // Échantillonnage : 10% des transactions seulement (anti-explosion quota)
    tracesSampleRate: 0.1,

    // Pas de session replay pour économiser le quota
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // N'envoie pas les erreurs en local dev
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
          || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',

    // Filtre les erreurs bruyantes connues
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError when attempting to fetch resource',
    ],

    beforeSend(event) {
      // Ne pas envoyer les erreurs en dev
      if (process.env.NODE_ENV === 'development') return null
      return event
    },
  })
}
