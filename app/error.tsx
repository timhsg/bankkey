'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { LogoMark } from '@/app/_components/Logo'

export default function GlobalError({
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
            <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">Quelque chose s&apos;est mal passé</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            La page n&apos;a pas pu se charger. L&apos;incident nous a été remonté automatiquement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
          {error.digest && (
            <p className="text-[11px] text-slate-400 font-mono mt-8">Réf. {error.digest}</p>
          )}
        </div>
      </main>
    </div>
  )
}
