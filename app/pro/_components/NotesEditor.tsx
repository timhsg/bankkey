'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  prospectId: string
  initialNotes: string | null
}

/**
 * Éditeur de notes libre avec auto-save (debounce 800ms)
 */
export default function NotesEditor({ prospectId, initialNotes }: Props) {
  const supabase = createClient()
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [savedNotes, setSavedNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const save = useCallback(async (value: string) => {
    setSaving(true)
    await supabase
      .from('prospects')
      .update({ broker_notes: value })
      .eq('id', prospectId)
    setSaving(false)
    setSavedNotes(value)
    setSavedAt(new Date())
  }, [supabase, prospectId])

  useEffect(() => {
    if (notes === savedNotes) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => { void save(notes) }, 800)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [notes, savedNotes, save])

  const statusLabel = saving
    ? 'Sauvegarde...'
    : savedAt
      ? `Enregistré ${savedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      : null

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Notes internes</span>
        {statusLabel && (
          <span className="text-[10px] text-slate-400">{statusLabel}</span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ajoutez vos notes sur ce dossier : appels passés, points à creuser, négociations en cours…"
        rows={4}
        className="w-full px-5 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none resize-none leading-relaxed"
      />
    </div>
  )
}
