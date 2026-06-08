import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// ════════════════════════════════════════════════════════════════════════
//  /admin/cabinet/[id] — Drill-down sur un cabinet spécifique
//  Réservé super_admin · bypass RLS pour lecture
// ════════════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CabinetDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/pro/login')

  const { data: me } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()
  if (!me?.is_super_admin) redirect('/pro')

  const admin = createAdminClient()

  const [{ data: profile }, { data: prospects }, { data: outcomes }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', id).single(),
    admin.from('prospects')
      .select('id, email_from_name, email_from, email_subject, status, scoring, detected_source, received_at, created_at, bank_submitted')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    admin.from('deal_outcomes')
      .select('id, bank_name, status, rate_pct, loan_amount, decided_at')
      .eq('user_id', id)
      .order('decided_at', { ascending: false })
      .limit(50),
  ])

  if (!profile) notFound()

  const agencyName = profile.broker_memory?.agencyName ?? null
  const fullName = profile.broker_memory?.fullName ?? null

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
              ← Console admin
            </Link>
            <span className="text-slate-200">|</span>
            <span className="text-xs font-medium text-slate-700">{agencyName ?? profile.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Profil */}
        <section>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">{agencyName ?? '(cabinet sans nom)'}</h1>
          <p className="text-sm text-slate-500">{fullName ?? ''} · {profile.email}</p>
        </section>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Infos compte */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Compte</p>
            <dl className="space-y-2 text-sm">
              <Row label="Plan" value={profile.subscription_plan ?? 'trial'} />
              <Row label="Statut" value={profile.subscription_status ?? '—'} />
              <Row label="Trial fin" value={profile.trial_ends_at ? new Date(profile.trial_ends_at).toLocaleDateString('fr-FR') : '—'} />
              <Row label="Stripe customer" value={profile.stripe_customer_id ?? '—'} mono />
              <Row label="Inscrit" value={new Date(profile.created_at).toLocaleDateString('fr-FR')} />
            </dl>
          </div>

          {/* Sources */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Sources connectées</p>
            <dl className="space-y-2 text-sm">
              <Row label="Gmail" value={profile.gmail_connected_email ?? 'Non connecté'} />
              <Row label="Dernière sync" value={profile.gmail_last_processed_at ? new Date(profile.gmail_last_processed_at).toLocaleString('fr-FR') : '—'} />
              <Row label="Forwarding" value={profile.forwarding_address ?? '—'} mono />
            </dl>
          </div>
        </div>

        {/* Mémoire courtier */}
        {profile.broker_memory && Object.keys(profile.broker_memory).length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Mémoire IA</p>
            <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto max-h-64">
              {JSON.stringify(profile.broker_memory, null, 2)}
            </pre>
          </section>
        )}

        {/* Prospects récents */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Prospects récents (100 max)</p>
            <span className="text-xs text-slate-400">{prospects?.length ?? 0} affichés</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Reçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(prospects ?? []).map((p) => {
                    const pp = p as unknown as {
                      id: string
                      email_from_name: string | null
                      email_subject: string | null
                      status: string
                      scoring: { score?: number; temperature?: string } | null
                      detected_source: { sourceName?: string } | null
                      received_at: string | null
                      created_at: string
                    }
                    return (
                      <tr key={pp.id}>
                        <td className="px-3 py-2">
                          <p className="font-medium text-slate-900 truncate max-w-xs">{pp.email_from_name ?? '—'}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{pp.email_subject ?? ''}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{pp.detected_source?.sourceName ?? 'Direct'}</td>
                        <td className="px-3 py-2">
                          {pp.scoring?.score !== undefined ? (
                            <span className={`font-mono font-semibold ${
                              pp.scoring.temperature === 'hot' ? 'text-emerald-700' :
                              pp.scoring.temperature === 'warm' ? 'text-amber-700' : 'text-slate-500'
                            }`}>{pp.scoring.score}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{pp.status}</td>
                        <td className="px-3 py-2 text-slate-500">
                          {new Date(pp.received_at ?? pp.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    )
                  })}
                  {(prospects?.length ?? 0) === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">Aucun prospect</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Décisions bancaires</p>
            <span className="text-xs text-slate-400">{outcomes?.length ?? 0} enregistrées</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Banque</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Taux</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider">Décidé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(outcomes ?? []).map((o) => {
                    const oo = o as unknown as { id: string; bank_name: string; status: string; rate_pct: number | null; loan_amount: number | null; decided_at: string }
                    return (
                      <tr key={oo.id}>
                        <td className="px-3 py-2 font-medium text-slate-900">{oo.bank_name}</td>
                        <td className="px-3 py-2 text-slate-600">{oo.status}</td>
                        <td className="px-3 py-2 font-mono">{oo.rate_pct ? `${oo.rate_pct}%` : '—'}</td>
                        <td className="px-3 py-2 font-mono">{oo.loan_amount ? `${oo.loan_amount.toLocaleString('fr-FR')} €` : '—'}</td>
                        <td className="px-3 py-2 text-slate-500">{new Date(oo.decided_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    )
                  })}
                  {(outcomes?.length ?? 0) === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">Aucune décision enregistrée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 border-b border-slate-100 last:border-0">
      <dt className="text-xs text-slate-500 w-32 shrink-0">{label}</dt>
      <dd className={`text-xs text-slate-900 ${mono ? 'font-mono' : ''} truncate`}>{value}</dd>
    </div>
  )
}
