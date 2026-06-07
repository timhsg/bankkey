'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SOURCE_ICONS } from '@/lib/sources/icons'
import { aggregateSourceStats, type SourceStats } from '@/lib/sources/detection'
import { MAIL_CHANNELS, CATEGORY_INFO, STATUS_INFO, type MailChannel } from '@/lib/sources/mailbox'

// ════════════════════════════════════════════════════════════════════════
//  /pro/sources — Toutes les sources d'ingestion
//  Plusieurs canaux activables en parallèle
// ════════════════════════════════════════════════════════════════════════

interface Profile {
  forwarding_address: string | null
  gmail_connected_email: string | null
  gmail_last_processed_at: string | null
}

interface Prospect {
  detected_source: { sourceId: string; sourceName: string } | null
  scoring: { score: number; temperature: string } | null
  received_at: string | null
  created_at: string
}

export default function SourcesPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile, setProfile]     = useState<Profile | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading]     = useState(true)
  const [syncing, setSyncing]     = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }

      const [{ data: profileData }, { data: prospectsData }] = await Promise.all([
        supabase.from('profiles')
          .select('forwarding_address, gmail_connected_email, gmail_last_processed_at')
          .single(),
        supabase.from('prospects')
          .select('detected_source, scoring, received_at, created_at')
          .order('created_at', { ascending: false })
          .limit(500),
      ])

      setProfile(profileData)
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
        headers: { 'Content-Type': 'application/json', 'X-Internal-Request': 'true' },
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  const gmailConnected = !!profile?.gmail_connected_email
  const anyChannelLive = gmailConnected
  const categories: Array<MailChannel['category']> = ['oauth', 'imap', 'forwarding', 'api']

  return (
    <div className="min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">Sources de leads</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {anyChannelLive
                ? `${totalLeads} leads analysés · ${totalHot} prioritaires`
                : 'Choisissez un ou plusieurs canaux d\'ingestion'}
            </p>
          </div>
          {gmailConnected && (
            <button
              onClick={syncGmail}
              disabled={syncing}
              className="flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg transition-base disabled:opacity-50"
            >
              {syncing
                ? <span className="w-3 h-3 border border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                )}
              {syncing ? 'Synchronisation' : 'Synchroniser'}
            </button>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* ═══ Si Gmail connecté : carte état actif ═══ */}
        {gmailConnected && (
          <MailboxConnected
            email={profile!.gmail_connected_email!}
            lastSync={profile!.gmail_last_processed_at}
            totalLeads={totalLeads}
            totalHot={totalHot}
          />
        )}

        {/* ═══ Sources auto-détectées ═══ */}
        {gmailConnected && sourceStats.length > 0 && (
          <DetectedSources stats={sourceStats} />
        )}

        {/* ═══ Catalogue de canaux ═══ */}
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Canaux d&apos;ingestion disponibles</h2>
            <p className="text-xs text-slate-500">
              Activez plusieurs canaux en parallèle — BankKey unifie les leads dans un même tableau de bord.
            </p>
          </div>

          {categories.map(cat => {
            const channels = MAIL_CHANNELS.filter(c => c.category === cat)
            const info = CATEGORY_INFO[cat]

            return (
              <div key={cat}>
                <div className="mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{info.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{info.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {channels.map(channel => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      gmailConnected={gmailConnected}
                      forwardingAddress={profile?.forwarding_address ?? null}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  ChannelCard
// ════════════════════════════════════════════════════════════════════════

function ChannelCard({ channel, gmailConnected, forwardingAddress }: {
  channel: MailChannel
  gmailConnected: boolean
  forwardingAddress: string | null
}) {
  const statusInfo = STATUS_INFO[channel.status]
  const isGmail = channel.id === 'gmail'
  const isForwarding = channel.id === 'forwarding'
  const isWebhook = channel.id === 'webhook'

  // État connecté
  const connected = (isGmail && gmailConnected) || (isForwarding && !!forwardingAddress)

  const Icon = SOURCE_ICONS[channel.id]

  return (
    <div className={`relative bg-white border rounded-xl p-4 transition-base ${
      connected
        ? 'border-emerald-300 bg-emerald-50/20'
        : channel.status === 'live'
          ? 'border-slate-200 hover:border-slate-300 hover-lift'
          : 'border-slate-200'
    }`}>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
          {Icon ? <Icon className="w-full h-full" /> : (
            <span className="text-[11px] font-bold text-slate-600">
              {channel.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <h4 className="text-sm font-semibold text-slate-900">{channel.name}</h4>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
              connected ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : statusInfo.tone
            }`}>
              {connected ? 'Connecté' : statusInfo.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{channel.description}</p>
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        {connected && isGmail && (
          <span className="text-xs font-medium text-emerald-700">✓ Actif</span>
        )}
        {!connected && channel.status === 'live' && channel.connectUrl && (
          <a href={channel.connectUrl} className="text-xs font-medium text-slate-900 hover:text-slate-600 transition-colors">
            Connecter →
          </a>
        )}
        {!connected && isForwarding && forwardingAddress && (
          <CopyForwarding address={forwardingAddress} />
        )}
        {channel.status === 'beta' && (
          <a href="mailto:contact@bankkey.ch?subject=Beta%20accès%20{channel.name}" className="text-xs text-blue-600 hover:text-blue-700">
            Demander l&apos;accès bêta
          </a>
        )}
        {channel.status === 'on_request' && (
          <a href="mailto:contact@bankkey.ch" className="text-xs text-amber-700 hover:text-amber-800">
            Nous contacter
          </a>
        )}
        {(channel.status === 'roadmap_q3' || channel.status === 'roadmap_q4') && (
          <span className="text-[11px] text-slate-400">Prévu {statusInfo.label}</span>
        )}
        {isWebhook && (
          <a href="mailto:contact@bankkey.ch?subject=Acc%C3%A8s%20Webhook%20API" className="text-xs text-blue-600 hover:text-blue-700">
            Obtenir une clé API →
          </a>
        )}
      </div>
    </div>
  )
}

function CopyForwarding({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="text-xs font-medium text-slate-900 hover:text-slate-600 transition-colors flex items-center gap-1.5"
      title={address}
    >
      {copied ? '✓ Copié' : `${address.slice(0, 18)}…  ↗`}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  Sous-composants (Gmail connecté + sources détectées)
// ════════════════════════════════════════════════════════════════════════

function MailboxConnected({ email, lastSync, totalLeads, totalHot }: {
  email: string
  lastSync: string | null
  totalLeads: number
  totalHot: number
}) {
  const lastSyncStr = lastSync
    ? new Date(lastSync).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'jamais'

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border border-emerald-200 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center p-1.5 shrink-0">
          <svg className="w-full h-full" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 truncate">{email}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
              Actif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Dernière synchro : {lastSyncStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-emerald-100 rounded-lg px-3 py-2">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Leads analysés</p>
          <p className="text-xl font-semibold text-slate-900 mt-0.5">{totalLeads}</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-lg px-3 py-2">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Dont prioritaires</p>
          <p className="text-xl font-semibold text-emerald-700 mt-0.5">{totalHot}</p>
        </div>
      </div>
    </div>
  )
}

function DetectedSources({ stats }: { stats: SourceStats[] }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Sources auto-détectées dans votre boîte</h2>
        <p className="text-xs text-slate-500">Identification automatique selon l&apos;expéditeur — aucune configuration nécessaire.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {stats.map((stat, idx) => {
          const Icon = SOURCE_ICONS[stat.sourceId]
          const lastDate = stat.lastReceivedAt
            ? new Date(stat.lastReceivedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
            : '—'

          return (
            <div
              key={stat.sourceId}
              className={`px-5 py-4 flex items-center gap-4 ${idx > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                {Icon ? <Icon className="w-full h-full" /> : (
                  <span className="text-xs font-bold text-slate-600">
                    {stat.sourceName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-slate-900 truncate">{stat.sourceName}</p>
                  {stat.hotCount > 0 && (
                    <span className="text-[9px] font-medium uppercase tracking-widest bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">
                      {stat.hotCount} hot
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Dernier lead : {lastDate}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-semibold text-slate-900 tracking-tight">{stat.count}</p>
                <p className="text-[10px] text-slate-400">leads</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
