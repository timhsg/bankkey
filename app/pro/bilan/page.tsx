'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ═══════════════════════════════════════════════════════════════════════
//  /pro/bilan — Bilan mensuel du cabinet
//  KPIs bancaires : acquisition + sources + résultats banques
// ═══════════════════════════════════════════════════════════════════════

interface Prospect {
  id: string
  email_from_name: string | null
  status: string
  scoring: { score: number; temperature: string } | null
  detected_source: { sourceId: string; sourceName: string } | null
  received_at: string | null
  created_at: string
  bank_submitted: Array<{ name: string; status?: string; rate?: number }> | null
}

interface Outcome {
  id: string
  bank_name: string
  status: string
  rate_pct: number | null
  loan_amount: number | null
  decided_at: string
}

type Period = 'current' | 'previous'

export default function BilanPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [period, setPeriod] = useState<Period>('current')
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [outcomes, setOutcomes]   = useState<Outcome[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }

      const [prospectsRes, outcomesRes] = await Promise.all([
        supabase.from('prospects')
          .select('id, email_from_name, status, scoring, detected_source, received_at, created_at, bank_submitted')
          .order('created_at', { ascending: false }),
        supabase.from('deal_outcomes')
          .select('id, bank_name, status, rate_pct, loan_amount, decided_at')
          .order('decided_at', { ascending: false }),
      ])

      setProspects((prospectsRes.data ?? []) as Prospect[])
      setOutcomes((outcomesRes.data ?? []) as Outcome[])
      setLoading(false)
    }
    void load()
  }, [supabase, router])

  const { startDate, endDate, periodLabel } = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    if (period === 'previous') {
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return {
        startDate: prevStart,
        endDate: prevEnd,
        periodLabel: prevStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      }
    }

    return {
      startDate: start,
      endDate: end,
      periodLabel: start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    }
  }, [period])

  const stats = useMemo(() => {
    const inPeriod = (iso: string | null) => {
      if (!iso) return false
      const d = new Date(iso)
      return d >= startDate && d <= endDate
    }

    const periodProspects = prospects.filter(p => inPeriod(p.received_at ?? p.created_at))
    const periodOutcomes  = outcomes.filter(o => inPeriod(o.decided_at))

    const hot = periodProspects.filter(p => p.scoring?.temperature === 'hot').length
    const replied = periodProspects.filter(p => p.status === 'replied').length
    const filtered = periodProspects.filter(p => p.status === 'filtered').length

    const bySource = new Map<string, number>()
    for (const p of periodProspects) {
      const src = p.detected_source?.sourceName ?? 'Direct'
      bySource.set(src, (bySource.get(src) ?? 0) + 1)
    }
    const sourceRanking = Array.from(bySource.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const banksSubmitted = periodProspects.reduce((sum, p) => sum + (p.bank_submitted?.length ?? 0), 0)

    const accepted = periodOutcomes.filter(o => o.status === 'accepted').length
    const rejected = periodOutcomes.filter(o => o.status === 'rejected').length
    const counter  = periodOutcomes.filter(o => o.status === 'counter').length

    const acceptedRates = periodOutcomes
      .filter(o => o.status === 'accepted' && o.rate_pct !== null)
      .map(o => o.rate_pct!)
    const avgRate = acceptedRates.length > 0
      ? acceptedRates.reduce((s, r) => s + r, 0) / acceptedRates.length
      : null

    const totalLoanAmount = periodOutcomes
      .filter(o => o.status === 'accepted' && o.loan_amount !== null)
      .reduce((s, o) => s + (o.loan_amount ?? 0), 0)

    return {
      total: periodProspects.length,
      qualified: periodProspects.length - filtered,
      filtered,
      hot,
      replied,
      sourceRanking,
      banksSubmitted,
      accepted, rejected, counter,
      avgRate,
      totalLoanAmount,
      responseRate: periodProspects.length > 0 ? Math.round(100 * replied / (periodProspects.length - filtered)) : 0,
    }
  }, [prospects, outcomes, startDate, endDate])

  const previousMonthStats = useMemo(() => {
    if (period !== 'current') return null

    const now = new Date()
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const inPrevious = (iso: string | null) => {
      if (!iso) return false
      const d = new Date(iso)
      return d >= prevStart && d <= prevEnd
    }

    const prevProspects = prospects.filter(p => inPrevious(p.received_at ?? p.created_at))
    const prevOutcomes  = outcomes.filter(o => inPrevious(o.decided_at))

    return {
      total: prevProspects.length,
      hot: prevProspects.filter(p => p.scoring?.temperature === 'hot').length,
      replied: prevProspects.filter(p => p.status === 'replied').length,
      accepted: prevOutcomes.filter(o => o.status === 'accepted').length,
    }
  }, [prospects, outcomes, period])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  function delta(curr: number, prev: number | undefined): { label: string; positive: boolean } | null {
    if (prev === undefined || prev === 0) return null
    const diff = curr - prev
    if (diff === 0) return null
    return {
      label: `${diff > 0 ? '+' : ''}${diff} vs mois précédent`,
      positive: diff > 0,
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4 flex-wrap">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Pipeline</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none capitalize">Bilan · {periodLabel}</h1>
            <p className="text-xs text-[#6B7280] mt-1.5 tabular-nums">
              {stats.total} demande{stats.total > 1 ? 's' : ''} · {stats.accepted} accord{stats.accepted > 1 ? 's' : ''} bancaire{stats.accepted > 1 ? 's' : ''}
            </p>
          </div>

          {/* Toggle période */}
          <div className="inline-flex items-center bg-[#F3F4F6] rounded-lg p-1 text-xs font-bold shrink-0">
            <button
              onClick={() => setPeriod('previous')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'previous'
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-navy'
              }`}
            >
              Mois dernier
            </button>
            <button
              onClick={() => setPeriod('current')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'current'
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-navy'
              }`}
            >
              Ce mois
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">

        {stats.total === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/><path d="M7 12l4-4 4 4 5-5"/>
              </svg>
            </div>
            <h2 className="text-sm font-bold text-navy mb-2">Aucune activité ce mois</h2>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
              Dès qu&apos;un prospect arrive ou qu&apos;une décision bancaire est enregistrée, votre bilan se construira automatiquement.
            </p>
          </div>
        ) : (
          <>
            {/* ── Section : Acquisition ── */}
            <Section title="Acquisition" subtitle="Demandes reçues et traitées ce mois">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Kpi label="Demandes reçues" value={stats.total} delta={delta(stats.total, previousMonthStats?.total)} icon="inbox" />
                <Kpi label="Prioritaires"    value={stats.hot}   delta={delta(stats.hot, previousMonthStats?.hot)} accent="emerald" icon="bolt" />
                <Kpi label="Écartés"         value={stats.filtered} hint="Spam, perso, non finançable" icon="filter" />
                <Kpi label="Taux de réponse" value={`${stats.responseRate}%`} hint={`${stats.replied} répondu${stats.replied > 1 ? 's' : ''}`} icon="check" />
              </div>
            </Section>

            {/* ── Section : Sources ── */}
            {stats.sourceRanking.length > 0 && (
              <Section title="Sources de prospects" subtitle="D'où viennent vos demandes ce mois">
                <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                  {stats.sourceRanking.map((src, idx) => {
                    const pct = Math.round(100 * src.count / stats.total)
                    return (
                      <div key={src.name} className={`px-5 py-4 flex items-center gap-4 ${idx > 0 ? 'border-t border-[#F3F4F6]' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-navy">{src.name}</p>
                            <p className="text-xs font-bold text-[#6B7280] tabular-nums">{src.count} · {pct}%</p>
                          </div>
                          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-gradient rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* ── Section : Résultats bancaires ── */}
            <Section title="Résultats bancaires" subtitle="Décisions des banques ce mois">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Kpi label="Banques sollicitées" value={stats.banksSubmitted} hint="Au total" icon="bank" />
                <Kpi label="Accords obtenus"     value={stats.accepted} accent="emerald" delta={delta(stats.accepted, previousMonthStats?.accepted)} icon="check" />
                <Kpi label="Contre-offres"        value={stats.counter} icon="arrows" />
                <Kpi label="Refus"               value={stats.rejected} accent={stats.rejected > stats.accepted ? 'red' : undefined} icon="x" />
              </div>

              {stats.accepted > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-xl px-5 py-4">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Taux moyen obtenu</p>
                    <p className="text-3xl font-extrabold text-emerald-900 tracking-tightest tabular-nums leading-none">
                      {stats.avgRate ? `${stats.avgRate.toFixed(2)}%` : '—'}
                    </p>
                  </div>
                  <div className="bg-brand-gradient text-white rounded-xl px-5 py-4 shadow-[0_4px_24px_rgba(10,31,92,0.16)]">
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Montant total accordé</p>
                    <p className="text-3xl font-extrabold tracking-tightest tabular-nums leading-none">
                      {stats.totalLoanAmount > 0 ? formatMoney(stats.totalLoanAmount) : '—'}
                    </p>
                  </div>
                </div>
              )}
            </Section>

            <DigestPreviewCard />
          </>
        )}

        <div className="text-center pt-2">
          <Link href="/pro/statistiques" className="text-xs font-semibold text-accent hover:text-navy transition-colors">
            Voir toutes les statistiques détaillées →
          </Link>
        </div>
      </main>
    </div>
  )
}

// ── Sous-composants ─────────────────────────────────────────────────

function DigestPreviewCard() {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function sendPreview() {
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/email/test-digest', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: `Aperçu envoyé à ${data.sent_to}` })
      } else {
        setResult({ ok: false, message: data.error ?? 'Erreur d\'envoi' })
      }
    } catch {
      setResult({ ok: false, message: 'Erreur réseau' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex items-start gap-4 shadow-card">
      <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0 shadow-btn">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-navy mb-1">Envoi automatique chaque 1er du mois</p>
        <p className="text-xs text-[#6B7280] leading-relaxed mb-3">
          BankKey vous enverra ce bilan par email chaque 1er du mois à 9h. Vous voulez voir à quoi ça ressemble dans votre boîte ?
        </p>
        <button
          onClick={sendPreview}
          disabled={sending}
          className="text-xs font-bold bg-white border border-[#D1D5DB] hover:border-navy text-[#374151] hover:text-navy disabled:opacity-50 px-3 py-1.5 rounded-lg transition-all"
        >
          {sending ? 'Envoi...' : 'M\'envoyer un aperçu'}
        </button>
        {result && (
          <p className={`text-xs mt-2 font-semibold ${result.ok ? 'text-emerald-700' : 'text-red-600'}`}>
            {result.ok ? '✓ ' : ''}{result.message}
          </p>
        )}
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-extrabold text-navy">{title}</h2>
        {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Kpi({ label, value, hint, delta, accent, icon }: {
  label: string
  value: string | number
  hint?: string
  delta?: { label: string; positive: boolean } | null
  accent?: 'emerald' | 'red'
  icon?: 'inbox' | 'bolt' | 'filter' | 'check' | 'bank' | 'arrows' | 'x'
}) {
  const accentColor =
    accent === 'emerald' ? 'text-emerald-700' :
    accent === 'red'     ? 'text-red-700' :
    'text-navy'

  const ICONS: Record<string, React.ReactNode> = {
    inbox: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    bolt:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    filter:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>,
    bank:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="12 2 20 7 4 7"/><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/></svg>,
    arrows:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    x:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">{label}</p>
        {icon && (
          <div className="w-6 h-6 rounded-md bg-[#F7F8FA] flex items-center justify-center text-[#6B7280]">
            {ICONS[icon]}
          </div>
        )}
      </div>
      <p className={`text-3xl font-extrabold tracking-tightest tabular-nums leading-none ${accentColor}`}>{value}</p>
      {hint && <p className="text-[11px] text-[#9CA3AF] mt-2 font-medium">{hint}</p>}
      {delta && (
        <p className={`text-[10px] font-bold mt-2 tabular-nums ${delta.positive ? 'text-emerald-700' : 'text-red-700'}`}>
          {delta.label}
        </p>
      )}
    </div>
  )
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M€`
  if (n >= 1000) return `${Math.round(n / 1000)} k€`
  return `${Math.round(n)} €`
}
