'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EmptyState } from '../_components/EmptyState'

interface RelevanceCheck {
  relevant?: boolean
  category?: string
  confidence?: number
  reason?: string
}

interface FilteredEmail {
  id: string
  email_from_name: string | null
  email_from: string | null
  email_subject: string | null
  email_body: string | null
  received_at: string | null
  created_at: string
  status: string
  relevance: RelevanceCheck | null
}

export default function FilteredPage() {
  const router = useRouter()
  const supabase = createClient()

  const [emails, setEmails] = useState<FilteredEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/pro/login'); return }

    const { data } = await supabase
      .from('prospects')
      .select('id, email_from_name, email_from, email_subject, email_body, received_at, created_at, status, relevance')
      .eq('status', 'filtered')
      .order('received_at', { ascending: false, nullsFirst: false })
      .limit(100)

    setEmails((data ?? []) as FilteredEmail[])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function restore(id: string) {
    setRestoring(id)
    await supabase
      .from('prospects')
      .update({ status: 'new' })
      .eq('id', id)
    setEmails(prev => prev.filter(e => e.id !== id))
    setRestoring(null)
  }

  const stats = useMemo(() => {
    const byCategory: Record<string, number> = {}
    emails.forEach(e => {
      const cat = e.relevance?.category ?? 'unknown'
      byCategory[cat] = (byCategory[cat] ?? 0) + 1
    })
    return {
      total: emails.length,
      spam: byCategory['spam'] ?? 0,
      personal: byCategory['personal'] ?? 0,
      promotion: byCategory['promotion'] ?? 0,
      other: emails.length - (byCategory['spam'] ?? 0) - (byCategory['personal'] ?? 0) - (byCategory['promotion'] ?? 0),
    }
  }, [emails])

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
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 pl-12 lg:pl-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Activité</p>
              <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">Emails écartés</h1>
              <p className="text-xs text-[#6B7280] mt-1.5 truncate">
                Spam, perso, promotionnel, récupérables en un clic
              </p>
            </div>
            <Link
              href="/pro/prospects"
              className="text-xs font-semibold text-[#6B7280] hover:text-navy transition-colors shrink-0"
            >
              ← Prospects
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total filtrés', value: stats.total },
            { label: 'Spam', value: stats.spam },
            { label: 'Personnel', value: stats.personal },
            { label: 'Promotionnel', value: stats.promotion },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 hover:shadow-card transition-shadow">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-extrabold text-navy tracking-tightest tabular-nums mt-1 leading-none">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Liste */}
        {emails.length === 0 ? (
          <EmptyState
            title="Aucun email écarté"
            description="Le pré-filtre n'a rien écarté pour l'instant. Vos demandes légitimes apparaissent directement dans Prospects."
            action={{ label: 'Voir mes prospects', href: '/pro/prospects' }}
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            }
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Si un email a été filtré par erreur, cliquez sur « Restaurer » pour le faire qualifier.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {emails.map((email) => {
                const category = email.relevance?.category ?? 'unknown'
                const badgeColor =
                  category === 'spam'      ? 'bg-red-50 text-red-700' :
                  category === 'personal'  ? 'bg-amber-50 text-amber-700' :
                  category === 'promotion' ? 'bg-blue-50 text-blue-700' :
                                             'bg-slate-100 text-slate-600'
                const badgeLabel =
                  category === 'spam'      ? 'Spam' :
                  category === 'personal'  ? 'Personnel' :
                  category === 'promotion' ? 'Promotionnel' :
                  category === 'notification' ? 'Notification' :
                                             'Autre'

                return (
                  <div key={email.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {email.email_from_name || email.email_from || 'Inconnu'}
                          </p>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${badgeColor}`}>
                            {badgeLabel}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 truncate">{email.email_subject || '(Pas de sujet)'}</p>
                        {email.relevance?.reason && (
                          <p className="text-xs text-slate-400 mt-1 italic">
                            Raison : {email.relevance.reason}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                          {email.email_from && `${email.email_from} · `}
                          {email.received_at
                            ? new Date(email.received_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => restore(email.id)}
                        disabled={restoring === email.id}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700 transition-colors shrink-0 disabled:opacity-50"
                      >
                        {restoring === email.id ? '...' : 'Restaurer'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 text-center">
          Le pré-filtre utilise l&apos;IA pour écarter les emails non-pertinents (factures Vercel, newsletters LinkedIn, etc.).
          Aucun email légitime ne devrait être filtré. Si c&apos;est le cas, restaurez-le.
        </p>
      </main>
    </div>
  )
}
