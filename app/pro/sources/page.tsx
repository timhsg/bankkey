'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SOURCE_ICONS } from '@/lib/sources/icons'
import { aggregateSourceStats, type SourceStats } from '@/lib/sources/detection'

// ═══════════════════════════════════════════════════════════════════════
//  /pro/sources — Connecter ses sources de leads
//  Objectif : le plus clair et rapide possible. 2 voies "1 clic" (Gmail,
//  Outlook) + 1 voie universelle (transfert). Le reste est masqué.
// ═══════════════════════════════════════════════════════════════════════

interface Profile {
  forwarding_address: string | null
  gmail_connected_email: string | null
  gmail_last_processed_at: string | null
  outlook_connected_email?: string | null
}

interface Prospect {
  detected_source: { sourceId: string; sourceName: string } | null
  scoring: { score: number; temperature: string } | null
  received_at: string | null
  created_at: string
}

const ERROR_MESSAGES: Record<string, string> = {
  demo_account: 'Le compte démo est partagé — la connexion d\'une boîte mail est désactivée.',
  outlook_not_configured: 'La connexion Outlook native arrive bientôt. En attendant, utilisez le transfert email ci-dessous (ça marche pour Outlook aussi).',
  outlook_oauth_failed: 'La connexion Outlook a échoué. Réessayez.',
  outlook_token_save_failed: 'Erreur lors de la sauvegarde Outlook. Réessayez.',
}

export default function SourcesPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile, setProfile]     = useState<Profile | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading]     = useState(true)
  const [syncing, setSyncing]     = useState(false)
  const [banner, setBanner]       = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  // Lire ?connected= / ?error= sans dépendre de Suspense
  useEffect(() => {
    if (typeof window === 'undefined') return
    const p = new URLSearchParams(window.location.search)
    if (p.get('connected') === 'gmail')   setBanner({ type: 'ok', text: 'Gmail connecté. La première synchronisation est en cours.' })
    if (p.get('connected') === 'outlook')  setBanner({ type: 'ok', text: 'Outlook connecté. La première synchronisation est en cours.' })
    const err = p.get('error')
    if (err) setBanner({ type: 'error', text: ERROR_MESSAGES[err] ?? 'Une erreur est survenue.' })
    if (p.get('connected') || err) {
      window.history.replaceState({}, '', '/pro/sources')
    }
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }

      const [{ data: profileData }, { data: prospectsData }] = await Promise.all([
        supabase.from('profiles')
          .select('forwarding_address, gmail_connected_email, gmail_last_processed_at, outlook_connected_email')
          .single(),
        supabase.from('prospects')
          .select('detected_source, scoring, received_at, created_at')
          .order('created_at', { ascending: false })
          .limit(500),
      ])

      setProfile(profileData as Profile)
      setProspects((prospectsData ?? []) as Prospect[])
      setLoading(false)
    }
    void load()
  }, [supabase, router])

  const sourceStats = useMemo(() => aggregateSourceStats(prospects), [prospects])
  const totalLeads = sourceStats.reduce((s, st) => s + st.count, 0)
  const totalHot = sourceStats.reduce((s, st) => s + st.hotCount, 0)

  async function syncGmail() {
    setSyncing(true)
    try {
      await fetch('/api/gmail/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const { data } = await supabase.from('prospects')
        .select('detected_source, scoring, received_at, created_at')
        .order('created_at', { ascending: false })
        .limit(500)
      setProspects((data ?? []) as Prospect[])
    } finally { setSyncing(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const gmailConnected   = !!profile?.gmail_connected_email
  const outlookConnected = !!profile?.outlook_connected_email
  const anyConnected     = gmailConnected || outlookConnected

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Configuration</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">Vos sources de leads</h1>
            <p className="text-xs text-[#6B7280] mt-1.5">
              {anyConnected
                ? `${totalLeads} leads analysés · ${totalHot} prioritaires`
                : 'Connectez une boîte en 1 clic — ça prend 30 secondes'}
            </p>
          </div>
          {gmailConnected && (
            <button
              onClick={syncGmail}
              disabled={syncing}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#D1D5DB] hover:border-navy text-[#374151] hover:text-navy px-3 py-2 rounded-lg transition-all disabled:opacity-50 shrink-0"
            >
              {syncing
                ? <span className="w-3 h-3 border border-[#D1D5DB] border-t-navy rounded-full animate-spin" />
                : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>}
              <span className="hidden sm:inline">{syncing ? 'Synchronisation' : 'Synchroniser'}</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-8 space-y-8">

        {/* Banner connexion / erreur */}
        {banner && (
          <div className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
            banner.type === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}>
            <span className="shrink-0 mt-0.5">
              {banner.type === 'ok'
                ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            </span>
            {banner.text}
          </div>
        )}

        {/* État connecté */}
        {gmailConnected && (
          <MailboxConnected
            provider="Gmail"
            email={profile!.gmail_connected_email!}
            lastSync={profile!.gmail_last_processed_at}
            totalLeads={totalLeads}
            totalHot={totalHot}
          />
        )}
        {outlookConnected && (
          <MailboxConnected
            provider="Outlook"
            email={profile!.outlook_connected_email!}
            lastSync={null}
            totalLeads={totalLeads}
            totalHot={totalHot}
          />
        )}
        {anyConnected && sourceStats.length > 0 && <DetectedSources stats={sourceStats} />}

        {/* ── Étape 1 : connecter une boîte (1 clic) ── */}
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 h-6 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <h2 className="text-sm font-extrabold text-navy">Connectez votre boîte mail</h2>
              <p className="text-xs text-[#6B7280]">Là où arrivent déjà vos demandes (SeLoger, Empruntis, Pretto…). Lecture seule, en 1 clic.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <ConnectCard
              name="Gmail"
              desc="Google Workspace ou Gmail"
              href="/api/gmail/connect"
              connected={gmailConnected}
              logo={<GoogleLogo />}
            />
            <ConnectCard
              name="Outlook 365"
              desc="Microsoft 365 / Outlook.com"
              href="/api/outlook/connect"
              connected={outlookConnected}
              logo={<OutlookLogo />}
            />
          </div>
        </section>

        {/* ── Étape 2 : transfert universel ── */}
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#E5E7EB] text-[#374151] text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <h2 className="text-sm font-extrabold text-navy">Ou transférez depuis n&apos;importe quelle source</h2>
              <p className="text-xs text-[#6B7280]">Une autre boîte, un CRM, une plateforme. Marche partout, même sans connexion.</p>
            </div>
          </div>
          <ForwardingBlock address={profile?.forwarding_address ?? null} />
        </section>

        {/* Autres canaux — discret */}
        <details className="group">
          <summary className="cursor-pointer list-none text-xs font-semibold text-[#9CA3AF] hover:text-navy transition-colors flex items-center gap-1.5">
            <svg className="w-3 h-3 group-open:rotate-90 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            Autres canaux (IMAP, Zapier, API…) — bientôt
          </summary>
          <p className="text-xs text-[#9CA3AF] mt-3 pl-4 leading-relaxed">
            Yahoo, iCloud, OVH, ProtonMail (IMAP), Zapier, Make et un webhook API REST arrivent prochainement.
            Besoin de l&apos;un d&apos;eux maintenant ? Écrivez à <a href="mailto:contact@bankkey.ch" className="text-accent hover:underline">contact@bankkey.ch</a>.
          </p>
        </details>
      </main>
    </div>
  )
}

// ── Carte de connexion 1-clic ───────────────────────────────────────────

function ConnectCard({ name, desc, href, connected, logo }: {
  name: string; desc: string; href: string; connected: boolean; logo: React.ReactNode
}) {
  if (connected) {
    return (
      <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#F7F8FA] flex items-center justify-center p-1.5 shrink-0">{logo}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-navy">{name}</p>
          <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Connecté
          </p>
        </div>
      </div>
    )
  }
  return (
    <a href={href} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3 hover:border-navy hover:shadow-card transition-all group">
      <div className="w-10 h-10 rounded-lg bg-[#F7F8FA] flex items-center justify-center p-1.5 shrink-0">{logo}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-navy">{name}</p>
        <p className="text-xs text-[#6B7280]">{desc}</p>
      </div>
      <span className="text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform shrink-0">Connecter →</span>
    </a>
  )
}

// ── Bloc transfert universel avec mode d'emploi ────────────────────────

function ForwardingBlock({ address }: { address: string | null }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      {/* Adresse */}
      <div className="p-5 bg-brand-gradient text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-2">Votre adresse BankKey</p>
        {address ? (
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-mono font-bold bg-white/10 px-3 py-2 rounded-lg break-all">{address}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="text-xs font-bold bg-white text-navy hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors shrink-0"
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-blue-100">Votre adresse de transfert sera générée à la connexion de votre compte. Contactez-nous si elle n&apos;apparaît pas.</p>
        )}
      </div>

      {/* Mode d'emploi */}
      <div className="p-5">
        <p className="text-xs font-bold text-navy mb-3">Comment l&apos;utiliser, en 3 étapes :</p>
        <ol className="space-y-3 text-sm text-[#374151]">
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-[11px] font-bold text-navy flex items-center justify-center shrink-0">1</span>
            <span>Dans votre boîte mail (Outlook, Gmail, autre), créez une <strong className="text-navy">règle de transfert automatique</strong> vers l&apos;adresse ci-dessus.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-[11px] font-bold text-navy flex items-center justify-center shrink-0">2</span>
            <span>Ciblez les expéditeurs de leads : <span className="text-[#6B7280]">Empruntis, SeLoger, Pretto, Meilleurtaux…</span> (ou tout transférer si votre boîte ne reçoit que des leads).</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-[11px] font-bold text-navy flex items-center justify-center shrink-0">3</span>
            <span>C&apos;est tout. Chaque demande transférée est qualifiée et préparée automatiquement, comme si elle arrivait par connexion directe.</span>
          </li>
        </ol>
        <p className="text-[11px] text-[#9CA3AF] mt-4 leading-relaxed">
          Astuce : la plupart des courtiers connectent leur boîte principale à l&apos;étape 1 (elle reçoit déjà tout) et n&apos;utilisent le transfert que pour une boîte secondaire.
        </p>
      </div>
    </div>
  )
}

// ── État connecté ───────────────────────────────────────────────────────

function MailboxConnected({ provider, email, lastSync, totalLeads, totalHot }: {
  provider: string; email: string; lastSync: string | null; totalLeads: number; totalHot: number
}) {
  const lastSyncStr = lastSync
    ? new Date(lastSync).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'à la prochaine synchro'

  return (
    <div className="bg-white border-2 border-emerald-200 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-navy truncate">{email}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">{provider} actif</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">Dernière synchro : {lastSyncStr}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Leads analysés</p>
          <p className="text-xl font-extrabold text-navy mt-0.5 tabular-nums">{totalLeads}</p>
        </div>
        <div className="bg-[#F7F8FA] rounded-lg px-3 py-2">
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Dont prioritaires</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5 tabular-nums">{totalHot}</p>
        </div>
      </div>
    </div>
  )
}

function DetectedSources({ stats }: { stats: SourceStats[] }) {
  return (
    <div>
      <p className="text-xs font-bold text-navy mb-1">Sources détectées automatiquement</p>
      <p className="text-xs text-[#6B7280] mb-3">BankKey reconnaît la provenance de chaque lead — aucune config.</p>
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        {stats.map((stat, idx) => {
          const Icon = SOURCE_ICONS[stat.sourceId]
          const lastDate = stat.lastReceivedAt
            ? new Date(stat.lastReceivedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
            : '—'
          return (
            <div key={stat.sourceId} className={`px-5 py-3 flex items-center gap-4 ${idx > 0 ? 'border-t border-[#F3F4F6]' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-[#F7F8FA] flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                {Icon ? <Icon className="w-full h-full" /> : <span className="text-xs font-bold text-[#6B7280]">{stat.sourceName.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy truncate">{stat.sourceName}</p>
                  {stat.hotCount > 0 && <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">{stat.hotCount} hot</span>}
                </div>
                <p className="text-[11px] text-[#9CA3AF]">Dernier lead : {lastDate}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-extrabold text-navy tabular-nums">{stat.count}</p>
                <p className="text-[10px] text-[#9CA3AF]">leads</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Logos ───────────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function OutlookLogo() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24">
      <path fill="#0A2767" d="M23 12.4v8.1c0 .4-.3.7-.7.7H13v-9.5z"/>
      <path fill="#0364B8" d="M23 5.1v1.3l-7.5 4.6L13 9.5V5.1c0-.4.3-.7.7-.7h8.6c.4 0 .7.3.7.7z"/>
      <path fill="#28A8EA" d="M13 9.5v8.9l-2.2-.5L1 13.5v-4z"/>
      <path fill="#0078D4" d="M13 4.4V9.5L7 13 1 9.5V5.1c0-.4.3-.7.7-.7z"/>
      <path fill="#14447D" d="M1 9.5h6V16H1z"/>
      <rect width="11" height="11" x="0.5" y="6.5" fill="#0078D4" rx="1.2"/>
      <path fill="#fff" d="M6 8.6c-1.6 0-2.7 1.2-2.7 3.4S4.4 15.4 6 15.4s2.7-1.2 2.7-3.4S7.6 8.6 6 8.6zm0 5.4c-.8 0-1.3-.8-1.3-2s.5-2 1.3-2 1.3.8 1.3 2-.5 2-1.3 2z"/>
    </svg>
  )
}
