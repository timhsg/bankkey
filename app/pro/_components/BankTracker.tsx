'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logActivity, activityBankAdded, activityBankStatusChanged } from '@/lib/activity'
import OutcomeModal from './OutcomeModal'
import type { QualificationResult } from '@/types'

interface BankSubmission {
  name: string
  submitted_at?: string
  status?: 'pending' | 'accepted' | 'rejected' | 'counter'
  rate?: number
  notes?: string
}

interface Props {
  prospectId: string
  initialBanks: BankSubmission[] | null
  qualification?: QualificationResult | null
}

const STATUS_OPTIONS: Array<{ value: BankSubmission['status']; label: string; color: string }> = [
  { value: 'pending',  label: 'En attente',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'counter',  label: 'Contre-offre', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'accepted', label: 'Accordé',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'rejected', label: 'Refusé',       color: 'bg-red-50 text-red-700 border-red-200' },
]

/**
 * Suivi des soumissions bancaires pour un dossier
 */
export default function BankTracker({ prospectId, initialBanks, qualification }: Props) {
  const supabase = createClient()
  const [banks, setBanks] = useState<BankSubmission[]>(initialBanks ?? [])
  const [adding, setAdding] = useState(false)
  const [newBankName, setNewBankName] = useState('')
  const [saving, setSaving] = useState(false)
  const [outcomeFor, setOutcomeFor] = useState<{ bankName: string; status: 'accepted' | 'rejected' | 'counter'; rate?: number } | null>(null)

  async function persist(updated: BankSubmission[]) {
    setSaving(true)
    await supabase.from('prospects').update({ bank_submitted: updated }).eq('id', prospectId)
    setSaving(false)
  }

  function addBank() {
    if (!newBankName.trim()) return
    const bankName = newBankName.trim()
    const next: BankSubmission[] = [
      ...banks,
      {
        name: bankName,
        submitted_at: new Date().toISOString(),
        status: 'pending',
      },
    ]
    setBanks(next)
    setNewBankName('')
    setAdding(false)
    void persist(next)
    void logActivity(supabase, prospectId, activityBankAdded(bankName))
  }

  function updateBank(index: number, patch: Partial<BankSubmission>) {
    const previous = banks[index]
    const next = banks.map((b, i) => i === index ? { ...b, ...patch } : b)
    setBanks(next)
    void persist(next)

    // Log si le statut change
    if (patch.status && patch.status !== previous.status) {
      void logActivity(
        supabase, prospectId,
        activityBankStatusChanged(previous.name, patch.status, patch.rate ?? previous.rate),
      )

      // Ouvrir la modal outcome pour les statuts finaux
      if (patch.status === 'accepted' || patch.status === 'rejected' || patch.status === 'counter') {
        setOutcomeFor({
          bankName: previous.name,
          status: patch.status,
          rate: patch.rate ?? previous.rate,
        })
      }
    }
  }

  function removeBank(index: number) {
    const next = banks.filter((_, i) => i !== index)
    setBanks(next)
    void persist(next)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Banques sollicitées</span>
        {saving && (
          <span className="text-[10px] text-slate-400">Sauvegarde...</span>
        )}
      </div>

      {banks.length === 0 && !adding && (
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-slate-500 mb-3">Aucune banque sollicitée pour ce dossier.</p>
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + Ajouter une banque
          </button>
        </div>
      )}

      {banks.length > 0 && (
        <div className="divide-y divide-slate-100">
          {banks.map((bank, i) => (
            <BankRow
              key={i}
              bank={bank}
              onUpdate={(patch) => updateBank(i, patch)}
              onRemove={() => removeBank(i)}
            />
          ))}
        </div>
      )}

      {/* Add bank form */}
      {adding && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBank()}
            placeholder="BNP Paribas, Crédit Agricole, etc."
            autoFocus
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            onClick={addBank}
            disabled={!newBankName.trim()}
            className="text-xs font-medium bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Ajouter
          </button>
          <button
            onClick={() => { setAdding(false); setNewBankName('') }}
            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors"
          >
            Annuler
          </button>
        </div>
      )}

      {banks.length > 0 && !adding && (
        <div className="px-5 py-2 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setAdding(true)}
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            + Ajouter une banque
          </button>
        </div>
      )}

      {/* Modal de capture d'outcome */}
      {outcomeFor && (
        <OutcomeModal
          open={!!outcomeFor}
          onClose={() => setOutcomeFor(null)}
          prospectId={prospectId}
          qualification={qualification ?? null}
          bankName={outcomeFor.bankName}
          initialStatus={outcomeFor.status}
          initialRate={outcomeFor.rate}
        />
      )}
    </div>
  )
}

// ── Bank row component ─────────────────────────────────────────────────────

function BankRow({ bank, onUpdate, onRemove }: {
  bank: BankSubmission
  onUpdate: (patch: Partial<BankSubmission>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_OPTIONS.find(s => s.value === (bank.status ?? 'pending')) ?? STATUS_OPTIONS[0]

  return (
    <div className="px-5 py-3 group">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-slate-900 flex-1 truncate">{bank.name}</p>

        {bank.rate && (
          <span className="text-xs font-mono text-slate-600">{bank.rate}%</span>
        )}

        {/* Status selector */}
        <select
          value={bank.status ?? 'pending'}
          onChange={(e) => onUpdate({ status: e.target.value as BankSubmission['status'] })}
          className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full border cursor-pointer ${status.color}`}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Détails"
        >
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {bank.submitted_at && (
        <p className="text-[10px] text-slate-400 mt-1">
          Envoyé le {new Date(bank.submitted_at).toLocaleDateString('fr-FR')}
        </p>
      )}

      {/* Détails étendus */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 pl-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Taux proposé (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={bank.rate ?? ''}
                onChange={(e) => onUpdate({ rate: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="3.50"
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Date d&apos;envoi
              </label>
              <input
                type="date"
                value={bank.submitted_at?.slice(0, 10) ?? ''}
                onChange={(e) => onUpdate({ submitted_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
              Notes
            </label>
            <textarea
              value={bank.notes ?? ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              rows={2}
              placeholder="Contre-offre attendue, contact bancaire, conditions particulières..."
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none placeholder-slate-300"
            />
          </div>

          <button
            onClick={onRemove}
            className="text-[10px] font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Supprimer cette banque
          </button>
        </div>
      )}
    </div>
  )
}
