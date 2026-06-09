import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// ════════════════════════════════════════════════════════════════════════
//  /admin — Console interne BankKey (Sandra uniquement)
//
//  Sécurité : double vérification
//   1. is_super_admin = true sur le profil utilisateur connecté
//   2. createAdminClient (service_role) bypasse RLS pour lire toutes données
//
//  Données affichées : aggregées par cabinet, pas individu prospect par défaut
//  Drill-down vers /admin/cabinet/[id] si besoin d'inspecter
// ════════════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

interface CabinetRow {
  id: string
  email: string
  agencyName: string | null
  fullName: string | null
  createdAt: string
  plan: string
  status: string
  trialEndsAt: string | null
  gmailEmail: string | null
  lastSync: string | null
  prospectCount: number
  hotCount: number
  outcomeCount: number
  acceptedCount: number
  isAdmin: boolean
}

export default async function AdminPage() {
  // 1. Authentifier l'utilisateur
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/pro/login')

  // 2. Vérifier le flag super_admin via la propre RLS (l'utilisateur lit son propre profil)
  const { data: me } = await supabase
    .from('profiles')
    .select('is_super_admin, email')
    .eq('id', user.id)
    .single()

  if (!me?.is_super_admin) {
    redirect('/pro')
  }

  // 3. Lecture admin — bypass RLS pour récupérer toutes les données
  const admin = createAdminClient()

  const [{ data: profiles }, { data: allProspects }, { data: allOutcomes }, { count: leadsCount30d }] = await Promise.all([
    admin.from('profiles')
      .select('id, email, broker_memory, created_at, subscription_plan, subscription_status, trial_ends_at, current_period_end, gmail_connected_email, gmail_last_processed_at, is_admin, is_super_admin')
      .order('created_at', { ascending: false }),
    admin.from('prospects')
      .select('id, user_id, scoring, status'),
    admin.from('deal_outcomes')
      .select('id, user_id, status'),
    admin.from('prospects')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 3600_000).toISOString()),
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
  }
  type ProspectRow = { id: string; user_id: string; scoring: { temperature?: string } | null; status: string }
  type OutcomeRow  = { id: string; user_id: string; status: string }

  const allProfilesData = (profiles ?? []) as ProfileRow[]
  const prospectsData   = (allProspects ?? []) as ProspectRow[]
  const outcomesData    = (allOutcomes ?? []) as OutcomeRow[]

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

  const cabinets: CabinetRow[] = allProfilesData.map(p => {
    const ps = prospectsByUser.get(p.id) ?? []
    const os = outcomesByUser.get(p.id) ?? []
    return {
      id: p.id,
      email: p.email,
      agencyName: p.broker_memory?.agencyName ?? null,
      fullName: p.broker_memory?.fullName ?? null,
      createdAt: p.created_at,
      plan: p.subscription_plan ?? 'trial',
      status: p.subscription_status ?? 'unknown',
      trialEndsAt: p.trial_ends_at,
      gmailEmail: p.gmail_connected_email,
      lastSync: p.gmail_last_processed_at,
      prospectCount: ps.filter(p => p.status !== 'filtered').length,
      hotCount: ps.filter(p => p.scoring?.temperature === 'hot' && p.status !== 'filtered').length,
      outcomeCount: os.length,
      acceptedCount: os.filter(o => o.status === 'accepted').length,
      isAdmin: p.is_super_admin || p.is_admin,
    }
  })

  // KPIs globaux
  const now = Date.now()
  const day = 24 * 3600_000

  const totalCabinets = cabinets.length
  const proCabinets   = cabinets.filter(c => c.plan === 'pro' && c.status !== 'canceled').length
  const trialActive   = cabinets.filter(c => c.plan === 'trial' && c.trialEndsAt && new Date(c.trialEndsAt).getTime() > now).length
  const churned       = cabinets.filter(c => c.status === 'canceled').length
  const gmailConnected = cabinets.filter(c => c.gmailEmail).length

  const last7  = cabinets.filter(c => now - new Date(c.createdAt).getTime() < 7 * day).length
  const last30 = cabinets.filter(c => now - new Date(c.createdAt).getTime() < 30 * day).length

  const totalProspects = prospectsData.filter(p => p.status !== 'filtered').length
  const totalFiltered  = prospectsData.filter(p => p.status === 'filtered').length
  const totalOutcomes  = outcomesData.length
  const totalAccepted  = outcomesData.filter(o => o.status === 'accepted').length

  const mrr = proCabinets * 199  // EUR

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tighter">BK</span>
            </div>
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

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-sm text-slate-500 mt-1">Toutes les données du projet · mise à jour temps réel</p>
        </div>

        {/* KPIs financiers */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Business</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="MRR estimé" value={`${mrr.toLocaleString('fr-FR')} €`} sub={`${proCabinets} Pro actif${proCabinets > 1 ? 's' : ''}`} accent={proCabinets > 0 ? 'emerald' : undefined} />
            <Kpi label="Total cabinets" value={totalCabinets} sub={`+${last7} cette semaine · +${last30} ce mois`} />
            <Kpi label="Essais actifs" value={trialActive} accent="amber" />
            <Kpi label="Churn" value={churned} accent={churned > 0 ? 'red' : undefined} />
          </div>
        </section>

        {/* KPIs produit */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Produit</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi small label="Prospects analysés" value={totalProspects} sub={`${leadsCount30d ?? 0} ces 30j`} />
            <Kpi small label="Spam filtré" value={totalFiltered} sub="Économie tokens IA" />
            <Kpi small label="Gmail connectés" value={gmailConnected} sub={`${totalCabinets > 0 ? Math.round(100 * gmailConnected / totalCabinets) : 0}% activation`} />
            <Kpi small label="Décisions bancaires" value={totalOutcomes} sub={`${totalAccepted} accord${totalAccepted > 1 ? 's' : ''}`} />
          </div>
        </section>

        {/* Tableau cabinets */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Tous les cabinets</h2>
            <span className="text-xs text-slate-500">{totalCabinets} inscrits</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <Th>Cabinet</Th>
                    <Th>Plan</Th>
                    <Th>Prospects</Th>
                    <Th>Hot</Th>
                    <Th>Décisions</Th>
                    <Th>Gmail</Th>
                    <Th>Inscrit</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cabinets.map((c) => (
                    <tr key={c.id} className={c.isAdmin ? 'bg-amber-50/30' : ''}>
                      <Td>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {(c.agencyName ?? c.email).slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{c.agencyName ?? '—'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{c.fullName ?? c.email}</p>
                          </div>
                          {c.isAdmin && <span className="text-[8px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-1 py-0.5 rounded shrink-0">Admin</span>}
                        </div>
                      </Td>
                      <Td><PlanBadge plan={c.plan} status={c.status} /></Td>
                      <Td><span className="text-xs font-medium text-slate-900">{c.prospectCount}</span></Td>
                      <Td><span className="text-xs font-medium text-emerald-700">{c.hotCount}</span></Td>
                      <Td>
                        <span className="text-xs text-slate-700">{c.outcomeCount}</span>
                        {c.acceptedCount > 0 && (
                          <span className="text-[10px] text-emerald-600 ml-1">({c.acceptedCount} ✓)</span>
                        )}
                      </Td>
                      <Td>
                        {c.gmailEmail
                          ? <span className="text-xs text-emerald-600">✓</span>
                          : <span className="text-xs text-slate-300">—</span>}
                      </Td>
                      <Td>
                        <span className="text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </Td>
                      <Td>
                        <Link href={`/admin/cabinet/${c.id}`} className="text-xs text-slate-500 hover:text-slate-900 underline">
                          Voir
                        </Link>
                      </Td>
                    </tr>
                  ))}
                  {totalCabinets === 0 && (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-xs text-slate-500">
                      Aucun cabinet inscrit pour l&apos;instant.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-4 py-2.5">{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>
}

function PlanBadge({ plan, status }: { plan: string; status: string }) {
  if (plan === 'pro' && status !== 'canceled') {
    return <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">Pro</span>
  }
  if (status === 'canceled') {
    return <span className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full">Churn</span>
  }
  return <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">Trial</span>
}
