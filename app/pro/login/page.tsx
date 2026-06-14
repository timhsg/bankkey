'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogoMark, Wordmark } from '@/app/_components/Logo'

// ─────────────────────────────────────────────────────────────
// /pro/login — split 2 colonnes
// Gauche : promo BankKey avec gradient brand
// Droite : formulaire propre, Google OAuth en haut
// ─────────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-white">

      {/* ═══════════ Colonne promo (gauche) — fixée pour ne plus bouger ═══════════ */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-1/2 relative overflow-hidden text-white p-12 flex-col justify-between bg-brand-gradient">

        {/* Halos décoratifs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-32 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center z-10">
          <Wordmark size={28} tone="onDark" />
        </Link>

        {/* Pitch */}
        <div className="relative space-y-8 z-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">
              Pour les courtiers en crédit
            </p>
            <h2 className="text-4xl font-extrabold tracking-tightest leading-[1.05] mb-5">
              Le premier courtier à répondre décroche le dossier.
            </h2>
            <p className="text-blue-100 leading-relaxed text-base max-w-md">
              BankKey centralise vos demandes de financement, qualifie chaque prospect et prépare votre réponse — avant même que vous arriviez au bureau.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { metric: '< 5 min', label: 'Réponse initiale à chaque prospect' },
              { metric: '−80 %',   label: 'Temps de qualification' },
              { metric: '×2',      label: 'Dossiers traités par semaine' },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-4 border-l-2 border-white/20 pl-5">
                <p className="text-3xl font-extrabold tracking-tightest text-white">{s.metric}</p>
                <p className="text-sm text-blue-100/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer pilote */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Programme pilote 2026 · 50 places
          </div>
          <p className="text-xs text-blue-200/60 mt-4">
            © {new Date().getFullYear()} BankKey — France & Suisse
          </p>
        </div>
      </aside>

      {/* ═══════════ Colonne formulaire (droite) ═══════════ */}
      <main className="flex flex-col min-h-screen lg:ml-[50%]">

        {/* Header mobile */}
        <div className="lg:hidden border-b border-[#E5E7EB] bg-white px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Wordmark size={22} />
          </Link>
          <Link href="/" className="text-xs text-[#6B7280] hover:text-navy">Accueil</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-[#0A0F1E] tracking-tightest mb-2 leading-tight">
                {isReset  ? 'Mot de passe oublié' :
                 isSignup ? 'Créer votre compte' :
                            'Connectez-vous'}
              </h1>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {isReset  ? 'Entrez votre email professionnel, on vous envoie un lien.' :
                 isSignup ? 'Essai gratuit 30 jours · Aucune carte bancaire.' :
                            'Accédez à votre espace BankKey.'}
              </p>
            </div>

            {/* Tabs */}
            {!isReset && (
              <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-lg mb-6">
                {(['login', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setMessage(null) }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                      mode === m
                        ? 'bg-white text-navy shadow-sm'
                        : 'text-[#6B7280] hover:text-navy'
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
                  className="w-full flex items-center justify-center gap-3 bg-white border border-[#D1D5DB] hover:border-navy hover:bg-[#F7F8FA] disabled:opacity-50 text-[#0A0F1E] font-semibold px-4 py-3 rounded-lg transition-all text-sm"
                >
                  {googleLoading ? (
                    <span className="w-4 h-4 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
                  ) : (
                    <GoogleLogo />
                  )}
                  {googleLoading ? 'Redirection...' : (isSignup ? 'S\'inscrire avec Google' : 'Continuer avec Google')}
                </button>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                  <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">ou avec votre email</span>
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                </div>
              </>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {isSignup && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" value={firstName} onChange={setFirstName} required placeholder="Marie" autoComplete="given-name" />
                  <Field label="Nom"    value={lastName}  onChange={setLastName}  required placeholder="Lefèvre" autoComplete="family-name" />
                </div>
              )}

              <Field
                label="Email professionnel"
                type="email"
                value={email}
                onChange={setEmail}
                required
                placeholder="vous@cabinet-courtage.fr"
                autoComplete="email"
              />

              {!isReset && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#374151]">
                      Mot de passe
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setMessage(null) }}
                        className="text-xs font-medium text-accent hover:text-navy transition-colors"
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
                    className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
              )}

              {message && (
                <div className={`text-sm px-3.5 py-2.5 rounded-lg border ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50"
              >
                {loading ? 'Chargement...' :
                  isLogin  ? 'Se connecter' :
                  isReset  ? 'Envoyer le lien' :
                             'Créer mon compte'}
              </button>
            </form>

            {isReset && (
              <p className="text-center mt-5">
                <button
                  onClick={() => { setMode('login'); setMessage(null) }}
                  className="text-sm text-[#6B7280] hover:text-navy transition-colors font-medium"
                >
                  ← Retour à la connexion
                </button>
              </p>
            )}

            {isSignup && (
              <p className="text-xs text-[#9CA3AF] mt-5 leading-relaxed text-center">
                En créant un compte vous acceptez nos{' '}
                <Link href="/terms" className="text-[#374151] underline hover:text-navy">conditions générales</Link>
                {' '}et notre{' '}
                <Link href="/privacy" className="text-[#374151] underline hover:text-navy">politique de confidentialité</Link>.
              </p>
            )}

            <div className="mt-10 pt-5 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#9CA3AF]">
              <Link href="/" className="hover:text-navy transition-colors">← Accueil</Link>
              <Link href="/security" className="hover:text-navy transition-colors">Sécurité & RGPD</Link>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  )
}

// ── Composants ─────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = 'text', required, placeholder, autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#374151] mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
      />
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}
