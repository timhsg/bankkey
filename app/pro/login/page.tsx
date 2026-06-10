'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════
//  /pro/login — 2 colonnes : panneau brandé navy + formulaire blanc
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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
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
        setMessage({ type: 'info', text: 'Si un compte existe, un email vient d\'être envoyé.' })
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.session) {
        // Pré-remplir le profil avec le nom
        try {
          await supabase
            .from('profiles')
            .update({
              broker_memory: {
                fullName: `${firstName} ${lastName}`.trim(),
                updatedAt: new Date().toISOString(),
              },
            })
            .eq('id', data.session.user.id)
        } catch {}
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
    <div className="min-h-screen lg:grid lg:grid-cols-5 bg-slate-50">

      {/* ═══════ Colonne brandée navy ═══════ */}
      <aside className="hidden lg:flex lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white p-12 flex-col justify-between">

        {/* Halos */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <KeyIcon />
          </div>
          <span className="font-semibold tracking-tight">BankKey</span>
        </Link>

        {/* Pitch */}
        <div className="relative space-y-8">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight">
            Vos prospects qualifiés, prêts pour la banque.
          </h2>
          <p className="text-blue-100/80 leading-relaxed text-sm max-w-md">
            BankKey lit vos emails entrants, extrait le profil emprunteur et prépare votre réponse en moins d&apos;une minute. Vous gardez la main.
          </p>

          <div className="space-y-3 pt-4">
            {[
              { icon: <ShieldIcon />, text: 'Lecture seule de votre Gmail, jamais d\'envoi en votre nom' },
              { icon: <LockIcon />,   text: 'Chiffrement AES-256, hébergement à Francfort' },
              { icon: <GavelIcon />,  text: 'Conformité RGPD, isolation par cabinet' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="w-7 h-7 rounded-md bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </span>
                <span className="text-blue-100/90 pt-1">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer pilote */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-emerald-200 bg-emerald-500/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Programme pilote 2026
          </div>
          <p className="text-[11px] text-blue-200/60 mt-4">
            © {new Date().getFullYear()} BankKey
          </p>
        </div>
      </aside>

      {/* ═══════ Colonne formulaire ═══════ */}
      <main className="lg:col-span-3 flex flex-col min-h-screen lg:min-h-0">

        {/* Header mobile */}
        <div className="lg:hidden border-b border-slate-200 bg-white px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-900 flex items-center justify-center">
              <KeyIcon />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm">BankKey</span>
          </Link>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900">Accueil</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-16">
          <div className="w-full max-w-sm">

            <div className="mb-7">
              <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight mb-2 leading-tight">
                {isReset  ? 'Mot de passe oublié' :
                 isSignup ? 'Créer votre compte' :
                            'Bon retour parmi nous'}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isReset  ? 'Entrez votre email professionnel, on vous envoie un lien.' :
                 isSignup ? 'Essai gratuit 30 jours, sans carte bancaire.' :
                            'Connectez-vous à votre espace BankKey.'}
              </p>
            </div>

            {/* Tabs */}
            {!isReset && (
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
                {(['login', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setMessage(null) }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      mode === m
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m === 'login' ? 'Connexion' : 'Créer un compte'}
                  </button>
                ))}
              </div>
            )}

            {/* Google OAuth */}
            {!isReset && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-900 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {googleLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  ) : (
                    <GoogleLogo />
                  )}
                  {googleLoading ? 'Redirection...' : (isSignup ? 'S\'inscrire avec Google' : 'Continuer avec Google')}
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">ou</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* Nom & prénom uniquement en signup */}
              {isSignup && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1.5 block">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                      placeholder="Marie"
                      autoComplete="given-name"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1.5 block">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                      placeholder="Lefèvre"
                      autoComplete="family-name"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1.5 block">
                  Email professionnel
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="vous@cabinet-courtage.fr"
                  autoComplete="email"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                />
              </div>

              {!isReset && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-medium text-slate-600">
                      Mot de passe
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setMessage(null) }}
                        className="text-[11px] text-slate-500 hover:text-slate-900"
                      >
                        Oublié ?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={isSignup ? 8 : 6}
                    placeholder={isSignup ? 'Au moins 8 caractères' : '••••••••'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>
              )}

              {message && (
                <div className={`text-xs px-3 py-2 rounded-lg ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
              >
                {loading ? '...' :
                  isLogin  ? 'Se connecter' :
                  isReset  ? 'Envoyer le lien' :
                             'Créer mon compte'}
              </button>
            </form>

            {isReset && (
              <p className="text-center mt-5">
                <button
                  onClick={() => { setMode('login'); setMessage(null) }}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  ← Retour à la connexion
                </button>
              </p>
            )}

            {isSignup && (
              <p className="text-[11px] text-slate-500 mt-5 leading-relaxed text-center">
                En créant un compte vous acceptez nos{' '}
                <Link href="/terms" className="text-slate-700 underline hover:text-slate-900">conditions générales</Link>
                {' '}et notre{' '}
                <Link href="/privacy" className="text-slate-700 underline hover:text-slate-900">politique de confidentialité</Link>.
              </p>
            )}

            <div className="mt-10 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <Link href="/" className="hover:text-slate-700">← Accueil</Link>
              <Link href="/security" className="hover:text-slate-700">Sécurité &amp; RGPD</Link>
            </div>
          </div>
        </div>
      </main>
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

// ── Icons ──────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <line x1="10.85" y1="12.15" x2="19" y2="4" />
      <line x1="18" y1="5" x2="20" y2="7" />
      <line x1="15" y1="8" x2="17" y2="10" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function GavelIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 13L8 7" />
      <path d="M16 19l-7-7" />
      <path d="M5 22h14" />
      <path d="M3.5 13.5L9 8" />
      <path d="M9 19l5-5" />
      <path d="M15 8l3 3" />
    </svg>
  )
}
