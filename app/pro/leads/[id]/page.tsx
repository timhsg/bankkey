'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateDocumentChecklist } from '@/lib/documents/checklist'
import type { QualificationResult, ScoringResult, ProspectionResult, DocumentChecklistResult } from '@/types'
import NotesEditor from '../../_components/NotesEditor'
import BankTracker from '../../_components/BankTracker'
import ActivityTimeline from '../../_components/ActivityTimeline'
import { logActivity, activityViewed, type Activity } from '@/lib/activity'

interface BankSubmission {
  name: string
  submitted_at?: string
  status?: 'pending' | 'accepted' | 'rejected' | 'counter'
  rate?: number
  notes?: string
}

// ── Types ──────────────────────────────────────────────────────────────────

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
  broker_notes: string | null
  bank_submitted: BankSubmission[] | null
  activity: Activity[] | null
}

type Tab = 'overview' | 'communication' | 'banks' | 'history'

// ── Config ─────────────────────────────────────────────────────────────────

const TEMP = {
  cold: { label: 'Non prioritaire', badge: 'bg-slate-100 text-slate-600',   ring: '#94a3b8' },
  warm: { label: 'À qualifier',     badge: 'bg-amber-50 text-amber-700',    ring: '#f59e0b' },
  hot:  { label: 'Prioritaire',     badge: 'bg-emerald-50 text-emerald-700', ring: '#10b981' },
} as const

const TIMELINE_LABEL: Record<string, string> = {
  less_3_months:   'Moins de 3 mois',
  '3_to_6_months': '3 à 6 mois',
  more_6_months:   'Plus de 6 mois',
}

const FINANCING_LABEL: Record<string, string> = {
  obtained: 'Accord obtenu', in_progress: 'En cours', none: 'Non démarré',
}

const EMPLOYMENT_LABEL: Record<string, string> = {
  cdi: 'CDI', fonctionnaire: 'Fonctionnaire', cdd: 'CDD / Intérim',
  independant: 'Indépendant', retraite: 'Retraité', sans_emploi: 'Sans emploi',
}

const JURISDICTION_LABEL: Record<string, string> = {
  FR: 'France', CH: 'Suisse', unknown: 'À préciser',
}

function detectCurrency(q: QualificationResult): string {
  const text = `${q.address ?? ''} ${q.description}`.toLowerCase()
  if (/genève|geneve|lausanne|zurich|chf|suisse/.test(text)) return 'CHF'
  return '€'
}

// ── Petite icône ───────────────────────────────────────────────────────────

const I = {
  Phone: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>,
  Mail: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  MapPin: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  Spark: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  Circle: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>,
  Copy: () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>,
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ScoreRing({ score, temperature }: { score: number; temperature: 'cold' | 'warm' | 'hot' }) {
  const r = 32, circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color  = TEMP[temperature].ring

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-slate-900 leading-none tracking-tight">{score}</span>
        <span className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const params  = useParams<{ id: string }>()
  const router  = useRouter()
  const supabase = createClient()

  const [prospect, setProspect] = useState<ProspectFull | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<Tab>('overview')
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

      if (p?.status === 'new') {
        await supabase.from('prospects').update({ status: 'viewed' }).eq('id', params.id)
      }

      // Log view activity (1 fois par jour max — éviter le spam)
      const lastViewLog = (p?.activity as Activity[] | undefined)
        ?.filter(a => a.type === 'viewed')
        .pop()
      const lastViewTime = lastViewLog ? new Date(lastViewLog.at).getTime() : 0
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      if (lastViewTime < oneDayAgo) {
        void logActivity(supabase, params.id, activityViewed())
      }

      setLoading(false)
    }
    void load()
  }, [params.id, supabase])

  // Compute documents checklist from qualification (deterministic, fast)
  const documents: DocumentChecklistResult | null = useMemo(
    () => prospect?.qualification ? generateDocumentChecklist(prospect.qualification) : null,
    [prospect?.qualification]
  )

  const [sentToast, setSentToast] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  async function sendReply() {
    if (!prospect?.prospection || !profile?.gmail_access_token || !profile?.gmail_refresh_token) return
    setSending(true)
    setSendError(null)
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
        // Log activity
        const { logActivity, activityEmailSent } = await import('@/lib/activity')
        await logActivity(supabase, params.id, activityEmailSent())
        // Toast
        setSentToast(true)
        setTimeout(() => setSentToast(false), 4000)
      } else {
        const err = await res.json().catch(() => ({ error: 'Erreur d\'envoi' }))
        setSendError(err.error ?? 'L\'envoi a échoué')
        setTimeout(() => setSendError(null), 5000)
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'L\'envoi a échoué')
      setTimeout(() => setSendError(null), 5000)
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
  const fullName = q ? [q.firstName, q.lastName].filter(Boolean).join(' ') : null
  const currency = q ? detectCurrency(q) : '€'
  const cityFromAddress = q?.address?.split(',')[0]?.trim()

  const downPaymentPct = q?.down_payment && q?.price ? Math.round((q.down_payment / q.price) * 100) : null
  const debtRatio = q?.existing_debts_monthly !== null && q?.existing_debts_monthly !== undefined && q?.monthly_income
    ? Math.round((q.existing_debts_monthly / q.monthly_income) * 100)
    : null

  return (
    <div className="min-h-screen">

      {/* ── Header avec breadcrumb + actions ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button onClick={() => router.push('/pro/prospects')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors pl-12 lg:pl-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
            </svg>
            Prospects
          </button>
          <div className="flex items-center gap-2">
            {prospect.status === 'replied' ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                Répondu
              </span>
            ) : (
              <button
                onClick={sendReply}
                disabled={sending || !profile?.gmail_access_token}
                className="text-xs bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-3.5 py-1.5 rounded-lg transition-colors font-medium"
              >
                {sending ? 'Envoi...' : 'Envoyer la réponse'}
              </button>
            )}
            <button onClick={archive} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
              Archiver
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-4">

        {/* ── Client card ── */}
        {q && s && temp && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-5">
                <ScoreRing score={s.score} temperature={s.temperature} />
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{fullName || prospect.email_from_name || 'Prospect'}</h2>
                    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${temp.badge}`}>
                      {temp.label}
                    </span>
                    {q.is_couple && (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Couple
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    Emprunteur · {cityFromAddress ?? q.address ?? 'Localisation à préciser'}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{s.explanation}</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            {(q.email || q.phone) && (
              <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-5 text-xs">
                {q.phone && (
                  <a href={`tel:${q.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <I.Phone />
                    {q.phone}
                  </a>
                )}
                {q.email && (
                  <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <I.Mail />
                    {q.email}
                  </a>
                )}
              </div>
            )}

            {/* Bancabilité */}
            {(q.monthly_income || q.down_payment || q.employment_status) && (
              <div className="px-6 py-5 bg-emerald-50/40 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest mb-4">Bancabilité</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {q.monthly_income && (
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Revenus mensuels</p>
                      <p className="text-base font-semibold text-slate-900">{q.monthly_income.toLocaleString('fr-FR')} {currency}</p>
                      {q.is_couple && <p className="text-[10px] text-slate-400 mt-0.5">Foyer</p>}
                    </div>
                  )}
                  {q.down_payment && (
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Apport</p>
                      <p className="text-base font-semibold text-slate-900">{q.down_payment.toLocaleString('fr-FR')} {currency}</p>
                      {downPaymentPct !== null && (
                        <p className={`text-[10px] font-medium mt-0.5 ${downPaymentPct >= 20 ? 'text-emerald-600' : downPaymentPct >= 10 ? 'text-amber-600' : 'text-red-500'}`}>
                          {downPaymentPct}% du prix
                        </p>
                      )}
                    </div>
                  )}
                  {q.employment_status && (
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Situation pro</p>
                      <p className="text-base font-semibold text-slate-900">{EMPLOYMENT_LABEL[q.employment_status]}</p>
                    </div>
                  )}
                  {q.existing_debts_monthly !== null && q.existing_debts_monthly !== undefined && (
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Crédits en cours</p>
                      <p className="text-base font-semibold text-slate-900">
                        {q.existing_debts_monthly === 0 ? 'Aucun' : `${q.existing_debts_monthly.toLocaleString('fr-FR')} ${currency}/m`}
                      </p>
                      {debtRatio !== null && q.existing_debts_monthly > 0 && (
                        <p className={`text-[10px] font-medium mt-0.5 ${debtRatio < 10 ? 'text-emerald-600' : debtRatio < 25 ? 'text-amber-600' : 'text-red-500'}`}>
                          Endettement {debtRatio}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile */}
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Profil emprunteur</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                {[
                  { label: 'Bien ciblé', value: q.propertyType },
                  { label: 'Localisation', value: q.address },
                  { label: 'Surface', value: q.surface ? `${q.surface} m²` : null },
                  { label: 'Pièces', value: q.rooms },
                  { label: 'Budget / Prix', value: q.price ? `${q.price.toLocaleString('fr-FR')} ${currency}` : null },
                  { label: 'Délai d\'achat', value: q.purchase_timeline ? TIMELINE_LABEL[q.purchase_timeline] : null },
                  { label: 'Financement', value: q.financing_status ? FINANCING_LABEL[q.financing_status] : null },
                ].filter(f => f.value !== null && f.value !== undefined && f.value !== '').map((f, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{f.label}</p>
                    <p className="text-sm font-medium text-slate-900">{f.value}</p>
                  </div>
                ))}
              </div>

              {q.urgencySignals.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Signaux d&apos;urgence</p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.urgencySignals.map((sig, i) => (
                      <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scoring factors */}
            {s.keyFactors.length > 0 && (
              <div className="px-6 py-4 bg-slate-50/30">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Facteurs de scoring</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.keyFactors.map((f, i) => (
                    <span key={i} className="text-xs bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                      +{f.points} · {f.factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 4 onglets principaux ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

            <div className="flex border-b border-slate-100">
              {([
                { id: 'overview'      as const, label: 'Vue d\'ensemble',  enabled: true,         badge: undefined as string | undefined },
                { id: 'communication' as const, label: 'Communication',    enabled: !!p,          badge: undefined as string | undefined },
                { id: 'banks'         as const, label: 'Banques',          enabled: true,         badge: prospect.bank_submitted && prospect.bank_submitted.length > 0 ? String(prospect.bank_submitted.length) : undefined },
                { id: 'history'       as const, label: 'Historique',       enabled: true,         badge: documents?.urgency === 'urgent' ? 'Urgent' : undefined },
              ]).map(t => (
                <button
                  key={t.id}
                  onClick={() => t.enabled && setTab(t.id as Tab)}
                  disabled={!t.enabled}
                  className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 ${
                    tab === t.id
                      ? 'text-slate-900 border-b-2 border-slate-900'
                      : t.enabled
                        ? 'text-slate-400 hover:text-slate-600'
                        : 'text-slate-200 cursor-not-allowed'
                  }`}
                >
                  {t.label}
                  {t.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">

              {/* ─── Onglet : Vue d'ensemble ─── */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  {prospect.email_body ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Email original reçu</span>
                      </div>
                      <div className="px-4 py-3">
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                          {prospect.email_body}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl px-4 py-6 text-center">
                      <p className="text-xs text-slate-500">Prospect ajouté manuellement — pas d&apos;email d&apos;origine.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Onglet : Communication ─── */}
              {tab === 'communication' && p && (
                <div className="space-y-5">
                  {/* Réponse email rédigée */}
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Réponse email rédigée</p>
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
                      <button onClick={copyEmail} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                        <I.Copy />
                        {copied ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                  </div>

                  {/* Briefing appel */}
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Briefing pour l&apos;appel</p>
                    <div className="space-y-3">
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Contexte</span>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-800 leading-relaxed">{p.callScript.briefing}</p>
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Besoin du prospect</span>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm text-slate-700 leading-relaxed">{p.callScript.need}</p>
                        </div>
                      </div>
                      <div className="border border-emerald-200 rounded-xl overflow-hidden">
                        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
                          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Question clé à poser en premier</span>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm text-slate-700 leading-relaxed italic">« {p.callScript.keyQuestion} »</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'communication' && !p && (
                <div className="border border-slate-200 rounded-xl px-4 py-6 text-center">
                  <p className="text-xs text-slate-500">Aucune communication générée. Ce prospect a été ajouté manuellement.</p>
                </div>
              )}

              {/* ─── Onglet : Banques ─── */}
              {tab === 'banks' && (
                <BankTracker prospectId={prospect.id} initialBanks={prospect.bank_submitted} qualification={prospect.qualification} />
              )}

              {/* ─── Onglet : Historique ─── */}
              {tab === 'history' && (
                <div className="space-y-4">
                  <NotesEditor prospectId={prospect.id} initialNotes={prospect.broker_notes} />

                  {documents && (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Documents à demander</span>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="flex items-center gap-1 text-slate-600">
                            <I.MapPin />
                            {JURISDICTION_LABEL[documents.jurisdiction]}
                          </span>
                          {documents.urgency === 'urgent' && (
                            <span className="flex items-center gap-0.5 text-amber-700 font-medium">
                              <I.Spark />
                              Compromis signé
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {documents.groups.map((group, gi) => (
                          <div key={gi} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{group.category}</span>
                            </div>
                            <ul className="divide-y divide-slate-100">
                              {group.items.map((item, ii) => (
                                <li key={ii} className="px-4 py-3 flex items-start gap-3">
                                  <span className={`mt-0.5 shrink-0 ${item.required ? 'text-slate-400' : 'text-slate-300'}`}>
                                    <I.Circle />
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                      <p className="text-sm text-slate-800 leading-snug">{item.name}</p>
                                      {!item.required && (
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Optionnel</span>
                                      )}
                                    </div>
                                    {item.hint && (
                                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.hint}</p>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <ActivityTimeline activity={prospect.activity} createdAt={prospect.created_at} />
                </div>
              )}
            </div>
          </div>

      </main>

      {/* Toast d'envoi email */}
      {sentToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 shadow-lg max-w-sm animate-fade-up flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <div>
            <p className="text-sm font-semibold">Réponse envoyée</p>
            <p className="text-xs text-emerald-700 mt-0.5">Email envoyé à {prospect.email_from}</p>
          </div>
        </div>
      )}

      {/* Toast d'erreur */}
      {sendError && (
        <div className="fixed bottom-5 right-5 z-50 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 shadow-lg max-w-sm animate-fade-up">
          <p className="text-sm font-semibold mb-0.5">Envoi échoué</p>
          <p className="text-xs">{sendError}</p>
        </div>
      )}
    </div>
  )
}
