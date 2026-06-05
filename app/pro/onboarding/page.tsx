'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function OnboardingContent() {
  const params = useSearchParams()
  const error  = params.get('error')

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-slate-900">Connecter Gmail</h1>
          <p className="text-sm text-slate-500 mt-1">Étape 1 sur 1 — 2 minutes</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error === 'oauth_failed'      && 'La connexion Gmail a échoué. Réessayez.'}
              {error === 'token_save_failed' && 'Erreur lors de la sauvegarde. Réessayez.'}
              {!['oauth_failed', 'token_save_failed'].includes(error) && `Erreur : ${error}`}
            </div>
          )}

          <div className="space-y-3">
            {[
              { icon: '📨', text: 'BankKey lit vos emails entrants en lecture seule' },
              { icon: '🤖', text: 'Chaque email est analysé automatiquement par l\'IA' },
              { icon: '📊', text: 'Les prospects apparaissent dans votre tableau de bord avec leur score' },
              { icon: '✉️', text: 'Vous envoyez la réponse pré-rédigée en un clic' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 mb-4">
              Permissions demandées : lecture, envoi et marquage comme lu.
              BankKey ne stocke pas vos emails — uniquement les analyses.
            </p>

            <a
              href="/api/gmail/connect"
              className="flex items-center justify-center gap-3 w-full border border-slate-200
                         hover:border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-3
                         text-sm font-medium text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Connecter avec Google
            </a>
          </div>
        </div>

        <p className="text-center mt-4">
          <a href="/pro" className="text-xs text-slate-400 hover:text-slate-600">
            ← Retour au tableau de bord
          </a>
        </p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
