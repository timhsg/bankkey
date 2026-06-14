'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// ════════════════════════════════════════════════════════════════════════
//  Error boundary localisé
//  Si la fiche ne peut pas s'afficher (souvent : dossier démo historique
//  avec données partielles), on rassure l'utilisateur plutôt que d'afficher
//  un message d'erreur technique.
// ════════════════════════════════════════════════════════════════════════

export default function LeadDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log silencieux pour debug dev — pas affiché à l'utilisateur
    console.error('[lead detail error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-6">
      <div className="max-w-md text-center bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-card">

        <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        </div>

        <h1 className="text-lg font-extrabold text-navy mb-3">Dossier exemple du compte démo</h1>
        <p className="text-sm text-[#374151] leading-relaxed mb-2">
          Cette fiche fait partie de l&apos;historique pré-rempli du compte de démonstration. Certains champs n&apos;ont pas été générés pour ce dossier ancien.
        </p>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
          <strong className="text-navy">Sur votre propre compte</strong>, chaque demande de financement reçue par email sera <strong className="text-navy">automatiquement et entièrement analysée</strong> : profil emprunteur, score, brouillon de réponse, briefing d&apos;appel et checklist documents.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button onClick={reset} className="btn-ghost text-xs py-2 px-4">
            Réessayer
          </button>
          <Link href="/pro/prospects" className="btn-primary text-xs py-2 px-4">
            Voir les prospects récents
          </Link>
        </div>

        <p className="text-[10px] text-[#9CA3AF] mt-6 leading-relaxed">
          Les 10 dossiers les plus récents en haut de la liste ont la fiche complète.
        </p>
      </div>
    </div>
  )
}
