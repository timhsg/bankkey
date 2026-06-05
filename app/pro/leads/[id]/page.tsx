'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { QualificationResult, ScoringResult, ProspectionResult } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProspectFull {
  id: string
  email_from_name: string | null
  email_from: string | null
  email_subject: string | null
  email_body: string | null
  gmail_thread_id: string | null
  received_at: string | null
  created_at: string
  status: string
  qualification: QualificationResult | null
  scoring: ScoringResult | null
  prospection: ProspectionResult | null
}

// ── Config ────────────────────────────────────────────────────────────────────

const TEMP = {
  cold: { label: 'Non prioritaire', badge: 'bg-slate-100 text-slate-500', ring: '#94a3b8' },
  warm: { label: 'À qualifier',     badge: 'bg-amber-50 text-amber-700',  ring: '#fbbf24' },
  hot:  { label: 'Prioritaire',     badge: 'bg-emerald-50 text-emerald-700', ring: '#34d399' },
} as const

const TIMELINE_LABEL: Record<string, string> = {
  less_3_months: '< 3 mois',
  '3_to_6_months': '3–6 mois',
  more_6_months: '> 6 mois',
}

const FINANCING_LABEL: Record<string, string> = {
  obtained: 'Obtenu', in_progress: 'En cours', none: 'Non démarré',
}

// ── Sous-composants ───────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  )
}

function ScoreRing({ score, temperature }: { score: number; temperature: 'cold' | 'warm' | 'hot' }) {
  const r = 40, circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color  = TEMP[temperature].ring

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900 leading-none">{score}</span>
        <span className="text-[9px] text-slate-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const params  = useParams<{ id: string }>()
  const router  = useRouter()
  const supabase = createClient()

  const [prospect, setProspect] = useState<ProspectFull | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<'email' | 'call'>('email')
  const [copied,   setCopied]   = useState(false)
  const [sending,  setSending]  = useState(false)
  const [profile,  setProfile]  = useState<{ gmail_access_token: string | null; gmail_refresh_token: string | null } | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: prof }] = await Promise.all([
        supabase.from('prospects').select('*').eq('id', params.id).single(),
        supabase.from('profiles').select('gmail_access_token, gmail_refresh_token').single(),
      ])

      setProspect(p as ProspectFull)
      setProfile(prof)

      // Marquer comme vu
      if (p?.status === 'new') {
        await supabase.from('prospects').update({ status: 'viewed' }).eq('id', params.id)
      }

      setLoading(false)
    }
    void load()
  }, [params.id, supabase])

  async function sendReply() {
    if (!prospect?.prospection || !profile?.gmail_access_token || !profile?.gmail_refresh_token) return
    setSending(true)
    try {
      const res = await fetch('/api/gmail/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:       prospect.email_from,
          subject:  prospect.email_subject,
          body:     prospect.prospection.email.body,
          threadId: prospect.gmail_thread_id,
        }),
      })
      if (res.ok) {
        await supabase.from('prospects').update({ status: 'replied' }).eq('id', params.id)
        setProspect(p => p ? { ...p, status: 'replied' } : p)
      }
    } finally {
      setSending(false)
    }
  }

  async function archive() {
    await supabase.from('prospects').update({ status: 'archived' }).eq('id', params.id)
    router.push('/pro')
  }

  function copyEmail() {
    if (!prospect?.prospection) return
    const text = `Objet : ${prospect.prospection.email.subject}\n\n${prospect.prospection.email.body}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!prospect) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Prospect introuvable.</p>
      </div>
    )
  }

  const q    = prospect.qualification
  const s    = prospect.scoring
  const p    = prospect.prospection
  const temp = s?.temperature ? TEMP[s.temperature] : null

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <button onClick={() => router.push('/pro')} className="text-sm text-slate-500 hover:text-slate-700">
            ← Tableau de bord
          </button>
          <div className="flex items-center gap-2">
            {prospect.status === 'replied' ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Répondu
              </span>
            ) : (
              <button
                onClick={sendReply}
                disabled={sending || !profile?.gmail_access_token}
                className="text-xs bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200
                           text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {sending ? 'Envoi...' : '↑ Envoyer la réponse'}
              </button>
            )}
            <button onClick={archive} className="text-xs text-slate-400 hover:text-slate-600">
              Archiver
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-4">

        {/* Score */}
        {s && temp && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start gap-5">
              <ScoreRing score={s.score} temperature={s.temperature} />
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {q?.firstName && (
                    <span className="font-semibold text-slate-900">
                      {q.firstName}{q.lastName ? ` ${q.lastName}` : ''}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${temp.badge}`}>
                    {temp.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">{s.explanation}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.keyFactors.map((f, i) => (
                    <span key={i} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      +{f.points} {f.factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profil */}
        {q && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Profil</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mb-4">
              <Field label="Email"         value={q.email} />
              <Field label="Téléphone"     value={q.phone} />
              <Field label="Type de bien"  value={q.propertyType} />
              <Field label="Adresse"       value={q.address} />
              <Field label="Surface"       value={q.surface ? `${q.surface} m²` : null} />
              <Field label="Pièces"        value={q.rooms} />
              <Field label="Prix / Budget" value={q.price ? `${q.price.toLocaleString('fr-FR')} €` : null} />
              <Field label="Délai vente"   value={q.sell_timeline ? TIMELINE_LABEL[q.sell_timeline] : null} />
              <Field label="Délai achat"   value={q.purchase_timeline ? TIMELINE_LABEL[q.purchase_timeline] : null} />
              <Field label="Financement"   value={q.financing_status ? FINANCING_LABEL[q.financing_status] : null} />
            </div>
            {q.description && (
              <p className="text-sm text-slate-500 italic">{q.description}</p>
            )}
            {q.urgencySignals.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {q.urgencySignals.map((sig, i) => (
                  <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                    {sig}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Outils */}
        {p && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {(['email', 'call'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    tab === t ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  {t === 'email' ? 'Réponse email' : 'Briefing appel'}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === 'email' && (
                <div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-baseline gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-10 shrink-0">Objet</span>
                      <span className="text-sm font-medium text-slate-800">{p.email.subject}</span>
                    </div>
                    <div className="px-4 py-4">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {p.email.body}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-2.5 flex justify-end">
                    <button onClick={copyEmail} className="text-xs text-slate-400 hover:text-slate-600">
                      {copied ? '✓ Copié' : 'Copier'}
                    </button>
                  </div>
                </div>
              )}

              {tab === 'call' && (
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Contexte</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{p.callScript.briefing}</p>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Ce qu'il veut</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-slate-700">{p.callScript.need}</p>
                    </div>
                  </div>
                  <div className="border border-emerald-200 rounded-xl overflow-hidden">
                    <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Question clé</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-slate-700 italic">« {p.callScript.keyQuestion} »</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email original */}
        {prospect.email_body && (
          <details className="bg-white rounded-xl border border-slate-200">
            <summary className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600">
              Email original
            </summary>
            <div className="px-5 pb-5 pt-0">
              <pre className="text-xs text-slate-500 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                {prospect.email_body}
              </pre>
            </div>
          </details>
        )}

      </main>
    </div>
  )
}
