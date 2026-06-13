'use client'

import { useEffect, useState, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ScoringResult, QualificationResult } from '@/types'

// ═══════════════════════════════════════════════════════════════════════
//  /pro/prospects — Liste de prospects
//  Table dense bancaire avec filtres pills + tri + recherche + export
// ═══════════════════════════════════════════════════════════════════════

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

const TEMP_CONFIG = {
  cold: { label: 'Non prioritaire', cls: 'bg-slate-100 text-slate-600 border-slate-200',     dot: 'bg-slate-400' },
  warm: { label: 'À qualifier',     cls: 'bg-amber-50 text-amber-700 border-amber-200',      dot: 'bg-amber-500' },
  hot:  { label: 'Prioritaire',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',dot: 'bg-emerald-500' },
} as const

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  new:      { label: 'Nouveau',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  viewed:   { label: 'Vu',       cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  replied:  { label: 'Répondu',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archived: { label: 'Archivé',  cls: 'bg-slate-50 text-slate-400 border-slate-200' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'à l\'instant'
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} h`
  return `${Math.floor(h / 24)} j`
}

function formatAmount(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' €'
}

// ── Mini composants ──

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-[#D1D5DB] tabular-nums font-bold">—</span>

  let color = 'bg-slate-100 text-slate-700 border-slate-200'
  if (score >= 80) color = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  else if (score >= 60) color = 'bg-amber-50 text-amber-700 border-amber-200'
  else if (score >= 40) color = 'bg-blue-50 text-blue-700 border-blue-200'

  return (
    <span className={`inline-flex items-center justify-center w-10 h-7 rounded border text-xs font-extrabold tabular-nums ${color}`}>
      {score}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' }
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function TempPill({ temp }: { temp: 'cold' | 'warm' | 'hot' | null | undefined }) {
  if (!temp) return null
  const cfg = TEMP_CONFIG[temp]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  Page
// ═══════════════════════════════════════════════════════════════════════

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
        .not('status', 'in', '(archived,filtered)')
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

  // ── Export CSV ──
  function exportCsv() {
    const headers = [
      'Date', 'Nom', 'Email', 'Téléphone', 'Score', 'Température', 'Statut',
      'Type bien', 'Localisation', 'Prix', 'Revenus mensuels', 'Apport',
      'Situation pro', 'Description',
    ]
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v)
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = filtered.map(p => {
      const q = p.qualification
      const s = p.scoring
      const dateStr = new Date(p.received_at ?? p.created_at).toLocaleDateString('fr-FR')
      const fullName = [q?.firstName, q?.lastName].filter(Boolean).join(' ') || p.email_from_name || ''
      return [
        dateStr,
        fullName,
        q?.email ?? p.email_from ?? '',
        q?.phone ?? '',
        s?.score ?? '',
        s?.temperature ?? '',
        p.status,
        q?.propertyType ?? '',
        q?.address ?? '',
        q?.price ?? '',
        q?.monthly_income ?? '',
        q?.down_payment ?? '',
        q?.employment_status ?? '',
        q?.description ?? '',
      ].map(escape).join(';')
    })
    const csv = '﻿' + [headers.join(';'), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bankkey-prospects-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Filtres + recherche + tri ──
  const filtered = useMemo(() => {
    let list = prospects

    if (filter === 'new')     list = list.filter(p => p.status === 'new')
    if (filter === 'hot')     list = list.filter(p => p.scoring?.temperature === 'hot')
    if (filter === 'warm')    list = list.filter(p => p.scoring?.temperature === 'warm')
    if (filter === 'replied') list = list.filter(p => p.status === 'replied')

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(p => {
        const name = `${p.qualification?.firstName ?? ''} ${p.qualification?.lastName ?? ''} ${p.email_from_name ?? ''} ${p.email_from ?? ''}`.toLowerCase()
        const desc = (p.qualification?.description ?? p.email_subject ?? '').toLowerCase()
        return name.includes(q) || desc.includes(q)
      })
    }

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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const gmailConnected = !!profile?.gmail_connected_email
  const FILTERS = [
    { key: 'all',     label: 'Tous',          count: counts.all },
    { key: 'new',     label: 'Nouveaux',      count: counts.new },
    { key: 'hot',     label: 'Prioritaires',  count: counts.hot },
    { key: 'warm',    label: 'À qualifier',   count: counts.warm },
    { key: 'replied', label: 'Répondus',      count: counts.replied },
  ] as const

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Header de page ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4 flex-wrap">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Pipeline</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">Prospects</h1>
            <p className="text-xs text-[#6B7280] mt-1.5 tabular-nums">{counts.all} prospects actifs · {counts.hot} prioritaires</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {gmailConnected && (
              <button
                onClick={sync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#D1D5DB] hover:border-navy text-[#374151] hover:text-navy px-3 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {syncing ? (
                  <span className="w-3 h-3 border border-[#D1D5DB] border-t-navy rounded-full animate-spin" />
                ) : (
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
            {filtered.length > 0 && (
              <button
                onClick={exportCsv}
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#D1D5DB] hover:border-navy text-[#374151] hover:text-navy px-3 py-2 rounded-lg transition-all"
                title="Exporter les prospects affichés en CSV"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exporter CSV
              </button>
            )}
            <a href="/pro/prospects/new" className="btn-primary text-xs py-2 px-3">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Ajouter un prospect</span>
              <span className="sm:hidden">Ajouter</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-5">

        {/* Gmail banner */}
        {justConnected && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 flex items-center gap-2 reveal">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span><strong className="font-semibold">Gmail connecté</strong> ({profile?.gmail_connected_email}). Première synchronisation en cours.</span>
          </div>
        )}

        {/* Gmail CTA */}
        {!gmailConnected && (
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-accent rounded-xl p-6 flex items-center justify-between gap-4 shadow-[0_4px_24px_rgba(59,95,224,0.06)]">
            <div>
              <p className="text-sm font-extrabold text-navy mb-1">Connectez votre boîte Gmail pour démarrer</p>
              <p className="text-xs text-[#6B7280]">BankKey analysera vos nouveaux emails automatiquement.</p>
            </div>
            <a href="/pro/onboarding" className="btn-primary text-sm shrink-0">
              Connecter Gmail
            </a>
          </div>
        )}

        {/* Filtres + recherche */}
        {prospects.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">

            {/* Filtres pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    filter === f.key
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-[#6B7280] hover:text-navy hover:bg-[#F3F4F6]'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] font-bold tabular-nums ${
                    filter === f.key ? 'text-blue-200' : 'text-[#9CA3AF]'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search + sort */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#F3F4F6]">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un nom, un email, une description..."
                  className="w-full bg-[#F7F8FA] border border-transparent rounded-md pl-9 pr-3 py-2 text-sm placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:border-accent transition-all"
                />
              </div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as 'recent' | 'score')}
                className="bg-[#F7F8FA] border border-transparent rounded-md px-3 py-2 text-sm font-medium text-[#374151] focus:outline-none focus:bg-white focus:border-accent cursor-pointer"
              >
                <option value="recent">Plus récents</option>
                <option value="score">Score décroissant</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && gmailConnected && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-navy mb-1">
              {prospects.length === 0 ? 'Aucun prospect pour l\'instant' : 'Aucun prospect dans ce filtre'}
            </p>
            <p className="text-xs text-[#6B7280]">
              {prospects.length === 0
                ? 'Cliquez sur "Synchroniser" pour analyser vos emails.'
                : 'Essayez un autre filtre ou modifiez votre recherche.'}
            </p>
          </div>
        )}

        {/* ── Table dense bancaire ── */}
        {filtered.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">

            {/* Header de table */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-[#E5E7EB] bg-[#F7F8FA] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              <div className="col-span-1 text-center">Score</div>
              <div className="col-span-3">Prospect</div>
              <div className="col-span-3">Projet</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">Priorité</div>
              <div className="col-span-1 text-right">Reçu</div>
            </div>

            {/* Lignes */}
            <div className="divide-y divide-[#F3F4F6]">
              {filtered.map((p) => {
                const temp = p.scoring?.temperature ?? null
                const score = p.scoring?.score
                const name = p.qualification?.firstName
                  ? `${p.qualification.firstName}${p.qualification.lastName ? ' ' + p.qualification.lastName : ''}`
                  : p.email_from_name || p.email_from || 'Inconnu'
                const projet = p.qualification?.description ?? p.email_subject ?? ''
                const amount = p.qualification?.price
                const dateStr = p.received_at ?? p.created_at

                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/pro/leads/${p.id}`)}
                    className="w-full md:grid md:grid-cols-12 gap-3 px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors text-left items-center group flex flex-col items-start"
                  >
                    {/* Mobile : tout en stack */}
                    <div className="md:hidden flex items-center gap-3 w-full">
                      <ScoreBadge score={score} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-navy truncate">{name}</p>
                        <p className="text-xs text-[#6B7280] truncate">{projet}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <StatusPill status={p.status} />
                          <TempPill temp={temp} />
                        </div>
                      </div>
                      <span className="text-[10px] text-[#9CA3AF] font-medium tabular-nums shrink-0">{timeAgo(dateStr)}</span>
                    </div>

                    {/* Desktop : grid 12 colonnes */}
                    <div className="hidden md:flex md:col-span-1 justify-center">
                      <ScoreBadge score={score} />
                    </div>

                    <div className="hidden md:block md:col-span-3 min-w-0">
                      <p className="text-sm font-bold text-navy truncate">{name}</p>
                      <p className="text-[11px] text-[#9CA3AF] truncate">{p.qualification?.email ?? p.email_from ?? ''}</p>
                    </div>

                    <div className="hidden md:block md:col-span-3 min-w-0">
                      <p className="text-sm text-[#374151] truncate leading-snug">{projet}</p>
                      {amount && (
                        <p className="text-[11px] font-bold text-navy tabular-nums mt-0.5">{formatAmount(amount)}</p>
                      )}
                    </div>

                    <div className="hidden md:flex md:col-span-2">
                      <StatusPill status={p.status} />
                    </div>

                    <div className="hidden md:flex md:col-span-2">
                      <TempPill temp={temp} />
                    </div>

                    <div className="hidden md:flex md:col-span-1 items-center justify-end gap-2">
                      <span className="text-[11px] text-[#9CA3AF] font-medium tabular-nums">{timeAgo(dateStr)}</span>
                      <svg className="w-3.5 h-3.5 text-[#D1D5DB] group-hover:text-navy transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer table */}
            <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F7F8FA] text-[11px] text-[#6B7280] flex items-center justify-between">
              <span className="tabular-nums">
                {filtered.length} prospect{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
                {filter !== 'all' && ` · filtré "${FILTERS.find(f => f.key === filter)?.label}"`}
              </span>
              {profile?.gmail_last_processed_at && (
                <span className="hidden sm:inline">
                  Dernière sync : {new Date(profile.gmail_last_processed_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ProspectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    }>
      <ProspectsContent />
    </Suspense>
  )
}
