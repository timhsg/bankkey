'use client'

import { useEffect, useState, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ScoringResult, QualificationResult } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Config ─────────────────────────────────────────────────────────────────

const TEMP = {
  cold: { label: 'Non prioritaire', cls: 'bg-slate-100 text-slate-500'   },
  warm: { label: 'À qualifier',     cls: 'bg-amber-50 text-amber-700'    },
  hot:  { label: 'Prioritaire',     cls: 'bg-emerald-50 text-emerald-700' },
} as const

const STATUS_LABEL: Record<string, string> = {
  new: 'Nouveau', viewed: 'Vu', replied: 'Répondu', archived: 'Archivé',
}

const STATUS_COLOR: Record<string, string> = {
  new:      'bg-blue-50 text-blue-700',
  viewed:   'bg-slate-100 text-slate-600',
  replied:  'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-50 text-slate-400',
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

// ── Page ───────────────────────────────────────────────────────────────────

function ProspectsContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  const [profile, setProfile]       = useState<Profile | null>(null)
  const [prospects, setProspects]   = useState<Prospect[]>([])
  const [loading, setLoading]       = useState(true)
  const [syncing, setSyncing]       = useState(false)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<'all' | 'new' | 'hot' | 'warm' | 'replied'>('all')
  const [sort, setSort]             = useState<'recent' | 'score'>('recent')

  const justConnected = searchParams.get('connected') === 'gmail'

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/pro/login'); return }

    const [{ data: profileData }, { data: prospectsData }] = await Promise.all([
      supabase.from('profiles').select('agency_name, gmail_connected_email, gmail_last_processed_at').single(),
      supabase.from('prospects')
        .select('id, email_from_name, email_from, email_subject, received_at, created_at, status, scoring, qualification')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    setProfile(profileData)
    setProspects((prospectsData ?? []) as Prospect[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { void load() }, [load])

  async function sync() {
    setSyncing(true)
    try {
      await fetch('/api/gmail/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Request': 'true' },
        body: JSON.stringify({}),
      })
      await load()
    } finally { setSyncing(false) }
  }

  // ── Recherche + filtre + tri ──
  const filtered = useMemo(() => {
    let list = prospects

    // Filtre
    if (filter === 'new')     list = list.filter(p => p.status === 'new')
    if (filter === 'hot')     list = list.filter(p => p.scoring?.temperature === 'hot')
    if (filter === 'warm')    list = list.filter(p => p.scoring?.temperature === 'warm')
    if (filter === 'replied') list = list.filter(p => p.status === 'replied')

    // Recherche
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(p => {
        const name = `${p.qualification?.firstName ?? ''} ${p.qualification?.lastName ?? ''} ${p.email_from_name ?? ''} ${p.email_from ?? ''}`.toLowerCase()
        const desc = (p.qualification?.description ?? p.email_subject ?? '').toLowerCase()
        return name.includes(q) || desc.includes(q)
      })
    }

    // Tri
    if (sort === 'score') {
      list = [...list].sort((a, b) => (b.scoring?.score ?? 0) - (a.scoring?.score ?? 0))
    }

    return list
  }, [prospects, filter, search, sort])

  const counts = useMemo(() => ({
    all: prospects.length,
    new: prospects.filter(p => p.status === 'new').length,
    hot: prospects.filter(p => p.scoring?.temperature === 'hot').length,
    warm: prospects.filter(p => p.scoring?.temperature === 'warm').length,
    replied: prospects.filter(p => p.status === 'replied').length,
  }), [prospects])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  const gmailConnected = !!profile?.gmail_connected_email

  return (
    <div className="min-h-screen">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Prospects</h1>
            <p className="text-xs text-slate-500 mt-0.5">{counts.all} prospects actifs</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {gmailConnected && (
              <button
                onClick={sync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-2.5 py-1.5 sm:px-3 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Synchroniser"
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
                <span className="hidden sm:inline">{syncing ? 'Synchronisation' : 'Synchroniser'}</span>
              </button>
            )}
            <a
              href="/pro/prospects/new"
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 sm:px-3 rounded-lg transition-base"
              aria-label="Ajouter un prospect"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Ajouter un prospect</span>
            </a>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">

        {/* Gmail banner */}
        {justConnected && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 flex items-center gap-2 animate-fade-up">
            ✓ Gmail connecté ({profile?.gmail_connected_email}). Synchronisation pour analyser vos premiers emails.
          </div>
        )}

        {/* Gmail CTA */}
        {!gmailConnected && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">Connectez votre Gmail pour démarrer</p>
              <p className="text-xs text-slate-500">BankKey analysera vos nouveaux emails entrants automatiquement.</p>
            </div>
            <a
              href="/pro/onboarding"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              Connecter Gmail
            </a>
          </div>
        )}

        {/* Search + filtres */}
        {prospects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un prospect..."
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as 'recent' | 'score')}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="recent">Récents</option>
                <option value="score">Score</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {([
                { key: 'all',     label: 'Tous',          count: counts.all },
                { key: 'new',     label: 'Nouveaux',      count: counts.new },
                { key: 'hot',     label: 'Prioritaires',  count: counts.hot },
                { key: 'warm',    label: 'À qualifier',   count: counts.warm },
                { key: 'replied', label: 'Répondus',      count: counts.replied },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    filter === f.key
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] font-mono ${filter === f.key ? 'text-slate-300' : 'text-slate-400'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && gmailConnected && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-sm text-slate-500">
              {prospects.length === 0
                ? 'Aucun prospect pour l\'instant. Cliquez sur "Synchroniser" pour analyser vos emails.'
                : 'Aucun prospect dans ce filtre.'}
            </p>
          </div>
        )}

        {/* Liste — table dense */}
        {filtered.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {filtered.map((prospect, idx) => {
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
                  className={`w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  {/* Score */}
                  <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0"
                       style={{ borderColor: temp === 'hot' ? '#6ee7b7' : temp === 'warm' ? '#fcd34d' : '#e2e8f0' }}>
                    <span className="text-xs font-bold text-slate-800">{score ?? '?'}</span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-900 truncate">{name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_COLOR[prospect.status]}`}>
                        {STATUS_LABEL[prospect.status]}
                      </span>
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
                    <span className="text-[10px] text-slate-400 font-mono">{timeAgo(dateStr)}</span>
                  </div>

                  {/* Chevron */}
                  <svg className="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}

export default function ProspectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    }>
      <ProspectsContent />
    </Suspense>
  )
}
