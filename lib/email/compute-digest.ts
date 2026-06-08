import type { SupabaseClient } from '@supabase/supabase-js'
import type { MonthlyDigestData } from './templates/monthly-digest'

// ════════════════════════════════════════════════════════════════════════
//  Calcul des données du digest mensuel pour un cabinet donné
//  Période = mois précédent (1er → dernier jour)
// ════════════════════════════════════════════════════════════════════════

interface Prospect {
  status: string
  scoring: { temperature?: string } | null
  detected_source: { sourceName?: string } | null
  received_at: string | null
  created_at: string
  bank_submitted: Array<{ name: string }> | null
}

interface Outcome {
  status: string
  rate_pct: number | null
  loan_amount: number | null
  decided_at: string
}

interface Profile {
  email: string
  broker_memory: { fullName?: string; agencyName?: string } | null
}

export async function computeDigestForUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  userId: string,
  appUrl: string,
): Promise<MonthlyDigestData | null> {
  // 1. Bornes du mois précédent
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const monthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const prevStart  = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const prevEnd    = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59)

  // 2. Récup profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, broker_memory')
    .eq('id', userId)
    .single<Profile>()

  if (!profile) return null

  // 3. Récup prospects et outcomes des 2 derniers mois
  const [{ data: prospectsData }, { data: outcomesData }] = await Promise.all([
    supabase.from('prospects')
      .select('status, scoring, detected_source, received_at, created_at, bank_submitted')
      .eq('user_id', userId)
      .gte('created_at', prevStart.toISOString()),
    supabase.from('deal_outcomes')
      .select('status, rate_pct, loan_amount, decided_at')
      .eq('user_id', userId)
      .gte('decided_at', prevStart.toISOString()),
  ])

  const prospects = (prospectsData ?? []) as Prospect[]
  const outcomes  = (outcomesData ?? []) as Outcome[]

  // 4. Filtrer pour le mois cible (mois précédent)
  const inMonth = (iso: string | null) => {
    if (!iso) return false
    const d = new Date(iso)
    return d >= monthStart && d <= monthEnd
  }
  const inPrevMonth = (iso: string | null) => {
    if (!iso) return false
    const d = new Date(iso)
    return d >= prevStart && d <= prevEnd
  }

  const monthProspects = prospects.filter(p => inMonth(p.received_at ?? p.created_at))
  const prevProspects  = prospects.filter(p => inPrevMonth(p.received_at ?? p.created_at))
  const monthOutcomes  = outcomes.filter(o => inMonth(o.decided_at))

  // 5. Agrégations
  const hot = monthProspects.filter(p => p.scoring?.temperature === 'hot').length
  const filtered = monthProspects.filter(p => p.status === 'filtered').length
  const replied = monthProspects.filter(p => p.status === 'replied').length

  const sourceMap = new Map<string, number>()
  for (const p of monthProspects) {
    const name = p.detected_source?.sourceName ?? 'Direct'
    sourceMap.set(name, (sourceMap.get(name) ?? 0) + 1)
  }
  const topSources = Array.from(sourceMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      pct: monthProspects.length > 0 ? Math.round(100 * count / monthProspects.length) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const banksSubmitted = monthProspects.reduce((s, p) => s + (p.bank_submitted?.length ?? 0), 0)
  const accepted = monthOutcomes.filter(o => o.status === 'accepted').length
  const rejected = monthOutcomes.filter(o => o.status === 'rejected').length
  const counter  = monthOutcomes.filter(o => o.status === 'counter').length

  const acceptedRates = monthOutcomes
    .filter(o => o.status === 'accepted' && o.rate_pct !== null)
    .map(o => o.rate_pct!)
  const avgRate = acceptedRates.length > 0
    ? acceptedRates.reduce((s, r) => s + r, 0) / acceptedRates.length
    : null

  const totalLoanAmount = monthOutcomes
    .filter(o => o.status === 'accepted' && o.loan_amount !== null)
    .reduce((s, o) => s + (o.loan_amount ?? 0), 0)

  const qualified = monthProspects.length - filtered
  const responseRate = qualified > 0 ? Math.round(100 * replied / qualified) : 0

  // 6. Compose
  const monthLabel = monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return {
    brokerFirstName: profile.broker_memory?.fullName?.split(' ')[0] ?? null,
    agencyName: profile.broker_memory?.agencyName ?? null,
    monthLabel: capitalizedMonth,
    totalProspects: monthProspects.length,
    hotProspects: hot,
    filteredProspects: filtered,
    repliedCount: replied,
    responseRate,
    prevTotal: prevProspects.length,
    prevHot: prevProspects.filter(p => p.scoring?.temperature === 'hot').length,
    topSources,
    banksSubmitted,
    accepted, rejected, counter,
    avgRate,
    totalLoanAmount,
    appUrl,
  }
}
