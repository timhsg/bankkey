import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

// ════════════════════════════════════════════════════════════════════════
//  Route de test Sentry — déclenche une erreur côté serveur
//  GET /api/sentry-test → erreur capturée et envoyée à Sentry
// ════════════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!process.env.SENTRY_DSN) {
    return NextResponse.json(
      { ok: false, error: 'SENTRY_DSN non configuré côté serveur. Ajoutez la variable sur Vercel.' },
      { status: 500 },
    )
  }

  try {
    // Capture explicite via Sentry SDK (plus fiable que throw)
    const testError = new Error(`Test Sentry BankKey — ${new Date().toISOString()}`)
    Sentry.captureException(testError)

    // Force le flush avant la réponse
    await Sentry.flush(2000)

    return NextResponse.json({
      ok: true,
      message: 'Erreur de test envoyée à Sentry. Vérifiez sentry.io → Issues dans 30 secondes.',
      environment: process.env.VERCEL_ENV ?? 'local',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 },
    )
  }
}
