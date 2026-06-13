'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ScoringResult, QualificationResult } from '@/types'

// ═══════════════════════════════════════════════════════════════════════
//  /pro — Aujourd'hui
//  Dashboard bancaire pro : 4 stats cards + table priorité + actions
// ═══════════════════════════════════════════════════════════════════════

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l\'instant'
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'hier' : `${d} j`
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

// ── Mini composants ──

function ScoreBadge({ score }: { score: number }) {
  let color = 'bg-slate-100 text-slate-600 border-slate-200'
  if (score >= 80) color = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  else if (score >= 60) color = 'bg-amber-50 text-amber-700 border-amber-200'
  else if (score >= 40) color = 'bg-blue-50 text-blue-700 border-blue-200'

  return (
    <div className={`w-11 h-11 rounded-lg border ${color} flex flex-col items-center justify-center shrink-0`}>
      <span className="text-base font-extrabold leading-none tabular-nums">{score}</span>
      <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 mt-0.5">/100</span>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const cfg = {
    new:      { label: 'Nouveau',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    viewed:   { label: 'Vu',       cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    replied:  { label: 'Répondu',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    archived: { label: 'Archivé',  cls: 'bg-slate-50 text-slate-400 border-slate-200' },
  }[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' }

  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  Page
// ═══════════════════════════════════════════════════════════════════════

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
        .not('status', 'in', '(archived,filtered)')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    setProfile(profileData)
    setProspects((prospectsData ?? []) as Prospect[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { void load() }, [load])

  // ── Computations ──

  const top5 = useMemo(() => {
    return [...prospects]
      .filter(p => p.status !== 'replied')
      .sort((a, b) => (b.scoring?.score ?? 0) - (a.scoring?.score ?? 0))
      .slice(0, 5)
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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = profile?.broker_memory?.fullName?.split(' ')[0]
    ?? profile?.email?.split('@')[0]
    ?? ''

  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Header de page ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Tableau de bord</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">
              {greeting()}{firstName ? `, ${firstName.charAt(0).toUpperCase() + firstName.slice(1)}` : ''}
            </h1>
            <p className="text-xs text-[#6B7280] mt-1.5 capitalize">{dateLabel}</p>
          </div>
          {profile?.gmail_connected_email && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#6B7280] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-700">Gmail connecté</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">

        {/* ── 4 stats cards bancaires ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Demandes reçues',
              value: stats.newToday,
              hint: 'aujourd\'hui',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              ),
              iconBg: 'bg-blue-50 text-blue-600',
            },
            {
              label: 'Dossiers prioritaires',
              value: stats.hotPending,
              hint: 'à appeler',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              ),
              iconBg: 'bg-emerald-50 text-emerald-600',
            },
            {
              label: 'En attente',
              value: stats.newPending,
              hint: 'à qualifier',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              iconBg: 'bg-amber-50 text-amber-600',
            },
            {
              label: 'Répondus',
              value: stats.repliedToday,
              hint: 'aujourd\'hui',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ),
              iconBg: 'bg-[#F7F8FA] text-[#6B7280]',
            },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 hover:shadow-card transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">{s.label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-navy tracking-tightest tabular-nums leading-none">{s.value}</p>
              <p className="text-[11px] text-[#9CA3AF] mt-1.5 font-medium">{s.hint}</p>
            </div>
          ))}
        </div>

        {/* ── Action principale du jour ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-card">

          {/* En-tête section */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
            <div>
              <h2 className="text-sm font-extrabold text-navy">À traiter en priorité</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {stats.hotPending > 0
                  ? `${stats.hotPending} prospect${stats.hotPending > 1 ? 's' : ''} qualifié${stats.hotPending > 1 ? 's' : ''} en attente d'appel`
                  : top5.length > 0
                    ? 'Top 5 par score de bancabilité'
                    : 'Aucun prospect à traiter'}
              </p>
            </div>
            {top5.length > 0 && (
              <Link href="/pro/prospects" className="text-xs font-semibold text-accent hover:text-navy transition-colors flex items-center gap-1">
                Voir tous les prospects
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            )}
          </div>

          {/* Liste */}
          {top5.length > 0 ? (
            <div className="divide-y divide-[#F3F4F6]">
              {top5.map((p) => {
                const name = p.qualification?.firstName
                  ? `${p.qualification.firstName}${p.qualification.lastName ? ' ' + p.qualification.lastName : ''}`
                  : p.email_from_name || p.email_from || 'Inconnu'
                const desc = p.qualification?.description ?? p.email_subject ?? ''

                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/pro/leads/${p.id}`)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors text-left group"
                  >
                    <ScoreBadge score={p.scoring?.score ?? 0} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-navy truncate">{name}</span>
                        <StatusPill status={p.status} />
                      </div>
                      <p className="text-xs text-[#6B7280] truncate">{desc}</p>
                    </div>

                    <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Reçu</span>
                      <span className="text-xs text-[#374151] font-medium tabular-nums">{timeAgo(p.received_at ?? p.created_at)}</span>
                    </div>

                    <svg className="w-4 h-4 text-[#D1D5DB] group-hover:text-navy transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-navy mb-1">Tout est traité</p>
              <p className="text-xs text-[#6B7280]">Aucun prospect prioritaire pour l&apos;instant.</p>
            </div>
          )}
        </div>

        {/* ── Gmail non connecté ── */}
        {!profile?.gmail_connected_email && (
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-accent rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_24px_rgba(59,95,224,0.08)]">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0 shadow-btn">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-extrabold text-navy mb-0.5">Connectez votre boîte Gmail</p>
                <p className="text-xs text-[#6B7280]">Pour commencer à recevoir vos demandes de financement automatiquement qualifiées.</p>
              </div>
            </div>
            <Link href="/pro/onboarding" className="btn-primary text-sm whitespace-nowrap shrink-0">
              Connecter Gmail
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
