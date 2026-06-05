'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [mode,     setMode]     = useState<'login' | 'signup'>('login')
  const [loading,  setLoading]  = useState(false)
  const [message,  setMessage]  = useState<{ type: 'error' | 'info'; text: string } | null>(null)

  const supabase = createClient()

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
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'info', text: 'Vérifiez votre email pour confirmer votre compte.' })
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">BankKey</h1>
          <p className="text-sm text-slate-500 mt-1">Espace courtier</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex gap-2 mb-6">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setMessage(null) }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  mode === m
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {m === 'login' ? 'Connexion' : 'Créer un compte'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="vous@agence.fr"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {message && (
              <p className={`text-xs px-3 py-2 rounded-lg ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300
                         text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-xs text-slate-400 hover:text-slate-600">
            ← Retour à la démo
          </a>
        </p>
      </div>
    </div>
  )
}
