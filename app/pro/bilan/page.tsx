'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════
//  /pro/bilan — Bilan mensuel du cabinet
//  Vue récap du mois courant ET du mois précédent — base du futur
//  email digest automatique (envoyé chaque 1er du mois via Resend)
// ════════════════════════════════════════════════════════════════════════

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

  // ── Calcul des bornes du mois sélectionné ──
  const { startDate, endDate, periodLabel, periodShort } = useMemo(() => {
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
        periodShort: prevStart.toLocaleDateString('fr-FR', { month: 'short' }),
      }
    }

    return {
      startDate: start,
      endDate: end,
      periodLabel: start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      periodShort: start.toLocaleDateString('fr-FR', { month: 'short' }),
    }
  }, [period])

  // ── Stats agrégées sur la période ──
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

    // Répartition par source
    const bySource = new Map<string, number>()
    for (const p of periodProspects) {
      const src = p.detected_source?.sourceName ?? 'Direct'
      bySource.set(src, (bySource.get(src) ?? 0) + 1)
    }
    const sourceRanking = Array.from(bySource.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Banques sollicitées dans la période
    const banksSubmitted = periodProspects.reduce((sum, p) => sum + (p.bank_submitted?.length ?? 0), 0)

    // Résultats bancaires
    const accepted = periodOutcomes.filter(o => o.status === 'accepted').length
    const rejected = periodOutcomes.filter(o => o.status === 'rejected').length
    const counter  = periodOutcomes.filter(o => o.status === 'counter').length

    // Taux moyen sur les accords
    const acceptedRates = periodOutcomes
      .filter(o => o.status === 'accepted' && o.rate_pct !== null)
      .map(o => o.rate_pct!)
    const avgRate = acceptedRates.length > 0
      ? acceptedRates.reduce((s, r) => s + r, 0) / acceptedRates.length
      : null

    // Montant total accordé
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

  // ── Diff vs mois précédent ──
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  function delta(curr: number, prev: number | undefined): string {
    if (prev === undefined || prev === 0) return ''
    const diff = curr - prev
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff} vs ${periodShort === 'sept.' || periodShort === 'oct.' ? 'mois dernier' : 'mois précédent'}`
  }

  return (
    <div className="min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="pl-12 lg:pl-0 min-w-0">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">Bilan mensuel</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{periodLabel}</p>
          </div>

          {/* Toggle période */}
          <div className="inline-flex items-center bg-slate-100 rounded-full p-0.5 text-[11px] font-semibold shrink-0">
            <button
              onClick={() => setPeriod('previous')}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all ${period === 'previous' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Mois dernier
            </button>
            <button
              onClick={() => setPeriod('current')}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all ${period === 'current' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Ce mois
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Empty state */}
        {stats.total === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/><path d="M7 12l4-4 4 4 5-5"/>
            </svg>
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Aucune activité ce mois</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Dès qu&apos;un prospect arrive ou qu&apos;une décision bancaire est enregistrée, votre bilan se construira automatiquement.
            </p>
          </div>
        ) : (
          <>
            {/* ─── Section 1 : Acquisition ─── */}
            <Section title="Acquisition" subtitle="Prospects reçus et traités ce mois">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Kpi label="Prospects reçus"   value={stats.total}      sub={delta(stats.total, previousMonthStats?.total)} />
                <Kpi label="Prioritaires"      value={stats.hot}        sub={delta(stats.hot, previousMonthStats?.hot)}    accent={stats.hot > 0 ? 'emerald' : undefined} />
                <Kpi label="Filtrés (spam, perso)" value={stats.filtered} sub="Écartés automatiquement" />
                <Kpi label="Taux de réponse"   value={`${stats.responseRate}%`} sub={`${stats.replied} répondu${stats.replied > 1 ? 's' : ''}`} />
              </div>
            </Section>

            {/* ─── Section 2 : Sources ─── */}
            {stats.sourceRanking.length > 0 && (
              <Section title="Sources de leads" subtitle="D'où viennent vos prospects ce mois">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {stats.sourceRanking.map((src, idx) => {
                    const pct = Math.round(100 * src.count / stats.total)
                    return (
                      <div key={src.name} className={`px-5 py-3 flex items-center gap-4 ${idx > 0 ? 'border-t border-slate-100' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{src.name}</p>
                          <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-700 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-semibold text-slate-900 tracking-tight">{src.count}</p>
                          <p className="text-[10px] text-slate-400">{pct}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* ─── Section 3 : Résultats bancaires ─── */}
            <Section title="Résultats bancaires" subtitle="Décisions enregistrées ce mois">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Kpi label="Banques sollicitées" value={stats.banksSubmitted} sub="Au total ce mois" />
                <Kpi label="Accords obtenus"     value={stats.accepted}        accent="emerald" sub={delta(stats.accepted, previousMonthStats?.accepted)} />
                <Kpi label="Contre-offres"        value={stats.counter} />
                <Kpi label="Refus"               value={stats.rejected}        accent={stats.rejected > stats.accepted ? 'red' : undefined} />
              </div>

              {stats.accepted > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest">Taux moyen obtenu</p>
                    <p className="text-2xl font-semibold text-emerald-900 tracking-tight mt-1">
                      {stats.avgRate ? `${stats.avgRate.toFixed(2)}%` : '—'}
                    </p>
                  </div>
                  <div className="bg-slate-900 text-white rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Montant total accordé</p>
                    <p className="text-2xl font-semibold tracking-tight mt-1">
                      {stats.totalLoanAmount > 0 ? formatMoney(stats.totalLoanAmount) : '—'}
                    </p>
                  </div>
                </div>
              )}
            </Section>

            {/* ─── Note bas de page ─── */}
            <DigestPreviewCard />
          </>
        )}

        {/* Lien vers statistiques avancées */}
        <div className="text-center pt-4">
          <Link href="/pro/statistiques" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            Voir toutes les statistiques détaillées →
          </Link>
        </div>
      </main>
    </div>
  )
}

// ── Carte preview email digest ─────────────────────────────────────

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
    <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50/40 border border-blue-100 rounded-2xl px-5 py-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 mb-1">Envoi automatique chaque 1er du mois</p>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            BankKey vous enverra ce bilan par email chaque 1er du mois à 09h. Voulez-vous voir à quoi ça ressemble dans votre boîte mail ?
          </p>
          <button
            onClick={sendPreview}
            disabled={sending}
            className="text-xs font-medium bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg transition-base"
          >
            {sending ? 'Envoi...' : 'M\'envoyer un aperçu'}
          </button>
          {result && (
            <p className={`text-xs mt-2 ${result.ok ? 'text-emerald-700' : 'text-red-600'}`}>
              {result.ok ? '✓ ' : ''}{result.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── UI Helpers ─────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Kpi({ label, value, sub, accent }: {
  label: string
  value: string | number
  sub?: string
  accent?: 'emerald' | 'red'
}) {
  const accentColor =
    accent === 'emerald' ? 'text-emerald-700' :
    accent === 'red'     ? 'text-red-700' :
    'text-slate-900'
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-semibold tracking-tight mt-1 ${accentColor}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M€`
  if (n >= 1000) return `${Math.round(n / 1000)} k€`
  return `${Math.round(n)} €`
}
