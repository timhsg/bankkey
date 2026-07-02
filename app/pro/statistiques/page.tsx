'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CompletenessCard from '../_components/CompletenessCard'

// ════════════════════════════════════════════════════════════════════════
//  /pro/statistiques — Statistiques basées sur les résultats du cabinet
//  Ce que BankKey apprend de vos prospects : taux moyens, banques les plus
//  acceptantes, profils gagnants…
// ════════════════════════════════════════════════════════════════════════

interface Outcome {
  id: string
  bank_name: string
  status: 'accepted' | 'rejected' | 'counter' | 'withdrawn'
  rate_pct: number | null
  loan_amount: number | null
  duration_years: number | null
  rejection_reason: string | null
  snapshot: {
    city?: string | null
    jurisdiction?: string
    monthly_income?: number | null
    down_payment_pct?: number | null
    employment?: string | null
    debt_ratio?: number | null
    project_amount?: number | null
  } | null
  decided_at: string
}

export default function InsightsPage() {
  const router   = useRouter()
  const supabase = createClient()

  interface IncompleteProspect {
    id: string
    name: string
    status: string
    bank_count: number
  }

  const [outcomes, setOutcomes]     = useState<Outcome[]>([])
  const [totalProspects, setTotalProspects] = useState(0)
  const [incomplete, setIncomplete] = useState<IncompleteProspect[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }

      const [outcomesRes, prospectsRes] = await Promise.all([
        supabase.from('deal_outcomes')
          .select('id, bank_name, status, rate_pct, loan_amount, duration_years, rejection_reason, snapshot, decided_at')
          .order('decided_at', { ascending: false }),
        supabase.from('prospects')
          .select('id, qualification, email_from_name, status, bank_submitted')
          .neq('status', 'archived')
          .neq('status', 'filtered'),
      ])

      const fetchedOutcomes = (outcomesRes.data ?? []) as Outcome[]
      const allProspects = (prospectsRes.data ?? []) as Array<{
        id: string
        qualification: { firstName?: string | null; lastName?: string | null } | null
        email_from_name: string | null
        status: string
        bank_submitted: Array<{ name: string; status?: string }> | null
      }>

      // Trouver les prospects avec banques en attente mais pas de décision enregistrée
      const prospectIdsWithOutcome = new Set(
        fetchedOutcomes.map(o => o as Outcome & { prospect_id?: string }).map(o => (o as { prospect_id?: string }).prospect_id).filter(Boolean)
      )

      const incompleteList: IncompleteProspect[] = allProspects
        .filter(p => p.bank_submitted && p.bank_submitted.length > 0 && !prospectIdsWithOutcome.has(p.id))
        .map(p => ({
          id: p.id,
          name: p.qualification?.firstName
            ? `${p.qualification.firstName} ${p.qualification.lastName ?? ''}`.trim()
            : p.email_from_name ?? 'Sans nom',
          status: p.status,
          bank_count: p.bank_submitted?.length ?? 0,
        }))
        .slice(0, 10)

      setOutcomes(fetchedOutcomes)
      setTotalProspects(allProspects.length)
      setIncomplete(incompleteList)
      setLoading(false)
    }
    void load()
  }, [supabase, router])

  const stats = useMemo(() => {
    const accepted   = outcomes.filter(o => o.status === 'accepted')
    const rejected   = outcomes.filter(o => o.status === 'rejected')
    const counter    = outcomes.filter(o => o.status === 'counter')
    const acceptanceRate = outcomes.length > 0 ? Math.round(100 * accepted.length / outcomes.length) : 0

    // Taux moyen des accords
    const rates = accepted.filter(o => o.rate_pct !== null).map(o => o.rate_pct!)
    const avgRate = rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : null
    const minRate = rates.length > 0 ? Math.min(...rates) : null
    const maxRate = rates.length > 0 ? Math.max(...rates) : null

    // Montant moyen
    const amounts = accepted.filter(o => o.loan_amount !== null).map(o => o.loan_amount!)
    const avgAmount = amounts.length > 0 ? amounts.reduce((s, a) => s + a, 0) / amounts.length : null

    // Banques top
    const bankAggregates = new Map<string, { total: number; accepted: number; avgRate: number; rateSum: number; rateCount: number }>()
    for (const o of outcomes) {
      const existing = bankAggregates.get(o.bank_name) ?? { total: 0, accepted: 0, avgRate: 0, rateSum: 0, rateCount: 0 }
      existing.total += 1
      if (o.status === 'accepted') existing.accepted += 1
      if (o.status === 'accepted' && o.rate_pct !== null) {
        existing.rateSum += o.rate_pct
        existing.rateCount += 1
      }
      existing.avgRate = existing.rateCount > 0 ? existing.rateSum / existing.rateCount : 0
      bankAggregates.set(o.bank_name, existing)
    }

    const bankRanking = Array.from(bankAggregates.entries())
      .map(([name, agg]) => ({
        name,
        total: agg.total,
        accepted: agg.accepted,
        acceptanceRate: agg.total > 0 ? Math.round(100 * agg.accepted / agg.total) : 0,
        avgRate: agg.avgRate || null,
      }))
      .sort((a, b) => b.total - a.total)

    // Raisons de refus
    const rejectionCounts = new Map<string, number>()
    for (const r of rejected) {
      if (r.rejection_reason) {
        rejectionCounts.set(r.rejection_reason, (rejectionCounts.get(r.rejection_reason) ?? 0) + 1)
      }
    }
    const rejectionRanking = Array.from(rejectionCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)

    return {
      total: outcomes.length,
      accepted: accepted.length,
      counter: counter.length,
      rejected: rejected.length,
      acceptanceRate,
      avgRate, minRate, maxRate,
      avgAmount,
      bankRanking,
      rejectionRanking,
    }
  }, [outcomes])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Pipeline</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">Statistiques</h1>
            <p className="text-xs text-[#6B7280] mt-1.5 tabular-nums">
              {stats.total} dossier{stats.total > 1 ? 's' : ''} avec décision bancaire enregistrée
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Carte complétude — toujours visible */}
        <CompletenessCard
          totalProspects={totalProspects}
          withOutcome={stats.total}
          incompleteWithBanks={incomplete}
        />

        {stats.total === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* KPIs principaux */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="Taux d'acceptation"  value={`${stats.acceptanceRate}%`} sub={`${stats.accepted} / ${stats.total} dossiers`} accent="emerald" />
              <Kpi label="Taux moyen obtenu"    value={stats.avgRate ? `${stats.avgRate.toFixed(2)}%` : '—'} sub={stats.minRate && stats.maxRate ? `${stats.minRate.toFixed(2)} – ${stats.maxRate.toFixed(2)}%` : ''} />
              <Kpi label="Montant moyen"        value={stats.avgAmount ? formatEuro(stats.avgAmount) : '—'} sub="Crédits accordés" />
              <Kpi label="Refus"                value={stats.rejected} sub="À analyser" accent={stats.rejected > stats.accepted ? 'red' : undefined} />
            </div>

            {/* Banques ranking */}
            {stats.bankRanking.length > 0 && (
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Vos banques partenaires</h2>
                  <span className="text-xs text-slate-500">{stats.bankRanking.length} banques distinctes</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {stats.bankRanking.map((bank, idx) => (
                    <div key={bank.name} className={`px-5 py-4 flex items-center gap-4 ${idx > 0 ? 'border-t border-slate-100' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 mb-0.5">{bank.name}</p>
                        <p className="text-xs text-slate-500">
                          {bank.accepted} accordé{bank.accepted > 1 ? 's' : ''} sur {bank.total} dossier{bank.total > 1 ? 's' : ''}
                          {bank.avgRate ? ` · taux moyen ${bank.avgRate.toFixed(2)}%` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-lg font-semibold tracking-tight ${bank.acceptanceRate >= 60 ? 'text-emerald-700' : bank.acceptanceRate >= 30 ? 'text-amber-700' : 'text-red-700'}`}>
                          {bank.acceptanceRate}%
                        </p>
                        <p className="text-[10px] text-slate-400">acceptation</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raisons de refus */}
            {stats.rejectionRanking.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Principales raisons de refus</h2>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {stats.rejectionRanking.map((r, idx) => (
                    <div key={r.reason} className={`px-5 py-3 flex items-center justify-between ${idx > 0 ? 'border-t border-slate-100' : ''}`}>
                      <span className="text-sm text-slate-700">{rejectionLabel(r.reason)}</span>
                      <span className="text-sm font-semibold text-slate-900">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">Plus vous enregistrez d&apos;outcomes</span>, plus BankKey identifie les patterns qui marchent pour votre cabinet : taux moyens par profil, banques les plus acceptantes selon la région, profils à éviter.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-2xl mx-auto">
      <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="m19 9-5 5-4-4-3 3"/>
      </svg>
      <h2 className="text-sm font-semibold text-slate-900 mb-2">Aucun dossier décidé pour l&apos;instant</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Quand vous marquerez une banque comme <span className="font-semibold">Accordée</span>, <span className="font-semibold">Refusée</span> ou <span className="font-semibold">Contre-offre</span> dans la fiche d&apos;un prospect, BankKey vous demandera les conditions exactes. Plus vous remplissez, plus les insights deviennent précis.
      </p>
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

function formatEuro(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M €`
  if (n >= 1000) return `${Math.round(n / 1000)}k €`
  return `${Math.round(n)} €`
}

function rejectionLabel(reason: string): string {
  const map: Record<string, string> = {
    income_too_low: 'Revenus insuffisants',
    debt_ratio:     'Taux d\'endettement trop élevé',
    profile:        'Profil non éligible',
    down_payment:   'Apport insuffisant',
    project:        'Projet non financé',
    other:          'Autre raison',
  }
  return map[reason] ?? reason
}
