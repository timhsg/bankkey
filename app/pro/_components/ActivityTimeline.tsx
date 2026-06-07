'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════
//  Timeline d'activité par prospect — événements chronologiques
// ════════════════════════════════════════════════════════════════════════

interface Activity {
  type: 'received' | 'analyzed' | 'viewed' | 'replied' | 'note' | 'bank_added' | 'archived' | 'status_changed'
  timestamp: string
  detail?: string
}

interface Props {
  prospect: {
    id: string
    received_at: string | null
    created_at: string
    status: string
    qualification: unknown
    scoring: unknown
    prospection: unknown
    broker_notes: string | null
    bank_submitted: unknown[] | null
  }
}

/**
 * Reconstruit une chronologie depuis les champs prospect (pas de table dédiée pour le MVP)
 */
function buildTimeline(prospect: Props['prospect']): Activity[] {
  const activities: Activity[] = []

  // 1. Email reçu
  activities.push({
    type: 'received',
    timestamp: prospect.received_at ?? prospect.created_at,
    detail: 'Email entrant analysé par BankKey',
  })

  // 2. Analysé (qualification + scoring + prospection en même temps)
  if (prospect.qualification && prospect.scoring) {
    activities.push({
      type: 'analyzed',
      timestamp: prospect.created_at,
      detail: 'Profil extrait, score calculé, réponse rédigée',
    })
  }

  // 3. Vu (uniquement si status > new)
  if (prospect.status !== 'new' && prospect.status !== 'filtered') {
    activities.push({
      type: 'viewed',
      timestamp: prospect.created_at, // approximation
      detail: 'Dossier ouvert dans le tableau de bord',
    })
  }

  // 4. Notes ajoutées
  if (prospect.broker_notes && prospect.broker_notes.trim()) {
    activities.push({
      type: 'note',
      timestamp: prospect.created_at,
      detail: 'Notes internes ajoutées',
    })
  }

  // 5. Banques ajoutées
  if (prospect.bank_submitted && prospect.bank_submitted.length > 0) {
    activities.push({
      type: 'bank_added',
      timestamp: prospect.created_at,
      detail: `${prospect.bank_submitted.length} banque(s) sollicitée(s)`,
    })
  }

  // 6. Réponse envoyée
  if (prospect.status === 'replied') {
    activities.push({
      type: 'replied',
      timestamp: prospect.created_at,
      detail: 'Email de réponse envoyé au prospect',
    })
  }

  // 7. Archivé
  if (prospect.status === 'archived') {
    activities.push({
      type: 'archived',
      timestamp: prospect.created_at,
      detail: 'Dossier archivé',
    })
  }

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const ICONS: Record<Activity['type'], () => React.JSX.Element> = {
  received: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  analyzed: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  viewed: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  replied: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  ),
  note: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
      <path d="M15 3v6h6" />
    </svg>
  ),
  bank_added: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  ),
  archived: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  ),
  status_changed: () => <span className="w-1.5 h-1.5 rounded-full bg-current" />,
}

const LABELS: Record<Activity['type'], string> = {
  received: 'Email reçu',
  analyzed: 'Analysé par BankKey',
  viewed: 'Consulté',
  replied: 'Réponse envoyée',
  note: 'Note ajoutée',
  bank_added: 'Banque sollicitée',
  archived: 'Archivé',
  status_changed: 'Statut changé',
}

const COLORS: Record<Activity['type'], string> = {
  received:       'text-blue-600 bg-blue-50',
  analyzed:       'text-emerald-600 bg-emerald-50',
  viewed:         'text-slate-600 bg-slate-100',
  replied:        'text-emerald-700 bg-emerald-50',
  note:           'text-amber-700 bg-amber-50',
  bank_added:     'text-slate-700 bg-slate-100',
  archived:       'text-slate-500 bg-slate-100',
  status_changed: 'text-slate-500 bg-slate-100',
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'À l\'instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ActivityTimeline({ prospect }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    setActivities(buildTimeline(prospect))
  }, [prospect])

  if (activities.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Activité</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {activities.map((a, i) => {
          const Icon = ICONS[a.type]
          return (
            <li key={i} className="px-5 py-3 flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${COLORS[a.type]}`}>
                <Icon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{LABELS[a.type]}</p>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatRelative(a.timestamp)}</span>
                </div>
                {a.detail && <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{a.detail}</p>}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
