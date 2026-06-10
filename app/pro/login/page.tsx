'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogoMark } from '@/app/_components/Logo'

// ════════════════════════════════════════════════════════════════════════
//  /pro/login — Connexion / Inscription / Reset
//  Design pro inspiré Stripe : centré, sobre, sans floritures
// ════════════════════════════════════════════════════════════════════════

type Mode = 'login' | 'signup' | 'reset'

function LoginInner() {
  const searchParams = useSearchParams()
  const initialMode: Mode =
    searchParams.get('mode') === 'signup' ? 'signup' :
    searchParams.get('mode') === 'reset'  ? 'reset'  :
    'login'

  const urlError = searchParams.get('error')

  const [mode, setMode]         = useState<Mode>(initialMode)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage]   = useState<{ type: 'error' | 'info'; text: string } | null>(
    urlError === 'oauth_failed'
      ? { type: 'error', text: 'La connexion Google a échoué. Réessayez ou utilisez votre email.' }
      : null,
  )

  const supabase = createClient()

  async function handleGoogle() {
    setGoogleLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setMessage({ type: 'error', text: 'Impossible de démarrer la connexion Google.' })
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: 'Email ou mot de passe incorrect.' })
      } else {
        window.location.href = '/pro'
      }
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/pro/login?mode=update`,
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'info', text: 'Si un compte existe, un email de réinitialisation vient d\'être envoyé.' })
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.session) {
        try { await fetch('/api/email/welcome', { method: 'POST' }) } catch {}
        window.location.href = '/pro/onboarding'
      } else {
        setMessage({ type: 'info', text: 'Vérifiez votre email pour confirmer votre compte.' })
      }
    }

    setLoading(false)
  }

  const isLogin  = mode === 'login'
  const isSignup = mode === 'signup'
  const isReset  = mode === 'reset'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header sobre */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold text-slate-900">BankKey</span>
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Accueil
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-[400px]">

          {/* Titre + sous-titre */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] sm:text-3xl font-semibold text-slate-900 tracking-tighter mb-2 leading-tight">
              {isReset  ? 'Mot de passe oublié' :
               isSignup ? 'Créer votre compte' :
                          'Connexion'}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isReset  ? 'On vous envoie un lien sécurisé pour le réinitialiser.' :
               isSignup ? 'Essai gratuit 30 jours. Sans carte bancaire.' :
                          'Accédez à votre espace BankKey.'}
            </p>
          </div>

          {/* Carte formulaire */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-7 sm:p-8">

            {/* Google OAuth */}
            {!isReset && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {googleLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  ) : (
                    <GoogleLogo />
                  )}
                  <span>{googleLoading ? 'Redirection...' : `Continuer avec Google`}</span>
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-medium text-slate-500">ou avec votre email</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="vous@cabinet-courtage.fr"
                  autoComplete="email"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-colors"
                />
              </div>

              {!isReset && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Mot de passe
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setMessage(null) }}
                        className="text-xs text-blue-900 hover:text-blue-700 hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={isSignup ? 8 : 6}
                    placeholder={isSignup ? 'Au moins 8 caractères' : ''}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-colors"
                  />
                </div>
              )}

              {message && (
                <div
                  role="alert"
                  className={`text-xs px-3 py-2.5 rounded-lg border ${
                    message.type === 'error'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
              >
                {loading ? '...' :
                  isLogin  ? 'Se connecter' :
                  isReset  ? 'Envoyer le lien' :
                             'Créer le compte'}
              </button>
            </form>

            {/* Mentions légales en signup */}
            {isSignup && (
              <p className="text-[11px] text-slate-500 mt-5 leading-relaxed text-center">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/terms" className="text-slate-700 hover:underline">conditions générales</Link>
                {' '}et notre{' '}
                <Link href="/privacy" className="text-slate-700 hover:underline">politique de confidentialité</Link>.
              </p>
            )}
          </div>

          {/* Bascule login / signup / retour */}
          {!isReset ? (
            <p className="text-center text-sm text-slate-600 mt-6">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              {' '}
              <button
                onClick={() => { setMode(isLogin ? 'signup' : 'login'); setMessage(null) }}
                className="text-blue-900 hover:text-blue-700 font-medium hover:underline"
              >
                {isLogin ? "Créer un compte" : "Se connecter"}
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-slate-600 mt-6">
              <button
                onClick={() => { setMode('login'); setMessage(null) }}
                className="text-blue-900 hover:text-blue-700 font-medium hover:underline"
              >
                ← Retour à la connexion
              </button>
            </p>
          )}

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-8 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Chiffré AES-256
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
              Conforme RGPD
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Hébergé en UE
            </span>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} BankKey</span>
          <div className="flex items-center gap-5">
            <Link href="/security" className="hover:text-slate-900">Sécurité</Link>
            <Link href="/privacy" className="hover:text-slate-900">Confidentialité</Link>
            <Link href="/terms" className="hover:text-slate-900">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  )
}

// ── Google Logo officiel ──────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}
