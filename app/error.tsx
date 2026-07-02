'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import SiteHeader from '@/app/_components/SiteHeader'

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
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
            <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tightest text-[#0A0F1E] mb-3">Quelque chose s&apos;est mal passé</h1>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            La page n&apos;a pas pu se charger. L&apos;incident nous a été remonté automatiquement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="btn-primary w-full sm:w-auto justify-center text-sm"
            >
              Réessayer
            </button>
            <Link href="/" className="btn-ghost w-full sm:w-auto justify-center text-sm">
              Retour à l&apos;accueil
            </Link>
          </div>
          {error.digest && (
            <p className="text-[11px] text-[#9CA3AF] font-mono mt-8">Réf. {error.digest}</p>
          )}
        </div>
      </main>
    </div>
  )
}
