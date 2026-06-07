'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ScoringResult, QualificationResult } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  /pro — Page d'accueil "Aujourd'hui"
//  Vue focus : top 3 prospects prioritaires + statut activité du jour
// ════════════════════════════════════════════════════════════════════════

interface Prospect {
  id: string
  email_from_name: string | null
  email_from: string | null
  email_subject: string | null
  received_at: string | null
  created_at: string
  status: 'new' | 'viewed' | 'replied' | 'archived'
  scoring: ScoringResult | null
  qualification: QualificationResult | null
}

interface Profile {
  email: string
  agency_name: string | null
  gmail_connected_email: string | null
  broker_memory: { fullName?: string } | null
}

const TEMP_RING: Record<string, string> = {
  cold: '#94a3b8', warm: '#f59e0b', hot: '#10b981',
}

function MiniScore({ score, temp }: { score: number; temp: 'cold' | 'warm' | 'hot' }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={TEMP_RING[temp]} strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-900">{score}</span>
      </div>
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'À l\'instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'hier' : `il y a ${d}j`
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export default function TodayPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile, setProfile]     = useState<Profile | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/pro/login'); return }

    const [{ data: profileData }, { data: prospectsData }] = await Promise.all([
      supabase.from('profiles').select('email, agency_name, gmail_connected_email, broker_memory').single(),
      supabase.from('prospects')
        .select('id, email_from_name, email_from, email_subject, received_at, created_at, status, scoring, qualification')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    setProfile(profileData)
    setProspects((prospectsData ?? []) as Prospect[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { void load() }, [load])

  // ── Computations ──

  const top3 = useMemo(() => {
    return [...prospects]
      .filter(p => p.status !== 'replied')
      .sort((a, b) => (b.scoring?.score ?? 0) - (a.scoring?.score ?? 0))
      .slice(0, 3)
  }, [prospects])

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0)
    return prospects.filter(p => new Date(p.received_at ?? p.created_at) >= d)
  }, [prospects])

  const stats = useMemo(() => {
    const hot = prospects.filter(p => p.scoring?.temperature === 'hot' && p.status !== 'replied')
    const newCount = prospects.filter(p => p.status === 'new')
    const repliedToday = today.filter(p => p.status === 'replied')

    return {
      newToday: today.length,
      hotPending: hot.length,
      newPending: newCount.length,
      repliedToday: repliedToday.length,
    }
  }, [prospects, today])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = profile?.broker_memory?.fullName?.split(' ')[0]
    ?? profile?.email?.split('@')[0]
    ?? ''

  return (
    <div className="min-h-screen">

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* ── Salutation ── */}
        <div className="pl-12 lg:pl-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            {greeting()}{firstName ? ` ${firstName.charAt(0).toUpperCase() + firstName.slice(1)}` : ''}.
          </h1>
          <p className="text-slate-600 mt-2">
            {stats.hotPending > 0
              ? `Vous avez ${stats.hotPending} dossier${stats.hotPending > 1 ? 's' : ''} prioritaire${stats.hotPending > 1 ? 's' : ''} à traiter aujourd'hui.`
              : stats.newPending > 0
                ? `${stats.newPending} nouveaux prospects à qualifier.`
                : 'Pas de dossier urgent à traiter. Bonne journée.'}
          </p>
        </div>

        {/* ── Stats du jour ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Reçus aujourd\'hui',    value: stats.newToday,     accent: '' },
            { label: 'Prioritaires',          value: stats.hotPending,   accent: stats.hotPending > 0 ? 'text-emerald-700' : '' },
            { label: 'En attente',            value: stats.newPending,   accent: '' },
            { label: 'Répondus aujourd\'hui', value: stats.repliedToday, accent: '' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-semibold tracking-tight mt-1 ${s.accent || 'text-slate-900'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Action principale du jour : top 3 ── */}
        {top3.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">À traiter en priorité</h2>
              <Link href="/pro/prospects" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
                Tous les prospects →
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {top3.map((p, idx) => {
                const name = p.qualification?.firstName
                  ? `${p.qualification.firstName}${p.qualification.lastName ? ' ' + p.qualification.lastName : ''}`
                  : p.email_from_name || p.email_from || 'Inconnu'
                const desc = p.qualification?.description ?? p.email_subject ?? ''
                const temp = p.scoring?.temperature ?? 'cold'

                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/pro/leads/${p.id}`)}
                    className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left ${
                      idx > 0 ? 'border-t border-slate-100' : ''
                    }`}
                  >
                    <MiniScore score={p.scoring?.score ?? 0} temp={temp as 'cold' | 'warm' | 'hot'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-900 truncate">{name}</span>
                        {p.status === 'new' && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{desc}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{timeAgo(p.received_at ?? p.created_at)}</span>
                    <svg className="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Gmail non connecté → CTA ── */}
        {!profile?.gmail_connected_email && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">Connectez votre Gmail</p>
              <p className="text-xs text-slate-500">Pour commencer à recevoir vos prospects automatiquement analysés.</p>
            </div>
            <Link
              href="/pro/onboarding"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              Connecter
            </Link>
          </div>
        )}

        {/* ── Empty state ── */}
        {top3.length === 0 && profile?.gmail_connected_email && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-sm text-slate-600 mb-1">Tout est traité.</p>
            <p className="text-xs text-slate-400">Aucun prospect prioritaire pour l&apos;instant.</p>
          </div>
        )}

      </main>
    </div>
  )
}
