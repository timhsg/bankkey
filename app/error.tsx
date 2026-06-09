'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-white mb-2">⚠️</h1>
        <h2 className="text-2xl font-semibold text-slate-200 mb-4">Une erreur est survenue</h2>
        <p className="text-slate-400 mb-2">
          Nous n&apos;avons pas pu charger cette page. Nos équipes ont été alertées.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-500 font-mono mb-8">ID: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
