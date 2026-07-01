'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogoMark } from '@/app/_components/Logo'
import { createClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════
//  /demo/access — Page d'accès au compte démo seedé
//  Affiche les identifiants et un guide d'exploration de l'app pro
// ════════════════════════════════════════════════════════════════════════

const DEMO_EMAIL = 'demo@bankkey.ch'
const DEMO_PASSWORD = 'DemoBankKey2026'

const STEPS = [
  {
    label: 'Connectez-vous au compte démo',
    desc: 'Cliquez sur "Se connecter" ci-dessus, ou utilisez les identifiants ci-dessous sur la page login. Aucune inscription nécessaire.',
  },
  {
    label: 'Explorez les 10 prospects pré-chargés',
    desc: 'Profils variés : couple cadre, primo-accédants, fonctionnaires, indépendants, refinancement. Scores de 32 à 92.',
  },
  {
    label: 'Cliquez sur une fiche pour voir le détail',
    desc: 'Profil emprunteur, score expliqué, email de réponse rédigé, briefing d\'appel, checklist documents.',
  },
  {
    label: 'Naviguez dans le reste de l\'app',
    desc: 'Banques, Bilan mensuel, Statistiques, Sources, Intégrations. Tout est interactif.',
  },
]

const SECTIONS = [
  { route: '/pro',              label: 'Aujourd\'hui',     desc: 'Top 3 prospects prioritaires + stats du jour' },
  { route: '/pro/prospects',    label: 'Prospects',        desc: 'Liste complète avec filtres, recherche, export CSV' },
  { route: '/pro/leads/[id]',   label: 'Fiche prospect',   desc: 'Détail en 4 onglets : Vue / Communication / Banques / Historique' },
  { route: '/pro/filtered',     label: 'Emails filtrés',   desc: 'Ce que BankKey écarte avec bouton "Restaurer"' },
  { route: '/pro/banks',        label: 'Banques',          desc: 'Kanban des dossiers en cours' },
  { route: '/pro/bilan',        label: 'Bilan du mois',    desc: 'Volume, sources, performance banques, commissions' },
  { route: '/pro/statistiques', label: 'Statistiques',     desc: 'Vue analytics globale + carte de complétude' },
  { route: '/pro/sources',      label: 'Sources',          desc: 'Auto-détection des sources de leads' },
  { route: '/pro/integrations', label: 'Intégrations',     desc: '4 portes d\'entrée : Gmail, email forward, web, CSV' },
  { route: '/pro/settings',     label: 'Profil cabinet',   desc: 'Mémoire IA + scoring personnalisé' },
]

export default function DemoAccessPage() {
  const router = useRouter()
  const [loggingIn, setLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const supabase = createClient()

  const autoLogin = useCallback(async () => {
    setLoggingIn(true)
    setLoginError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })
    if (error) {
      setLoginError('Connexion impossible. Le compte démo n\'est peut-être pas encore activé.')
      setLoggingIn(false)
    } else {
      router.push('/pro')
    }
  }, [supabase, router])

  // Lien « zéro clic » pour les cold emails : bankkey.ch/demo/access?enter=1
  // → connecte automatiquement au compte démo dès l'ouverture du lien.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (new URLSearchParams(window.location.search).get('enter') === '1') {
      void autoLogin()
    }
  }, [autoLogin])

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
          <Link href="/demo" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            ← Démo guidée
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12 md:py-16 space-y-10">

        {/* Hero */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Compte démo</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tighter mb-4 leading-tight">
            Le cabinet de Marie Lefèvre, ouvert pour vous.
          </h1>
          <p className="text-slate-600 leading-relaxed max-w-xl mx-auto">
            90 dossiers réels sur six mois, suivi banques en cours, statistiques de performance. Cliquez sur le bouton ci-dessous, vous êtes dedans en deux secondes.
          </p>
        </div>

        {/* CTA principal : auto-login */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 text-center">
            <button
              onClick={autoLogin}
              disabled={loggingIn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-base"
            >
              {loggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Ouvrir le compte démo
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {loginError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4 max-w-md mx-auto">
                {loginError}
              </p>
            )}

            <p className="text-[12px] text-slate-500 mt-4">
              Aucune inscription. Aucune carte bancaire. Aucune trace.
            </p>
          </div>

          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
            <details className="group">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 list-none flex items-center justify-between">
                <span className="font-medium">Vous préférez taper les identifiants vous-même ?</span>
                <svg className="w-3 h-3 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="mt-3 space-y-2">
                <Credential label="Email"        value={DEMO_EMAIL}    mono />
                <Credential label="Mot de passe" value={DEMO_PASSWORD} mono />
                <p className="text-[11px] text-slate-400 pt-2">
                  Utilisez ces identifiants sur la page{' '}
                  <Link href="/pro/login" className="text-blue-900 underline">connexion classique</Link>.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Marche à suivre */}
        <section>
          <h2 className="font-semibold text-xl tracking-tightest text-slate-900 mb-5 tracking-tight">Marche à suivre</h2>
          <ol className="space-y-4">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-4 bg-white border border-slate-200 rounded-xl p-4">
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Sections à explorer */}
        <section>
          <h2 className="font-semibold text-xl tracking-tightest text-slate-900 mb-5 tracking-tight">Toutes les vues à explorer</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {SECTIONS.map(s => (
              <div key={s.route} className="px-5 py-3 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
                <code className="text-[10px] font-mono text-slate-400 shrink-0 mt-1 whitespace-nowrap">{s.route}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Note */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">À savoir</p>
          <ul className="text-sm text-amber-900 leading-relaxed space-y-1 list-disc pl-5">
            <li>La connexion Gmail n&apos;est <strong>pas active</strong> sur ce compte. Pour ingester vos vrais emails, créez votre propre compte gratuit.</li>
            <li>Les boutons Stripe (passer Pro) sont <strong>désactivés</strong> sur le compte démo.</li>
            <li>Le compte est réinitialisé chaque nuit à 3h du matin (heure de Paris).</li>
          </ul>
        </section>

        {/* CTA final */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-600 mb-4">
            Convaincu après exploration ?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pro/login?mode=signup"
              className="text-sm font-medium bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
            >
              Créer mon vrai compte (essai 30 jours)
            </Link>
            <Link
              href="/book"
              className="text-sm font-medium border border-slate-200 hover:border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
            >
              Réserver une démo avec Tim
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}

// ── Composant Credential avec bouton copier ──────────────────────────

function Credential({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }
  return (
    <div className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-sm text-slate-900 break-all ${mono ? 'font-mono' : 'font-medium'}`}>
          {value}
        </p>
      </div>
      <button
        onClick={copy}
        className={`shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-colors ${
          copied
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
        }`}
        type="button"
      >
        {copied ? 'Copié' : 'Copier'}
      </button>
    </div>
  )
}
