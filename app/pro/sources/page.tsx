'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  SOURCE_CATALOG,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type SourceCategory,
  type SourceDefinition,
} from '@/lib/sources/catalog'
import { SOURCE_ICONS } from '@/lib/sources/icons'

interface Profile {
  forwarding_address: string | null
  gmail_connected_email: string | null
  connected_sources: Record<string, unknown> | null
}

export default function SourcesPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('forwarding_address, gmail_connected_email, connected_sources')
        .single()

      setProfile(data)
      setLoading(false)
    }
    void load()
  }, [supabase, router])

  function copyForwarding() {
    if (!profile?.forwarding_address) return
    navigator.clipboard.writeText(profile.forwarding_address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  const categories: SourceCategory[] = ['email', 'aggregator', 'portal', 'crm', 'direct']

  function isConnected(s: SourceDefinition): boolean {
    if (s.id === 'gmail')     return !!profile?.gmail_connected_email
    if (s.id === 'forwarding') return !!profile?.forwarding_address
    return false
  }

  return (
    <div className="min-h-screen">

      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base font-semibold text-slate-900 tracking-tight pl-12 lg:pl-0">Sources de leads</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── Adresse de forwarding (la solution universelle) ── */}
        {profile?.forwarding_address && (
          <div className="bg-slate-900 text-white rounded-2xl overflow-hidden transition-shadow hover:shadow-xl">
            <div className="px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Votre adresse BankKey</p>
              <p className="text-xl font-mono font-semibold tracking-tight mb-3 break-all">{profile.forwarding_address}</p>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Faites suivre n&apos;importe quel email (Empruntis, SeLoger, partenaires, contacts directs) à cette adresse — BankKey analyse et qualifie automatiquement chaque lead.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={copyForwarding}
                  className="text-xs bg-white hover:bg-slate-100 text-slate-900 font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  {copied ? 'Copié dans le presse-papiers' : 'Copier l\'adresse'}
                </button>
                <span className="text-[11px] text-slate-500">
                  Inactive — configuration en cours
                </span>
              </div>
            </div>
            <div className="bg-slate-800 px-6 py-3 text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Comment ça marche :</span> dans votre boîte mail source (Gmail, Outlook, etc.) ou dans la plateforme (Empruntis, SeLoger), créez une règle qui forwarde tous les emails reçus vers cette adresse. BankKey reçoit, filtre et qualifie.
            </div>
          </div>
        )}

        {/* ── Catégories de sources ── */}
        {categories.map((cat) => {
          const sources = SOURCE_CATALOG.filter(s => s.category === cat)
          return (
            <div key={cat}>
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">{CATEGORY_LABELS[cat]}</h2>
                <p className="text-xs text-slate-500">{CATEGORY_DESCRIPTIONS[cat]}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sources.map(s => (
                  <SourceCard
                    key={s.id}
                    source={s}
                    connected={isConnected(s)}
                    onConnect={() => {
                      if (s.id === 'gmail') router.push('/pro/onboarding')
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}

      </main>
    </div>
  )
}

// ── Card ────────────────────────────────────────────────────────────

function SourceCard({ source, connected, onConnect }: {
  source: SourceDefinition
  connected: boolean
  onConnect: () => void
}) {
  const isComing = source.status === 'coming_soon'

  return (
    <div className={`bg-white border rounded-xl p-4 transition-all duration-200 ${
      connected
        ? 'border-emerald-300 bg-emerald-50/30'
        : isComing
          ? 'border-slate-200 opacity-60'
          : 'border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-sm'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
          {(() => {
            const Icon = SOURCE_ICONS[source.id]
            return Icon ? <Icon className="w-6 h-6" /> : (
              <span className="text-[11px] font-bold text-slate-700">
                {source.name.slice(0, 2).toUpperCase()}
              </span>
            )
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{source.name}</h3>
            {connected && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Connecté
              </span>
            )}
            {source.status === 'beta' && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Bêta
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{source.description}</p>
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100">
        {connected ? (
          <span className="text-xs font-medium text-emerald-700">✓ Actif</span>
        ) : source.status === 'available' ? (
          <button
            onClick={onConnect}
            className="text-xs font-medium text-slate-900 hover:text-slate-600 transition-colors"
          >
            Connecter →
          </button>
        ) : source.status === 'forwarding' ? (
          <span className="text-[11px] text-slate-500">Faites suivre vers votre adresse BankKey ↑</span>
        ) : source.status === 'beta' ? (
          <span className="text-[11px] text-blue-600">Nous contacter pour l&apos;accès</span>
        ) : (
          <span className="text-[11px] text-slate-400">Bientôt disponible</span>
        )}
      </div>
    </div>
  )
}
