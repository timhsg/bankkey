'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// ════════════════════════════════════════════════════════════════════════
//  Error boundary localisé pour la fiche prospect
//  Si la fiche plante (champs manquants côté demo), on affiche un message
//  propre au lieu de l'écran d'erreur global navy
// ════════════════════════════════════════════════════════════════════════

export default function LeadDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[lead detail error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center bg-white border border-slate-200 rounded-2xl p-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h1 className="text-lg font-semibold text-slate-900 mb-2">Fiche en cours d&apos;enrichissement</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Cette fiche fait partie de l&apos;historique du compte démo et certains détails (briefing d&apos;appel, signaux d&apos;urgence) n&apos;ont pas été générés pour ce dossier ancien.
          <br /><br />
          Sur les <strong>10 dossiers récents</strong> en haut de la liste prospects, vous verrez la fiche complète : profil emprunteur, score expliqué, email de réponse rédigé, briefing d&apos;appel et suivi banques.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={reset}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/pro/prospects"
            className="text-xs font-medium bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Voir les prospects récents
          </Link>
        </div>

        {error.digest && (
          <p className="text-[10px] text-slate-300 font-mono mt-6">ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
