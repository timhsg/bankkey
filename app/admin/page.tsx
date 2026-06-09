import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { LogoMark } from '@/app/_components/Logo'
import AdminTable from './_components/AdminTable'
import type { CabinetRow } from './_types'

// ════════════════════════════════════════════════════════════════════════
//  /admin — Console interne BankKey (super-admin uniquement)
//
//  Page server qui agrège les KPIs et délègue le rendu interactif
//  (recherche, filtres, tri) à AdminTable (client component).
// ════════════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // 1. Authentification
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/pro/login')

  const { data: me } = await supabase
    .from('profiles')
    .select('is_super_admin, email')
    .eq('id', user.id)
    .single()

  if (!me?.is_super_admin) redirect('/pro')

  // 2. Données admin
  const admin = createAdminClient()

  const [
    { data: profiles },
    { data: allProspects },
    { data: allOutcomes },
    { count: leadsCount30d },
    { data: bookings },
    { count: leadsCount7d },
  ] = await Promise.all([
    admin.from('profiles')
      .select('id, email, broker_memory, created_at, subscription_plan, subscription_status, trial_ends_at, current_period_end, gmail_connected_email, gmail_last_processed_at, is_admin, is_super_admin, forwarding_address')
      .order('created_at', { ascending: false }),
    admin.from('prospects')
      .select('id, user_id, scoring, status, created_at, qualification'),
    admin.from('deal_outcomes')
      .select('id, user_id, status, decided_at, commission_amount'),
    admin.from('prospects')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 3600_000).toISOString()),
    admin.from('demo_bookings')
      .select('id, first_name, last_name, email, agency_name, city, preferred_slot, created_at, status')
      .order('created_at', { ascending: false })
      .limit(10),
    admin.from('prospects')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 3600_000).toISOString()),
  ])

  type ProfileRow = {
    id: string
    email: string
    broker_memory: { agencyName?: string; fullName?: string } | null
    created_at: string
    subscription_plan: string | null
    subscription_status: string | null
    trial_ends_at: string | null
    current_period_end: string | null
    gmail_connected_email: string | null
    gmail_last_processed_at: string | null
    is_admin: boolean
    is_super_admin: boolean
    forwarding_address: string | null
  }
  type ProspectRow = {
    id: string
    user_id: string
    scoring: { temperature?: string; score?: number } | null
    status: string
    created_at: string
    qualification: { firstName?: string; lastName?: string; monthly_income?: number } | null
  }
  type OutcomeRow = {
    id: string
    user_id: string
    status: string
    decided_at: string | null
    commission_amount: number | null
  }

  type BookingRow = {
    id: string
    first_name: string
    last_name: string | null
    email: string
    agency_name: string
    city: string | null
    preferred_slot: string
    created_at: string
    status: string | null
  }

  const allProfilesData = (profiles ?? []) as ProfileRow[]
  const prospectsData   = (allProspects ?? []) as ProspectRow[]
  const outcomesData    = (allOutcomes ?? []) as OutcomeRow[]
  const bookingsData    = (bookings ?? []) as BookingRow[]

  // Agréger par cabinet
  const prospectsByUser = new Map<string, ProspectRow[]>()
  for (const p of prospectsData) {
    if (!prospectsByUser.has(p.user_id)) prospectsByUser.set(p.user_id, [])
    prospectsByUser.get(p.user_id)!.push(p)
  }
  const outcomesByUser = new Map<string, OutcomeRow[]>()
  for (const o of outcomesData) {
    if (!outcomesByUser.has(o.user_id)) outcomesByUser.set(o.user_id, [])
    outcomesByUser.get(o.user_id)!.push(o)
  }

  const now = Date.now()
  const day = 24 * 3600_000

  const cabinets: CabinetRow[] = allProfilesData.map(p => {
    const ps = prospectsByUser.get(p.id) ?? []
    const os = outcomesByUser.get(p.id) ?? []
    const last30d = ps.filter(x => now - new Date(x.created_at).getTime() < 30 * day).length
    return {
      id: p.id,
      email: p.email,
      agencyName: p.broker_memory?.agencyName ?? null,
      fullName: p.broker_memory?.fullName ?? null,
      createdAt: p.created_at,
      plan: p.subscription_plan ?? 'trial',
      status: p.subscription_status ?? 'unknown',
      trialEndsAt: p.trial_ends_at,
      currentPeriodEnd: p.current_period_end,
      gmailEmail: p.gmail_connected_email,
      lastSync: p.gmail_last_processed_at,
      forwardingAddress: p.forwarding_address,
      prospectCount: ps.filter(p => p.status !== 'filtered').length,
      last30Days: last30d,
      hotCount: ps.filter(p => p.scoring?.temperature === 'hot' && p.status !== 'filtered').length,
      outcomeCount: os.length,
      acceptedCount: os.filter(o => o.status === 'accepted').length,
      isAdmin: p.is_super_admin || p.is_admin,
    }
  })

  // KPIs globaux
  const totalCabinets  = cabinets.length
  const proCabinets    = cabinets.filter(c => c.plan === 'pro' && c.status !== 'canceled').length
  const trialActive    = cabinets.filter(c => c.plan === 'trial' && c.trialEndsAt && new Date(c.trialEndsAt).getTime() > now).length
  const trialEndingSoon = cabinets.filter(c => c.plan === 'trial' && c.trialEndsAt && new Date(c.trialEndsAt).getTime() > now && new Date(c.trialEndsAt).getTime() < now + 7 * day).length
  const churned        = cabinets.filter(c => c.status === 'canceled').length
  const gmailConnected = cabinets.filter(c => c.gmailEmail).length

  const last7  = cabinets.filter(c => now - new Date(c.createdAt).getTime() < 7 * day).length
  const last30 = cabinets.filter(c => now - new Date(c.createdAt).getTime() < 30 * day).length

  const totalProspects = prospectsData.filter(p => p.status !== 'filtered').length
  const totalFiltered  = prospectsData.filter(p => p.status === 'filtered').length
  const totalOutcomes  = outcomesData.length
  const totalAccepted  = outcomesData.filter(o => o.status === 'accepted').length
  const totalCommission = outcomesData
    .filter(o => o.status === 'accepted' && o.commission_amount)
    .reduce((sum, o) => sum + (o.commission_amount ?? 0), 0)

  const mrr = proCabinets * 199
  const arr = mrr * 12
  const activationRate = totalCabinets > 0 ? Math.round(100 * gmailConnected / totalCabinets) : 0
  const conversionTrialToPro = totalCabinets > 0 ? Math.round(100 * proCabinets / Math.max(1, totalCabinets - trialActive)) : 0

  // Top cabinets par activité 30j
  const topActive = [...cabinets].sort((a, b) => b.last30Days - a.last30Days).slice(0, 5)

  // Activity feed récent
  const recentSignups = [...cabinets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="font-semibold text-slate-900 tracking-tight text-sm">Console interne</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Admin</span>
            <span className="text-[10px] text-slate-400">{me.email}</span>
          </div>
          <Link href="/pro" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            Retour à l&apos;app →
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-sm text-slate-500 mt-1">
            Toutes les données BankKey · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* KPIs financiers */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Business</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Kpi label="MRR" value={`${mrr.toLocaleString('fr-FR')} €`} sub={`${proCabinets} Pro`} accent={proCabinets > 0 ? 'emerald' : undefined} />
            <Kpi label="ARR" value={`${arr.toLocaleString('fr-FR')} €`} sub="projection" />
            <Kpi label="Commissions" value={`${totalCommission.toLocaleString('fr-FR')} €`} sub={`${totalAccepted} accord${totalAccepted > 1 ? 's' : ''} bancaires`} accent={totalCommission > 0 ? 'emerald' : undefined} />
            <Kpi label="Essais actifs" value={trialActive} sub={trialEndingSoon > 0 ? `${trialEndingSoon} expirent <7j` : ''} accent={trialEndingSoon > 0 ? 'amber' : undefined} />
            <Kpi label="Churn" value={churned} accent={churned > 0 ? 'red' : undefined} />
          </div>
        </section>

        {/* KPIs produit */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Produit</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Kpi small label="Total cabinets" value={totalCabinets} sub={`+${last7} cette semaine · +${last30} ce mois`} />
            <Kpi small label="Activation Gmail" value={`${activationRate}%`} sub={`${gmailConnected} sur ${totalCabinets}`} />
            <Kpi small label="Prospects analysés" value={totalProspects} sub={`${leadsCount30d ?? 0} sur 30j · ${leadsCount7d ?? 0} sur 7j`} />
            <Kpi small label="Spam filtré" value={totalFiltered} sub="Tokens IA économisés" />
            <Kpi small label="Conversion → Pro" value={`${conversionTrialToPro}%`} sub="post-essai" />
          </div>
        </section>

        {/* Démos réservées (récent) */}
        {bookingsData.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Demandes de démo récentes</h2>
              <span className="text-xs text-slate-500">{bookingsData.length} dernières</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-100">
                {bookingsData.map((b) => (
                  <div key={b.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
                      {(b.agency_name || b.first_name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 text-xs">
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 truncate">{b.first_name} {b.last_name ?? ''}</p>
                        <p className="text-slate-500 truncate">{b.agency_name}</p>
                      </div>
                      <div className="truncate">
                        <a href={`mailto:${b.email}`} className="text-blue-700 hover:underline truncate block">{b.email}</a>
                        {b.city && <p className="text-slate-500 truncate">{b.city}</p>}
                      </div>
                      <div className="text-slate-600">{b.preferred_slot}</div>
                      <div className="text-slate-500 text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{b.status ?? 'à contacter'}</span>
                        <p className="text-[10px] mt-1">{new Date(b.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top actifs + signups récents : 2 colonnes */}
        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Top 5 cabinets actifs (30j)</h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {topActive.length > 0 ? topActive.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/admin/cabinet/${c.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${i > 0 ? 'border-t border-slate-100' : ''}`}
                >
                  <span className="text-[10px] font-mono text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{c.agencyName ?? c.email}</p>
                    <p className="text-[10px] text-slate-500 truncate">{c.fullName ?? c.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{c.last30Days}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">prospects/30j</p>
                  </div>
                </Link>
              )) : (
                <p className="px-4 py-6 text-center text-xs text-slate-500">Pas encore d&apos;activité.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Inscriptions récentes</h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {recentSignups.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/admin/cabinet/${c.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${i > 0 ? 'border-t border-slate-100' : ''}`}
                >
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                    {(c.agencyName ?? c.email).slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{c.agencyName ?? c.email}</p>
                    <p className="text-[10px] text-slate-500 truncate">{c.email}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Tableau cabinets interactif */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Tous les cabinets</h2>
            <span className="text-xs text-slate-500">{totalCabinets} inscrits</span>
          </div>
          <AdminTable cabinets={cabinets} />
        </section>

        <p className="text-[11px] text-slate-400 text-center pt-4">
          Cette page n&apos;est visible que par les comptes <code className="font-mono">is_super_admin</code>. Les courtiers ne voient que leurs propres données via RLS PostgreSQL.
        </p>
      </main>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────

function Kpi({ label, value, sub, accent, small }: {
  label: string
  value: number | string
  sub?: string
  accent?: 'emerald' | 'amber' | 'red'
  small?: boolean
}) {
  const accentColor =
    accent === 'emerald' ? 'text-emerald-700' :
    accent === 'amber'   ? 'text-amber-700' :
    accent === 'red'     ? 'text-red-700' :
    'text-slate-900'
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`${small ? 'text-lg' : 'text-2xl'} font-semibold tracking-tight mt-1 ${accentColor}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}
