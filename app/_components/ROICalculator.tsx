'use client'

import { useState, useMemo } from 'react'
import { useCurrency } from './CurrencyContext'

export default function ROICalculator() {
  const { format, getPrice, currency } = useCurrency()

  const [leadsPerMonth, setLeadsPerMonth] = useState(60)
  const [avgCommission, setAvgCommission] = useState(currency === 'CHF' ? 2500 : 2000)
  const [conversionRate, setConversionRate] = useState(15)
  const [missedRate, setMissedRate] = useState(30)
  const [recoveryRate, setRecoveryRate] = useState(40)  // % de leads ratés que BankKey récupère

  const PRICE_BANKKEY = getPrice('pro')

  const calculations = useMemo(() => {
    // Dossiers signés actuels (sans BankKey)
    const currentDeals = (leadsPerMonth * conversionRate) / 100
    const currentRevenue = currentDeals * avgCommission

    // Avec BankKey : on récupère X% des leads ratés (ajustable)
    const recoveredLeads = (leadsPerMonth * missedRate * (recoveryRate / 100)) / 100
    const recoveredDeals = (recoveredLeads * conversionRate) / 100
    const additionalRevenue = recoveredDeals * avgCommission

    // Net gain mensuel
    const monthlyGain = additionalRevenue - PRICE_BANKKEY
    const annualGain = monthlyGain * 12

    // Payback : combien de jours pour rentabiliser l'abonnement
    const paybackDays = additionalRevenue > 0
      ? Math.ceil((PRICE_BANKKEY / additionalRevenue) * 30)
      : 999

    return {
      currentRevenue: Math.round(currentRevenue),
      additionalRevenue: Math.round(additionalRevenue),
      monthlyGain: Math.round(monthlyGain),
      annualGain: Math.round(annualGain),
      paybackDays,
      recoveredDeals: Math.round(recoveredDeals * 10) / 10,
    }
  }, [leadsPerMonth, avgCommission, conversionRate, missedRate, recoveryRate, PRICE_BANKKEY])

  return (
    <section className="bg-white border-y border-slate-100 py-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Calculateur ROI</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
            Combien BankKey vous fait gagner chaque mois ?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Ajustez les curseurs avec vos vrais chiffres. Le taux de récupération est paramétrable — restez prudent dans vos hypothèses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Sliders (gauche) ── */}
          <div className="bg-slate-50 rounded-2xl p-7 space-y-7 border border-slate-200">

            <SliderField
              label="Leads reçus par mois"
              value={leadsPerMonth}
              min={20}
              max={200}
              step={5}
              onChange={setLeadsPerMonth}
              format={(v) => `${v} leads`}
              hint="Emails de demande de financement reçus"
            />

            <SliderField
              label="Commission moyenne par dossier"
              value={avgCommission}
              min={1000}
              max={5000}
              step={100}
              onChange={setAvgCommission}
              format={(v) => format(v)}
              hint="Commission perçue sur un dossier signé"
            />

            <SliderField
              label="Taux de conversion (leads → dossiers)"
              value={conversionRate}
              min={5}
              max={40}
              step={1}
              onChange={setConversionRate}
              format={(v) => `${v} %`}
              hint="Pourcentage de leads qui deviennent dossiers signés"
            />

            <SliderField
              label="Leads ratés par manque de temps"
              value={missedRate}
              min={0}
              max={70}
              step={5}
              onChange={setMissedRate}
              format={(v) => `${v} %`}
              hint="Vous ne répondez pas à temps ou ne qualifiez pas le lead"
            />

            <SliderField
              label="Taux de récupération avec BankKey"
              value={recoveryRate}
              min={20}
              max={70}
              step={5}
              onChange={setRecoveryRate}
              format={(v) => `${v} %`}
              hint="Hypothèse — restez conservateur (40% par défaut)"
            />
          </div>

          {/* ── Résultats (droite) — visuellement plus doux ── */}
          <div className="space-y-4">

            <div className="bg-white border border-slate-200 rounded-2xl p-7">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Gain mensuel net</p>
              <p className="text-5xl font-semibold text-slate-900 tracking-tight">
                {format(calculations.monthlyGain)}
              </p>
              <p className="text-sm text-slate-500 mt-3">
                Après déduction de l&apos;abonnement BankKey ({format(PRICE_BANKKEY)}/mois)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">Sur 12 mois</p>
                <p className="text-2xl font-semibold text-emerald-700 tracking-tight">
                  {format(calculations.annualGain)}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">Payback</p>
                <p className="text-2xl font-semibold text-slate-900 tracking-tight">
                  {calculations.paybackDays} <span className="text-sm text-slate-500">j</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500 mb-3">Détail mensuel :</p>
              <div className="space-y-2 text-sm">
                <Row label="Dossiers récupérés / mois" value={`${calculations.recoveredDeals.toLocaleString('fr-FR')} dossiers`} />
                <Row label="Revenus additionnels"      value={`+ ${format(calculations.additionalRevenue)}`} accent="emerald" />
                <Row label="Abonnement BankKey"        value={`− ${format(PRICE_BANKKEY)}`} accent="red" />
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <Row label="Gain net" value={format(calculations.monthlyGain)} bold />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-1">
              Estimation basée sur vos paramètres. Les résultats réels varient selon l&apos;activité.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────

function SliderField({
  label, value, min, max, step, onChange, format, hint,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format: (v: number) => string
  hint?: string
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-semibold text-slate-900 tracking-tight">{format(value)}</span>
      </div>
      <div className="relative h-1.5 bg-slate-200 rounded-full">
        <div
          className="absolute h-full bg-blue-900 rounded-full pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-900 rounded-full pointer-events-none shadow-sm"
          style={{ left: `${pct}%` }}
        />
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1.5">{hint}</p>}
    </div>
  )
}

function Row({ label, value, accent, bold }: {
  label: string
  value: string
  accent?: 'emerald' | 'red'
  bold?: boolean
}) {
  const valueClass =
    accent === 'emerald' ? 'text-emerald-700' :
    accent === 'red'     ? 'text-slate-500'   :
    'text-slate-900'

  return (
    <div className="flex items-center justify-between">
      <span className={`${bold ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{label}</span>
      <span className={`${bold ? 'font-semibold' : 'font-medium'} ${valueClass} tracking-tight`}>{value}</span>
    </div>
  )
}
