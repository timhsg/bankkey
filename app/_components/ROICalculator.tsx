'use client'

import { useState, useMemo } from 'react'
import { useCurrency } from './CurrencyContext'

export default function ROICalculator() {
  const { format, getPrice, currency } = useCurrency()

  const [leadsPerMonth, setLeadsPerMonth] = useState(60)
  const [avgCommission, setAvgCommission] = useState(currency === 'CHF' ? 2500 : 2000)
  const [conversionRate, setConversionRate] = useState(15)
  const [missedRate, setMissedRate] = useState(30)
  const [recoveryRate, setRecoveryRate] = useState(40)

  const PRICE_BANKKEY = getPrice('pro')

  const calculations = useMemo(() => {
    const currentDeals = (leadsPerMonth * conversionRate) / 100
    const currentRevenue = currentDeals * avgCommission

    const recoveredLeads = (leadsPerMonth * missedRate * (recoveryRate / 100)) / 100
    const recoveredDeals = (recoveredLeads * conversionRate) / 100
    const additionalRevenue = recoveredDeals * avgCommission

    const monthlyGain = additionalRevenue - PRICE_BANKKEY
    const annualGain = monthlyGain * 12
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
    <section id="roi" className="bg-[#F7F8FA] border-y border-[#E5E7EB] py-20 md:py-28">
      <div className="wrap">

        <div className="text-center mb-14">
          <p className="label mb-3">Calculateur de rentabilité</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest mb-4">
            Combien vous coûte<br />
            <span className="text-gradient">chaque lead non rappelé ?</span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            Ajustez les curseurs avec vos vrais chiffres. Restez prudent sur le taux de récupération.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* Sliders */}
          <div className="bg-white rounded-2xl p-7 space-y-7 border border-[#E5E7EB] shadow-card">
            <SliderField label="Leads reçus par mois" value={leadsPerMonth} min={20} max={200} step={5}
              onChange={setLeadsPerMonth} format={(v) => `${v} leads`}
              hint="Demandes de financement reçues par email" />
            <SliderField label="Commission moyenne par dossier" value={avgCommission} min={1000} max={5000} step={100}
              onChange={setAvgCommission} format={(v) => format(v)}
              hint="Commission perçue sur un dossier signé" />
            <SliderField label="Taux de conversion (leads → dossiers)" value={conversionRate} min={5} max={40} step={1}
              onChange={setConversionRate} format={(v) => `${v} %`}
              hint="Part de leads qui deviennent dossiers signés" />
            <SliderField label="Leads ratés par manque de temps" value={missedRate} min={0} max={70} step={5}
              onChange={setMissedRate} format={(v) => `${v} %`}
              hint="Réponse trop tardive ou qualification non faite" />
            <SliderField label="Récupération estimée avec BankKey" value={recoveryRate} min={20} max={70} step={5}
              onChange={setRecoveryRate} format={(v) => `${v} %`}
              hint="Hypothèse — 40 % par défaut, restez conservateur" />
          </div>

          {/* Résultats */}
          <div className="space-y-4">
            <div className="rounded-2xl p-7 bg-brand-gradient text-white shadow-[0_8px_40px_rgba(10,31,92,0.18)]">
              <p className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-2">Manque à gagner récupérable / mois</p>
              <p className="text-5xl md:text-6xl font-extrabold tracking-tightest tabular-nums leading-none">
                {format(calculations.additionalRevenue)}
              </p>
              <p className="text-sm text-blue-200 mt-3">
                Soit <strong className="text-white tabular-nums">{format(calculations.annualGain)}</strong> net sur 12 mois, abonnement déduit.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Gain net / mois</p>
                <p className="text-2xl font-extrabold text-emerald-700 tracking-tightest tabular-nums">
                  {format(calculations.monthlyGain)}
                </p>
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-1">Rentabilisé en</p>
                <p className="text-2xl font-extrabold text-navy tracking-tightest tabular-nums">
                  {calculations.paybackDays} <span className="text-sm text-[#9CA3AF]">jours</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="space-y-2 text-sm">
                <Row label="Dossiers récupérés / mois" value={`${calculations.recoveredDeals.toLocaleString('fr-FR')}`} />
                <Row label="Revenus additionnels" value={`+ ${format(calculations.additionalRevenue)}`} accent="emerald" />
                <Row label="Abonnement BankKey" value={`− ${format(PRICE_BANKKEY)}`} accent="muted" />
                <div className="pt-2 mt-2 border-t border-[#F3F4F6]">
                  <Row label="Gain net mensuel" value={format(calculations.monthlyGain)} bold />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#9CA3AF] text-center pt-1">
              Estimation indicative basée sur vos paramètres.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SliderField({
  label, value, min, max, step, onChange, format, hint,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; format: (v: number) => string; hint?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-semibold text-[#374151]">{label}</label>
        <span className="text-sm font-extrabold text-navy tabular-nums">{format(value)}</span>
      </div>
      <div className="relative h-1.5 bg-[#E5E7EB] rounded-full">
        <div className="absolute h-full bg-brand-gradient rounded-full pointer-events-none" style={{ width: `${pct}%` }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-accent rounded-full pointer-events-none shadow-sm" style={{ left: `${pct}%` }} />
      </div>
      {hint && <p className="text-[11px] text-[#9CA3AF] mt-1.5">{hint}</p>}
    </div>
  )
}

function Row({ label, value, accent, bold }: {
  label: string; value: string; accent?: 'emerald' | 'muted'; bold?: boolean
}) {
  const valueClass =
    accent === 'emerald' ? 'text-emerald-700' :
    accent === 'muted'   ? 'text-[#9CA3AF]'   :
    'text-navy'
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'font-bold text-navy' : 'text-[#6B7280]'}>{label}</span>
      <span className={`${bold ? 'font-extrabold' : 'font-semibold'} ${valueClass} tabular-nums`}>{value}</span>
    </div>
  )
}
