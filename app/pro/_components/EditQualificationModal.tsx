'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { QualificationResult } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  EditQualificationModal — édition rapide des champs IA mal extraits
//
//  Affiche les 8 champs les plus critiques pour qu'un courtier puisse
//  corriger en 30 secondes ce que Claude a mal compris.
// ════════════════════════════════════════════════════════════════════════

interface Props {
  prospectId: string
  qualification: QualificationResult
  onClose: () => void
  onSaved: (updated: QualificationResult) => void
}

const EMPLOYMENT_OPTIONS: Array<{ value: QualificationResult['employment_status']; label: string }> = [
  { value: 'cdi',           label: 'CDI' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'cdd',           label: 'CDD / Intérim' },
  { value: 'independant',   label: 'Indépendant / TNS' },
  { value: 'retraite',      label: 'Retraité' },
  { value: 'sans_emploi',   label: 'Sans emploi' },
]

export default function EditQualificationModal({ prospectId, qualification, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [form, setForm] = useState<QualificationResult>(qualification)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof QualificationResult>(key: K, value: QualificationResult[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function num(v: string): number | null {
    const clean = v.replace(/\s/g, '').replace(',', '.')
    if (clean === '') return null
    const n = Number(clean)
    return Number.isFinite(n) ? n : null
  }

  async function save() {
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('prospects')
      .update({
        qualification: form,
        activity_log_entry: { type: 'manual_edit', label: 'Champs modifiés manuellement' },
      })
      .eq('id', prospectId)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    setSaving(false)
    onSaved(form)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center px-4 py-8 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Corriger les informations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Modifier ce que l&apos;IA a mal extrait</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors" aria-label="Fermer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom"
              value={form.firstName ?? ''}
              onChange={v => set('firstName', v || null)}
            />
            <Field label="Nom"
              value={form.lastName ?? ''}
              onChange={v => set('lastName', v || null)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"
              type="email"
              value={form.email ?? ''}
              onChange={v => set('email', v || null)}
            />
            <Field label="Téléphone"
              type="tel"
              value={form.phone ?? ''}
              onChange={v => set('phone', v || null)}
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Bancabilité</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Revenus mensuels (€)"
                type="number"
                value={form.monthly_income?.toString() ?? ''}
                onChange={v => set('monthly_income', num(v))}
              />
              <Field label="Apport personnel (€)"
                type="number"
                value={form.down_payment?.toString() ?? ''}
                onChange={v => set('down_payment', num(v))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="Crédits en cours (€/mois)"
                type="number"
                value={form.existing_debts_monthly?.toString() ?? ''}
                onChange={v => set('existing_debts_monthly', num(v))}
              />
              <div>
                <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">Situation pro</label>
                <select
                  value={form.employment_status ?? ''}
                  onChange={(e) => set('employment_status', (e.target.value || null) as QualificationResult['employment_status'])}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                >
                  <option value="">—</option>
                  {EMPLOYMENT_OPTIONS.map(o => (
                    <option key={o.value ?? ''} value={o.value ?? ''}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Projet</p>
            <Field label="Prix du bien (€)"
              type="number"
              value={form.price?.toString() ?? ''}
              onChange={v => set('price', num(v))}
            />
            <div className="mt-3">
              <Field label="Localisation"
                value={form.address ?? ''}
                onChange={v => set('address', v || null)}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">Le score se recalcule automatiquement.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="text-xs font-medium bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
      />
    </div>
  )
}
