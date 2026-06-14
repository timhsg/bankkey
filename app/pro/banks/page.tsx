'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ScoringResult, QualificationResult } from '@/types'

// ═══════════════════════════════════════════════════════════════════════
//  /pro/banks — Suivi banques
//  Layout : 1 LIGNE PAR PROSPECT, badges synthétiques par statut bancaire
//  + bouton "Voir détail" qui ouvre la fiche prospect avec onglet Banques
// ═══════════════════════════════════════════════════════════════════════

interface BankSubmission {
  name: string
  submitted_at?: string
  status?: 'pending' | 'accepted' | 'rejected' | 'counter'
  rate?: number
  notes?: string
}

interface Prospect {
  id: string
  email_from_name: string | null
  bank_submitted: BankSubmission[] | null
  scoring: ScoringResult | null
  qualification: QualificationResult | null
  status: string
  created_at: string
}

const STATUS = {
  pending:  { label: 'En attente',   cls: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500'   },
  counter:  { label: 'Contre-offre', cls: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-500'    },
  accepted: { label: 'Accordé',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',dot: 'bg-emerald-500' },
  rejected: { label: 'Refusé',       cls: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-500'     },
} as const

type StatusKey = keyof typeof STATUS

interface ProspectRow {
  prospect: Prospect
  pending: BankSubmission[]
  counter: BankSubmission[]
  accepted: BankSubmission[]
  rejected: BankSubmission[]
  total: number
  bestRate: number | null
  latestActivity: number | null
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (d < 1) return 'aujourd\'hui'
  if (d < 30) return `${d} j`
  return `${Math.floor(d / 30)} mo`
}

export default function BanksPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<'all' | StatusKey>('all')
  const [search, setSearch]       = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/pro/login'); return }

    const { data } = await supabase
      .from('prospects')
      .select('id, email_from_name, bank_submitted, scoring, qualification, status, created_at')
      .not('status', 'in', '(archived,filtered)')
      .order('received_at', { ascending: false, nullsFirst: false })

    setProspects((data ?? []) as Prospect[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { void load() }, [load])

  // Une ligne par prospect, banques regroupées par statut
  const rows: ProspectRow[] = useMemo(() => {
    const result: ProspectRow[] = []
    for (const p of prospects) {
      if (!p.bank_submitted || p.bank_submitted.length === 0) continue

      const pending:  BankSubmission[] = []
      const counter:  BankSubmission[] = []
      const accepted: BankSubmission[] = []
      const rejected: BankSubmission[] = []
      let bestRate: number | null = null
      let latestActivity: number | null = null

      for (const b of p.bank_submitted) {
        const s = (b.status ?? 'pending') as StatusKey
        if (s === 'accepted')      accepted.push(b)
        else if (s === 'rejected') rejected.push(b)
        else if (s === 'counter')  counter.push(b)
        else                       pending.push(b)

        if (b.rate && (bestRate === null || b.rate < bestRate)) bestRate = b.rate
        if (b.submitted_at) {
          const t = new Date(b.submitted_at).getTime()
          if (!latestActivity || t > latestActivity) latestActivity = t
        }
      }

      result.push({
        prospect: p,
        pending, counter, accepted, rejected,
        total: pending.length + counter.length + accepted.length + rejected.length,
        bestRate,
        latestActivity,
      })
    }
    return result
  }, [prospects])

  // Filtre + recherche
  const filtered = useMemo(() => {
    let list = rows

    if (filter !== 'all') {
      list = list.filter(r => {
        if (filter === 'pending')  return r.pending.length > 0
        if (filter === 'counter')  return r.counter.length > 0
        if (filter === 'accepted') return r.accepted.length > 0
        if (filter === 'rejected') return r.rejected.length > 0
        return true
      })
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(r => {
        const name = `${r.prospect.qualification?.firstName ?? ''} ${r.prospect.qualification?.lastName ?? ''} ${r.prospect.email_from_name ?? ''}`.toLowerCase()
        const banks = [...r.pending, ...r.counter, ...r.accepted, ...r.rejected].map(b => b.name.toLowerCase()).join(' ')
        return name.includes(q) || banks.includes(q)
      })
    }

    // Tri : prospects avec activité récente d'abord, puis plus de banques
    return [...list].sort((a, b) => {
      if (a.latestActivity && b.latestActivity) return b.latestActivity - a.latestActivity
      return b.total - a.total
    })
  }, [rows, filter, search])

  // Compteurs globaux
  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, counter: 0, accepted: 0, rejected: 0 }
    for (const r of rows) {
      if (r.pending.length > 0)  c.pending++
      if (r.counter.length > 0)  c.counter++
      if (r.accepted.length > 0) c.accepted++
      if (r.rejected.length > 0) c.rejected++
    }
    return c
  }, [rows])

  const totalSubmissions = useMemo(
    () => rows.reduce((s, r) => s + r.total, 0),
    [rows]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const FILTERS = [
    { key: 'all',      label: 'Tous',          count: counts.all },
    { key: 'pending',  label: 'En attente',    count: counts.pending },
    { key: 'counter',  label: 'Contre-offre',  count: counts.counter },
    { key: 'accepted', label: 'Accordés',      count: counts.accepted },
    { key: 'rejected', label: 'Refusés',       count: counts.rejected },
  ] as const

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4 flex-wrap">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Pipeline</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">Suivi banques</h1>
            <p className="text-xs text-[#6B7280] mt-1.5 tabular-nums">
              {rows.length} dossier{rows.length > 1 ? 's' : ''} en cours · {totalSubmissions} envoi{totalSubmissions > 1 ? 's' : ''} bancaire{totalSubmissions > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-5">

        {rows.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="22" x2="21" y2="22" />
                <line x1="6" y1="18" x2="6" y2="11" />
                <line x1="10" y1="18" x2="10" y2="11" />
                <line x1="14" y1="18" x2="14" y2="11" />
                <line x1="18" y1="18" x2="18" y2="11" />
                <polygon points="12 2 20 7 4 7" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-navy mb-1">Aucun dossier envoyé en banque</h2>
            <p className="text-xs text-[#6B7280] mb-5 max-w-md mx-auto leading-relaxed">
              Dès qu&apos;un prospect aura été envoyé en banque depuis sa fiche, le suivi apparaîtra ici.
            </p>
            <Link href="/pro/prospects" className="btn-primary text-sm py-2 px-4">
              Voir mes prospects
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* ── Filtres + recherche ── */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">
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

              <div className="pt-2 border-t border-[#F3F4F6]">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Rechercher un prospect ou une banque"
                    placeholder="Rechercher un prospect ou une banque..."
                    className="w-full bg-[#F7F8FA] border border-transparent rounded-md pl-9 pr-3 py-2 text-sm placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:border-accent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ── Table dense par prospect ── */}
            <div data-tour="banks-table" className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">

              <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-[#E5E7EB] bg-[#F7F8FA] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                <div className="col-span-3">Prospect</div>
                <div className="col-span-6">Statut par banque</div>
                <div className="col-span-2 text-right">Meilleur taux</div>
                <div className="col-span-1 text-right">Activité</div>
              </div>

              <div className="divide-y divide-[#F3F4F6]">
                {filtered.map((row) => {
                  const name = row.prospect.qualification?.firstName
                    ? `${row.prospect.qualification.firstName} ${row.prospect.qualification.lastName ?? ''}`.trim()
                    : row.prospect.email_from_name ?? 'Inconnu'
                  const projet = row.prospect.qualification?.description ?? ''
                  const score = row.prospect.scoring?.score

                  return (
                    <button
                      key={row.prospect.id}
                      onClick={() => router.push(`/pro/leads/${row.prospect.id}?tab=banks`)}
                      className="w-full px-5 py-4 hover:bg-[#F7F8FA] transition-colors text-left group md:grid md:grid-cols-12 gap-3 items-center"
                    >
                      {/* Prospect */}
                      <div className="md:col-span-3 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-navy truncate">{name}</p>
                          {score !== undefined && (
                            <span className="text-[10px] font-extrabold text-[#9CA3AF] tabular-nums shrink-0">{score}/100</span>
                          )}
                        </div>
                        {projet && <p className="text-xs text-[#6B7280] truncate">{projet}</p>}
                      </div>

                      {/* Statut par banque */}
                      <div className="md:col-span-6 mt-2 md:mt-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {row.accepted.map((b, i) => (
                            <BankBadge key={`a-${i}`} status="accepted" name={b.name} rate={b.rate} />
                          ))}
                          {row.counter.map((b, i) => (
                            <BankBadge key={`c-${i}`} status="counter" name={b.name} rate={b.rate} />
                          ))}
                          {row.pending.map((b, i) => (
                            <BankBadge key={`p-${i}`} status="pending" name={b.name} />
                          ))}
                          {row.rejected.map((b, i) => (
                            <BankBadge key={`r-${i}`} status="rejected" name={b.name} />
                          ))}
                        </div>
                      </div>

                      {/* Meilleur taux */}
                      <div className="md:col-span-2 text-right mt-2 md:mt-0">
                        {row.bestRate !== null ? (
                          <p className="text-base font-extrabold text-emerald-700 tabular-nums leading-none">{row.bestRate}%</p>
                        ) : (
                          <p className="text-xs text-[#9CA3AF] font-medium">—</p>
                        )}
                      </div>

                      {/* Activité */}
                      <div className="md:col-span-1 flex items-center justify-end gap-1.5 mt-2 md:mt-0">
                        <span className="text-[10px] text-[#9CA3AF] font-medium tabular-nums">
                          {row.latestActivity ? timeAgo(row.latestActivity) : '—'}
                        </span>
                        <svg className="w-3.5 h-3.5 text-[#D1D5DB] group-hover:text-navy transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F7F8FA] text-[11px] text-[#6B7280] tabular-nums">
                {filtered.length} dossier{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
                {filter !== 'all' && ` · filtre "${FILTERS.find(f => f.key === filter)?.label}"`}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ── BankBadge : badge compact pour une soumission bancaire ──────────────

function BankBadge({ status, name, rate }: { status: StatusKey; name: string; rate?: number }) {
  const cfg = STATUS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      <span className="font-bold">{name}</span>
      {rate !== undefined && (
        <span className="opacity-70 tabular-nums font-normal">{rate}%</span>
      )}
    </span>
  )
}
