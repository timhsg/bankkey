'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogoMark } from '@/app/_components/Logo'
import { createClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════
//  /demo/access — Entrée directe dans le compte démo (aucun identifiant)
//
//  - Bouton 1 clic : « Ouvrir le tableau de bord démo »
//  - Lien zéro-clic pour cold emails : /demo/access?enter=1 (auto-login)
//  Page volontairement minimale : une accroche, un bouton, une note.
// ════════════════════════════════════════════════════════════════════════

const DEMO_EMAIL = 'demo@bankkey.ch'
const DEMO_PASSWORD = 'DemoBankKey2026'

export default function DemoAccessPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loggingIn, setLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enter = useCallback(async () => {
    setLoggingIn(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })
    if (error) {
      setError('Connexion à la démo impossible pour le moment. Réessayez dans un instant.')
      setLoggingIn(false)
    } else {
      router.push('/pro')
    }
  }, [supabase, router])

  // Lien « zéro clic » pour cold emails : /demo/access?enter=1
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (new URLSearchParams(window.location.search).get('enter') === '1') void enter()
  }, [enter])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={26} />
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
          <Link href="/demo" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            Voir la démo guidée →
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Compte de démonstration</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight leading-tight mb-4">
            Entrez dans un cabinet réel.
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            90 dossiers sur six mois, suivi banques, statistiques. Aucun identifiant, aucune inscription — vous êtes dedans en deux secondes.
          </p>

          <button
            onClick={enter}
            disabled={loggingIn}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base"
          >
            {loggingIn ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion…
              </>
            ) : (
              <>
                Ouvrir le tableau de bord démo
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </>
            )}
          </button>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">{error}</p>
          )}

          <p className="text-xs text-slate-400 mt-5 leading-relaxed">
            Compte partagé, réinitialisé chaque nuit. La connexion à une vraie boîte mail et le paiement y sont désactivés.
          </p>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-3">Prêt à l&apos;utiliser sur vos vrais emails ?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/pro/login?mode=signup" className="text-sm font-medium bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto">
                Créer mon compte (essai 30 j)
              </Link>
              <Link href="/book" className="text-sm font-medium text-blue-900 hover:underline px-2 py-2.5 w-full sm:w-auto">
                Réserver une démo avec Tim
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
