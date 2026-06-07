'use client'

import type { Activity, ActivityType } from '@/lib/activity'

interface Props {
  activity: Activity[] | null
  createdAt: string
}

// ════════════════════════════════════════════════════════════════════════
//  Timeline d'activité — chronologie complète d'un dossier
// ════════════════════════════════════════════════════════════════════════

const ICON_BY_TYPE: Record<ActivityType, { bg: string; fg: string; svg: React.ReactNode }> = {
  email_received: {
    bg: 'bg-blue-50', fg: 'text-blue-600',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  },
  qualified: {
    bg: 'bg-emerald-50', fg: 'text-emerald-600',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg>,
  },
  filtered: {
    bg: 'bg-slate-100', fg: 'text-slate-500',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  },
  viewed: {
    bg: 'bg-slate-50', fg: 'text-slate-500',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  },
  note_added: {
    bg: 'bg-amber-50', fg: 'text-amber-600',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
  },
  bank_added: {
    bg: 'bg-purple-50', fg: 'text-purple-600',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 20 7 4 7"/><line x1="3" y1="22" x2="21" y2="22"/></svg>,
  },
  bank_status_changed: {
    bg: 'bg-purple-50', fg: 'text-purple-600',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 12 3-3 3 3"/><path d="M6 17V9"/><path d="m21 12-3 3-3-3"/><path d="M18 7v8"/></svg>,
  },
  email_sent: {
    bg: 'bg-emerald-50', fg: 'text-emerald-600',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  },
  archived: {
    bg: 'bg-slate-50', fg: 'text-slate-400',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  },
  status_changed: {
    bg: 'bg-slate-50', fg: 'text-slate-500',
    svg: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>,
  },
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'À l\'instant'
  if (m < 60)  return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24)  return `il y a ${h} h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'hier'
  if (d < 7)   return `il y a ${d} j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatExact(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ActivityTimeline({ activity }: Props) {
  const events = (activity ?? []).slice().reverse()  // Plus récent en haut

  if (events.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Historique</span>
        </div>
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-slate-500">Aucune activité enregistrée pour ce dossier.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Historique du dossier</span>
        <span className="text-[10px] text-slate-400">{events.length} événement{events.length > 1 ? 's' : ''}</span>
      </div>

      <div className="px-5 py-4">
        <ul className="space-y-3">
          {events.map((event, i) => {
            const icon = ICON_BY_TYPE[event.type] ?? ICON_BY_TYPE.status_changed
            const isLast = i === events.length - 1

            return (
              <li key={i} className="relative flex items-start gap-3">
                {!isLast && (
                  <span className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200" />
                )}
                <span className={`relative shrink-0 w-[22px] h-[22px] rounded-full ${icon.bg} ${icon.fg} flex items-center justify-center`}>
                  {icon.svg}
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs text-slate-800 leading-snug">{event.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5" title={formatExact(event.at)}>
                    {formatRelative(event.at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
