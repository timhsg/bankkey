'use client'

// ════════════════════════════════════════════════════════════════════════
//  Section "Bilan mensuel" du Product Theater
//  Reproduction de /pro/bilan avec données statiques convaincantes
// ════════════════════════════════════════════════════════════════════════

const KPIS = [
  { label: 'Leads reçus',         value: 87, delta: '+12 vs mai',  accent: '' },
  { label: 'Dossiers qualifiés',  value: 52, delta: '60% du total', accent: 'text-slate-900' },
  { label: 'Dossiers signés',     value: 9,  delta: '+3 vs mai',   accent: 'text-emerald-700' },
  { label: 'Commissions cumulées',value: '22 750 €', delta: 'taux moyen 2,52%', accent: 'text-emerald-700' },
]

const SOURCES = [
  { name: 'Empruntis',    count: 31, pct: 36 },
  { name: 'Site web',     count: 22, pct: 25 },
  { name: 'Bouche-à-oreille', count: 16, pct: 18 },
  { name: 'Pretto',       count: 11, pct: 13 },
  { name: 'SeLoger',      count: 7,  pct: 8  },
]

const BANKS = [
  { name: 'CIC',             accepts: 6, rate: '3,28%' },
  { name: 'Crédit Mutuel',   accepts: 4, rate: '3,35%' },
  { name: 'BNP',             accepts: 3, rate: '3,42%' },
  { name: 'Crédit Agricole', accepts: 3, rate: '3,40%' },
  { name: 'Société Générale',accepts: 2, rate: '3,55%' },
]

export default function BilanSnapshot() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Bilan du mois</p>
        <h3 className="text-base font-semibold text-slate-900 mt-0.5">Votre mai 2026 en un coup d&apos;œil</h3>
      </div>

      <div className="p-5 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {KPIS.map((k, i) => (
            <div key={i} className="bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{k.label}</p>
              <p className={`text-xl font-semibold tracking-tight mt-1 ${k.accent || 'text-slate-900'}`}>
                {k.value}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{k.delta}</p>
            </div>
          ))}
        </div>

        {/* 2 colonnes : sources + banques */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Sources */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">D&apos;où viennent vos leads</p>
            <div className="space-y-2">
              {SOURCES.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-700 w-32 shrink-0">{s.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-900 rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 w-12 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banques performance */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Vos banques qui acceptent le plus</p>
            <div className="bg-slate-50/60 border border-slate-200 rounded-xl divide-y divide-slate-100">
              {BANKS.map(b => (
                <div key={b.name} className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{b.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">taux moyen</span>
                    <span className="text-xs font-mono text-slate-700">{b.rate}</span>
                    <span className="text-xs font-semibold text-emerald-700">{b.accepts}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Statistiques calculées sur vos dossiers réels. Votre argument de négociation pour le prochain dossier.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[11px] text-slate-500">
          Vous recevez automatiquement ce bilan par email le 1er de chaque mois.
        </p>
      </div>
    </section>
  )
}
