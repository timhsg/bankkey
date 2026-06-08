'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { QualificationResult } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  prospectId: string
  qualification: QualificationResult | null
  bankName: string
  initialStatus: 'accepted' | 'rejected' | 'counter'
  initialRate?: number
}

const REJECTION_REASONS = [
  { value: 'income_too_low',  label: 'Revenus insuffisants' },
  { value: 'debt_ratio',      label: 'Taux d\'endettement trop élevé' },
  { value: 'profile',         label: 'Profil non éligible (situation pro, âge…)' },
  { value: 'down_payment',    label: 'Apport insuffisant' },
  { value: 'project',         label: 'Projet (bien, montant) non financé' },
  { value: 'other',           label: 'Autre raison' },
]

export default function OutcomeModal({
  open, onClose, prospectId, qualification, bankName, initialStatus, initialRate,
}: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  // Form state
  const [rate, setRate]               = useState<string>(initialRate?.toString() ?? '')
  const [loanAmount, setLoanAmount]   = useState<string>(qualification?.price?.toString() ?? '')
  const [duration, setDuration]       = useState<string>('25')
  const [downPayment, setDownPayment] = useState<string>(qualification?.down_payment?.toString() ?? '')
  const [insurance, setInsurance]     = useState<string>('')
  const [conditions, setConditions]   = useState<string>('')
  const [rejectReason, setRejectReason] = useState<string>('income_too_low')

  if (!open) return null

  async function save() {
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const snapshot = qualification ? {
      jurisdiction: detectJurisdiction(qualification),
      monthly_income: qualification.monthly_income,
      down_payment: qualification.down_payment,
      down_payment_pct: qualification.down_payment && qualification.price
        ? Math.round((qualification.down_payment / qualification.price) * 100)
        : null,
      employment: qualification.employment_status,
      is_couple: qualification.is_couple,
      debt_ratio: qualification.existing_debts_monthly && qualification.monthly_income
        ? Math.round((qualification.existing_debts_monthly / qualification.monthly_income) * 100)
        : null,
      project_amount: qualification.price,
      property_type: qualification.propertyType,
      address: qualification.address,
      financing_status: qualification.financing_status,
      city: qualification.address?.split(',').pop()?.trim() ?? null,
    } : {}

    await supabase.from('deal_outcomes').insert({
      prospect_id: prospectId,
      user_id: user.id,
      bank_name: bankName,
      status: initialStatus,
      rate_pct: initialStatus !== 'rejected' && rate ? parseFloat(rate) : null,
      loan_amount: initialStatus !== 'rejected' && loanAmount ? parseFloat(loanAmount) : null,
      duration_years: initialStatus !== 'rejected' && duration ? parseInt(duration) : null,
      required_down_payment: downPayment ? parseFloat(downPayment) : null,
      insurance_rate_pct: insurance ? parseFloat(insurance) : null,
      conditions: conditions.trim() || null,
      rejection_reason: initialStatus === 'rejected' ? rejectReason : null,
      snapshot,
      decided_at: new Date().toISOString(),
    })

    setSaving(false)
    onClose()
  }

  const isReject = initialStatus === 'rejected'
  const label = isReject ? 'Refus' : initialStatus === 'counter' ? 'Contre-offre' : 'Accord'

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{label} bancaire</h2>
            <p className="text-xs text-slate-500 mt-0.5">{bankName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <span className="font-semibold text-slate-900">Pourquoi enregistrer ces informations ?</span><br/>
            En notant les conditions exactes obtenues, BankKey vous aide à anticiper quelles banques acceptent quels profils à quels taux. Vos données restent privées et vous servent pour vos négociations futures.
          </p>

          {!isReject ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Taux nominal (%)"  value={rate}        onChange={setRate}        placeholder="3.25" type="number" step="0.01" />
                <Field label="Assurance (%)"      value={insurance}   onChange={setInsurance}   placeholder="0.36" type="number" step="0.01" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Montant emprunté (€)" value={loanAmount}  onChange={setLoanAmount}  placeholder="320000" type="number" />
                <Field label="Durée (années)"        value={duration}    onChange={setDuration}    placeholder="25"     type="number" />
              </div>
              <Field label="Apport finalement exigé (€)" value={downPayment} onChange={setDownPayment} placeholder="40000" type="number" />
              <TextArea label="Conditions / restrictions" value={conditions} onChange={setConditions} placeholder="Domiciliation revenus, assurance maison du groupe, etc." />
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Raison principale du refus</label>
                <div className="space-y-1.5">
                  {REJECTION_REASONS.map(r => (
                    <label key={r.value} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-base ${
                      rejectReason === r.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={rejectReason === r.value}
                        onChange={() => setRejectReason(r.value)}
                        className="sr-only"
                      />
                      <span className={`w-3 h-3 rounded-full border-2 ${rejectReason === r.value ? 'border-white bg-white' : 'border-slate-300'}`} />
                      <span className="text-sm">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <TextArea label="Détails (optionnel)" value={conditions} onChange={setConditions} placeholder="Précisions sur le refus, retour de la banque…" />
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            Passer pour l&apos;instant
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-base"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer la décision'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers UI ───────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = 'text', step }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  step?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-base placeholder-slate-300"
      />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-base resize-none placeholder-slate-300"
      />
    </div>
  )
}

function detectJurisdiction(q: QualificationResult): string {
  const text = `${q.address ?? ''} ${q.description}`.toLowerCase()
  if (/genève|geneve|lausanne|zurich|suisse|chf/.test(text)) return 'CH'
  if (/france|paris|lyon|bordeaux|marseille|toulouse|nantes|lille/.test(text)) return 'FR'
  return 'unknown'
}
