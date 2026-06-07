'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ScoringResult, QualificationResult } from '@/types'
import { Suspense } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Prospect {
  id: string
  email_from_name: string | null
  email_from: string | null
  email_subject: string | null
  received_at: string | null
  created_at: string
  status: 'new' | 'viewed' | 'replied' | 'archived'
  scoring: ScoringResult | null
  qualification: QualificationResult | null
}

interface Profile {
  agency_name: string | null
  gmail_connected_email: string | null
  gmail_last_processed_at: string | null
}

// ── Config couleurs ────────────────────────────────────────────────────────────

const TEMP = {
  cold: { label: 'Non prioritaire', cls: 'bg-slate-100 text-slate-500' },
  warm: { label: 'À qualifier',     cls: 'bg-amber-50 text-amber-700'  },
  hot:  { label: 'Prioritaire',     cls: 'bg-emerald-50 text-emerald-700' },
} as const

const STATUS_LABEL: Record<string, string> = {
  new:      'Nouveau',
  viewed:   'Vu',
  replied:  'Répondu',
  archived: 'Archivé',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'À l\'instant'
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}j`
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function DashboardContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  const [profile,    setProfile]    = useState<Profile | null>(null)
  const [prospects,  setProspects]  = useState<Prospect[]>([])
  const [loading,    setLoading]    = useState(true)
  const [syncing,    setSyncing]    = useState(false)
  const [filter,     setFilter]     = useState<'all' | 'new' | 'hot'>('all')

  const justConnected = searchParams.get('connected') === 'gmail'

  // ── Chargement des données ────────────────────────────────────────────────

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/pro/login'); return }

    const [{ data: profileData }, { data: prospectsData }] = await Promise.all([
      supabase.from('profiles').select('agency_name, gmail_connected_email, gmail_last_processed_at').single(),
      supabase.from('prospects')
        .select('id, email_from_name, email_from, email_subject, received_at, created_at, status, scoring, qualification')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    setProfile(profileData)
    setProspects((prospectsData ?? []) as Prospect[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { void load() }, [load])

  // ── Synchronisation manuelle ──────────────────────────────────────────────

  async function sync() {
    setSyncing(true)
    try {
      await fetch('/api/gmail/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Request': 'true',
        },
        body: JSON.stringify({}),
      })
      await load()
    } finally {
      setSyncing(false)
    }
  }

  // ── Déconnexion ───────────────────────────────────────────────────────────

  async function logout() {
    await supabase.auth.signOut()
    router.push('/pro/login')
  }

  // ── Filtres ───────────────────────────────────────────────────────────────

  const filtered = prospects.filter(p => {
    if (filter === 'new') return p.status === 'new'
    if (filter === 'hot') return p.scoring?.temperature === 'hot'
    return true
  })

  const counts = {
    new: prospects.filter(p => p.status === 'new').length,
    hot: prospects.filter(p => p.scoring?.temperature === 'hot').length,
    warm: prospects.filter(p => p.scoring?.temperature === 'warm').length,
    replied: prospects.filter(p => p.status === 'replied').length,
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const newToday = prospects.filter(p => {
    const d = new Date(p.received_at ?? p.created_at)
    return d >= today
  }).length

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  const gmailConnected = !!profile?.gmail_connected_email

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <a href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold tracking-tighter">BK</span>
              </div>
              <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
            </a>
            <span className="text-slate-200">|</span>
            <span className="text-xs font-medium text-slate-500">Tableau de bord</span>
          </div>
          <div className="flex items-center gap-4">
            {gmailConnected && (
              <button
                onClick={sync}
                disabled={syncing}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                {syncing
                  ? <span className="w-3 h-3 border border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                  : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 21v-5h5" />
                    </svg>
                  )}
                {syncing ? 'Synchronisation...' : 'Synchroniser'}
              </button>
            )}
            <a href="/pro/settings" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
              Mon profil
            </a>
            <a href="/pro/billing" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
              Abonnement
            </a>
            <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 space-y-5">

        {/* ── Bannière connexion Gmail réussie ── */}
        {justConnected && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 flex items-center gap-2 animate-fade-up">
            ✓ Gmail connecté — {profile?.gmail_connected_email}. Cliquez sur "Sync Gmail" pour analyser vos premiers emails.
          </div>
        )}

        {/* ── CTA : connecter Gmail ── */}
        {!gmailConnected && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center animate-fade-up">
            <p className="text-slate-600 text-sm mb-4">
              Connectez votre Gmail pour analyser automatiquement vos prospects entrants.
            </p>
            <a
              href="/pro/onboarding"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Connecter Gmail →
            </a>
          </div>
        )}

        {/* ── Stats ── */}
        {prospects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Aujourd\'hui', value: newToday, sub: 'nouveaux' },
              { label: 'Prioritaires', value: counts.hot, sub: 'à traiter', accent: counts.hot > 0 ? 'text-emerald-600' : 'text-slate-900' },
              { label: 'À qualifier', value: counts.warm, sub: 'tièdes' },
              { label: 'Répondus', value: counts.replied, sub: 'cette période' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-semibold tracking-tight mt-1 ${stat.accent ?? 'text-slate-900'}`}>{stat.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filtres ── */}
        {prospects.length > 0 && (
          <div className="flex items-center gap-2">
            {([
              { key: 'all',  label: `Tous (${prospects.length})` },
              { key: 'new',  label: `Nouveaux (${counts.new})` },
              { key: 'hot',  label: `Prioritaires (${counts.hot})` },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === f.key
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Liste des prospects ── */}
        {filtered.length === 0 && gmailConnected && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-500">
              {prospects.length === 0
                ? 'Aucun prospect pour l\'instant. Synchronisez pour analyser vos emails entrants.'
                : 'Aucun prospect dans ce filtre.'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map(prospect => {
            const temp     = prospect.scoring?.temperature
            const tempCfg  = temp ? TEMP[temp] : null
            const score    = prospect.scoring?.score
            const name     = prospect.qualification?.firstName
              ? `${prospect.qualification.firstName}${prospect.qualification.lastName ? ' ' + prospect.qualification.lastName : ''}`
              : prospect.email_from_name || prospect.email_from || 'Inconnu'
            const desc     = prospect.qualification?.description ?? prospect.email_subject ?? ''
            const dateStr  = prospect.received_at ?? prospect.created_at

            return (
              <button
                key={prospect.id}
                onClick={() => router.push(`/pro/leads/${prospect.id}`)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5
                           flex items-center gap-4 text-left transition-colors group"
              >
                {/* Score */}
                <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center shrink-0"
                     style={{ borderColor: temp === 'hot' ? '#6ee7b7' : temp === 'warm' ? '#fcd34d' : '#e2e8f0' }}>
                  <span className="text-sm font-bold text-slate-800">{score ?? '?'}</span>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-800 truncate">{name}</span>
                    {prospect.status === 'new' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{desc}</p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {tempCfg && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tempCfg.cls}`}>
                      {tempCfg.label}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{timeAgo(dateStr)}</span>
                </div>
              </button>
            )
          })}
        </div>

      </main>
    </div>
  )
}

export default function ProDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
