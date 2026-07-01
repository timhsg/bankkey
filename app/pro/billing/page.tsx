'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/app/_components/CurrencyContext'

interface Profile {
  email: string
  subscription_plan: 'trial' | 'pro'
  subscription_status: string | null
  trial_ends_at: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
}

function BillingContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()
  const { format, getPrice } = useCurrency()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const success  = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('email, subscription_plan, subscription_status, trial_ends_at, current_period_end, cancel_at_period_end, stripe_customer_id')
        .single()

      setProfile(data)
      setLoading(false)
    }
    void load()
  }, [supabase, router])

  async function startCheckout() {
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ?? 'La redirection vers le paiement a échoué. Réessayez.')
    } catch {
      setError('Erreur réseau. Réessayez dans un instant.')
    } finally {
      setSubmitting(false)
    }
  }

  async function openPortal() {
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ?? 'Impossible d\'ouvrir le portail de facturation. Réessayez.')
    } catch {
      setError('Erreur réseau. Réessayez dans un instant.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  const isTrial = profile.subscription_plan === 'trial'
  const isPro   = profile.subscription_plan === 'pro'
  const trialDaysLeft = profile.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Configuration</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">Abonnement</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 space-y-6">

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Confirmation paiement */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Abonnement activé</p>
              <p className="text-xs text-emerald-700 mt-0.5">Bienvenue dans BankKey Pro. L&apos;activation peut prendre quelques secondes.</p>
            </div>
          </div>
        )}

        {canceled && (
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-sm text-slate-700">Paiement annulé. Vous pouvez réessayer à tout moment.</p>
          </div>
        )}

        {/* En-tête */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Abonnement</p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Plan actuel</h1>
        </div>

        {/* État de l'abonnement */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-lg font-semibold text-slate-900">
                  {isPro ? 'BankKey Pro' : 'Essai gratuit'}
                </h2>
                {isPro && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Actif
                  </span>
                )}
                {isTrial && trialDaysLeft > 0 && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    {trialDaysLeft} j restants
                  </span>
                )}
                {isTrial && trialDaysLeft === 0 && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                    Expiré
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isPro && `${format(getPrice('pro'))} par mois`}
                {isTrial && trialDaysLeft > 0 && `Accès complet jusqu'au ${new Date(profile.trial_ends_at!).toLocaleDateString('fr-FR')}`}
                {isTrial && trialDaysLeft === 0 && 'Passez à Pro pour continuer à utiliser BankKey'}
              </p>
            </div>
            {isPro ? (
              <button
                onClick={openPortal}
                disabled={submitting}
                className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Gérer
              </button>
            ) : (
              <button
                onClick={startCheckout}
                disabled={submitting}
                className="text-xs bg-navy hover:opacity-90 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                {submitting ? '...' : 'Passer à Pro'}
              </button>
            )}
          </div>

          {isPro && profile.current_period_end && (
            <div className="px-6 py-4 bg-slate-50/40 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {profile.cancel_at_period_end
                  ? `Abonnement annulé — accès jusqu'au ${new Date(profile.current_period_end).toLocaleDateString('fr-FR')}`
                  : `Prochain prélèvement le ${new Date(profile.current_period_end).toLocaleDateString('fr-FR')}`}
              </span>
            </div>
          )}
        </div>

        {/* CTA Pro si trial */}
        {isTrial && (
          <div className="bg-navy text-white rounded-2xl p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Passer à Pro</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-semibold tracking-tight">{format(getPrice('pro'))}</span>
              <span className="text-sm text-slate-400">/ mois</span>
            </div>
            <ul className="space-y-2 mb-6 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                Volume illimité de leads
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                Mémoire courtier complète
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                Export CSV + webhook API
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                Support prioritaire
              </li>
            </ul>
            <button
              onClick={startCheckout}
              disabled={submitting}
              className="block w-full text-center py-3 text-sm font-medium bg-white hover:bg-slate-100 disabled:bg-slate-300 text-slate-900 rounded-lg transition-colors"
            >
              {submitting ? 'Redirection vers Stripe...' : 'Passer à Pro maintenant'}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              30 jours d&apos;essai supplémentaires inclus · Annulation en un clic
            </p>
          </div>
        )}

        {/* Email */}
        <div className="text-xs text-slate-400 text-center">
          Connectée en tant que <span className="font-medium text-slate-600">{profile.email}</span>
        </div>
      </main>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-navy rounded-full animate-spin" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
