import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

// ════════════════════════════════════════════════════════════════════════
//  /admin — Tableau de bord interne BankKey
//  Réservé aux comptes flaggés is_admin (Sandra)
//  Métriques business : MRR, MAU, signups, churn, ratio actifs/trial
// ════════════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

interface Profile {
  id: string
  email: string
  created_at: string
  subscription_plan: 'trial' | 'pro' | null
  subscription_status: string | null
  trial_ends_at: string | null
  current_period_end: string | null
  gmail_connected_email: string | null
  broker_memory: { agencyName?: string; fullName?: string } | null
  is_admin: boolean
}

export default async function AdminPage() {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/pro/login')

  // 2. Vérifier le flag admin
  const admin = createAdminClient()
  const { data: me } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!me?.is_admin) redirect('/pro')

  // 3. Charger toutes les données (RLS bypassé via admin client)
  const [{ data: profiles }, { count: totalProspects }, { count: totalLeads30d }] = await Promise.all([
    admin.from('profiles')
      .select('id, email, created_at, subscription_plan, subscription_status, trial_ends_at, current_period_end, gmail_connected_email, broker_memory, is_admin')
      .order('created_at', { ascending: false }),
    admin.from('prospects').select('id', { count: 'exact', head: true }),
    admin.from('prospects').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 3600_000).toISOString()),
  ])

  const allProfiles = (profiles ?? []) as Profile[]

  // ── Métriques calculées ─────────────────────────────────────────
  const now = Date.now()
  const day = 24 * 3600 * 1000

  const total       = allProfiles.length
  const proCount    = allProfiles.filter(p => p.subscription_plan === 'pro' && p.subscription_status !== 'canceled').length
  const trialActive = allProfiles.filter(p => p.subscription_plan === 'trial' && p.trial_ends_at && new Date(p.trial_ends_at).getTime() > now).length
  const trialExpired = allProfiles.filter(p => p.subscription_plan === 'trial' && p.trial_ends_at && new Date(p.trial_ends_at).getTime() <= now).length
  const churnedCount = allProfiles.filter(p => p.subscription_status === 'canceled').length
  const gmailConnected = allProfiles.filter(p => p.gmail_connected_email).length

  // Signups par fenêtre
  const last7  = allProfiles.filter(p => now - new Date(p.created_at).getTime() < 7 * day).length
  const last30 = allProfiles.filter(p => now - new Date(p.created_at).getTime() < 30 * day).length

  // MRR : nombre de Pro × prix moyen
  const monthlyRevenue = proCount * 349

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tighter">BK</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm">Admin</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Interne</span>
          </div>
          <Link href="/pro" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            Retour à l&apos;app →
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Titre */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Tableau de bord interne</h1>
          <p className="text-sm text-slate-500 mt-1">Métriques temps réel · {new Date().toLocaleString('fr-FR')}</p>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Revenu mensuel" value={`${monthlyRevenue.toLocaleString('fr-FR')} €`} sub={`${proCount} abonnements Pro`} accent={proCount > 0 ? 'emerald' : undefined} />
          <Kpi label="Total cabinets" value={total} sub={`+${last7} cette semaine`} />
          <Kpi label="Essais actifs" value={trialActive} sub={`${trialExpired} expirés`} accent="amber" />
          <Kpi label="Churn" value={churnedCount} sub={churnedCount > 0 ? 'À investiguer' : 'Aucun'} accent={churnedCount > 0 ? 'red' : undefined} />
        </div>

        {/* Secondaires */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi small label="Leads analysés total" value={totalProspects ?? 0} />
          <Kpi small label="Leads 30 derniers jours" value={totalLeads30d ?? 0} />
          <Kpi small label="Gmail connectés" value={gmailConnected} sub={`${total > 0 ? Math.round(100 * gmailConnected / total) : 0}% activation`} />
          <Kpi small label="Conv. trial → pro" value={`${trialExpired + proCount > 0 ? Math.round(100 * proCount / (trialExpired + proCount)) : 0}%`} sub="Sur essais terminés" />
        </div>

        {/* Tableau cabinets */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Tous les cabinets</h2>
            <span className="text-xs text-slate-500">{total} inscrits</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <Th>Cabinet</Th>
                    <Th>Email</Th>
                    <Th>Plan</Th>
                    <Th>Inscrit</Th>
                    <Th>Gmail</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allProfiles.map((p, i) => (
                    <tr key={p.id} className={p.is_admin ? 'bg-amber-50/30' : ''}>
                      <Td>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {(p.broker_memory?.agencyName ?? p.email).slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{p.broker_memory?.agencyName ?? '—'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{p.broker_memory?.fullName ?? ''}</p>
                          </div>
                          {p.is_admin && <span className="text-[8px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-1 py-0.5 rounded">Admin</span>}
                        </div>
                      </Td>
                      <Td><span className="text-xs text-slate-600">{p.email}</span></Td>
                      <Td>
                        <PlanBadge plan={p.subscription_plan} status={p.subscription_status} />
                      </Td>
                      <Td>
                        <span className="text-xs text-slate-500">
                          {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </Td>
                      <Td>
                        {p.gmail_connected_email
                          ? <span className="text-xs text-emerald-600">✓ Connecté</span>
                          : <span className="text-xs text-slate-300">—</span>}
                      </Td>
                    </tr>
                  ))}
                  {total === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-500">
                        Aucun cabinet inscrit pour l&apos;instant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-4 py-2.5">{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>
}

function PlanBadge({ plan, status }: { plan: string | null; status: string | null }) {
  if (plan === 'pro' && status !== 'canceled') {
    return <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">Pro</span>
  }
  if (status === 'canceled') {
    return <span className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full">Churn</span>
  }
  return <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">Trial</span>
}
