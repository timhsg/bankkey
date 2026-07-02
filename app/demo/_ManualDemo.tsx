'use client';

import { Fragment, useState } from 'react';
import type {
  QualificationResult,
  ScoringResult,
  ProspectionResult,
  DocumentChecklistResult,
} from '@/types';
import { SECTORS } from '@/lib/sectors';

// ════════════════════════════════════════════════════════════════════════
//  Démo « Testez avec votre email » — extraite en composant réutilisable.
//  Rendue à l'intérieur de /demo (mode manuel), sans header propre.
// ════════════════════════════════════════════════════════════════════════

type PipelineStep = 'idle' | 'reading' | 'scoring' | 'writing' | 'done';
type Tab = 'email' | 'call' | 'documents';

const TEMP_CONFIG = {
  cold: { label: 'Non prioritaire', badge: 'bg-slate-100 text-slate-600',   ring: '#94a3b8', accent: 'text-slate-500'   },
  warm: { label: 'À qualifier',     badge: 'bg-amber-50 text-amber-700',    ring: '#f59e0b', accent: 'text-amber-700'   },
  hot:  { label: 'Prioritaire',     badge: 'bg-emerald-50 text-emerald-700', ring: '#10b981', accent: 'text-emerald-700' },
} as const;

const TIMELINE_LABEL: Record<string, string> = {
  less_3_months:   'Moins de 3 mois',
  '3_to_6_months': '3 à 6 mois',
  more_6_months:   'Plus de 6 mois',
};

const FINANCING_LABEL: Record<string, string> = {
  obtained:    'Accord obtenu',
  in_progress: 'En cours',
  none:        'Non démarré',
};

const EMPLOYMENT_LABEL: Record<string, string> = {
  cdi:           'CDI',
  fonctionnaire: 'Fonctionnaire',
  cdd:           'CDD / Intérim',
  independant:   'Indépendant',
  retraite:      'Retraité',
  sans_emploi:   'Sans emploi',
};

function formatMoney(value: number, currency: string): string {
  return value.toLocaleString('fr-FR') + ' ' + currency;
}

function detectCurrency(q: QualificationResult): string {
  const text = `${q.address ?? ''} ${q.description}`.toLowerCase();
  if (/genève|geneve|lausanne|zurich|chf|suisse/.test(text)) return 'CHF';
  return '€';
}

const JURISDICTION_LABEL: Record<string, string> = {
  FR: 'France',
  CH: 'Suisse',
  unknown: 'À préciser',
};

const STEP_ORDER: Record<PipelineStep, number> = {
  idle: -1, reading: 0, scoring: 1, writing: 2, done: 3,
};

function ScoreRing({ score, temperature }: { score: number; temperature: 'cold' | 'warm' | 'hot' }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = TEMP_CONFIG[temperature].ring;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-slate-900 leading-none tracking-tight">{score}</span>
        <span className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

function PipelineProgress({ step }: { step: PipelineStep }) {
  const steps = [
    { key: 'reading', label: 'Lecture',   order: 0 },
    { key: 'scoring', label: 'Scoring',   order: 1 },
    { key: 'writing', label: 'Rédaction', order: 2 },
  ];
  const current = STEP_ORDER[step];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center max-w-xs mx-auto">
        {steps.map((s, i) => {
          const status = current > s.order ? 'done' : current === s.order ? 'active' : 'pending';
          return (
            <Fragment key={s.key}>
              {i > 0 && (
                <div className={`flex-1 h-px mx-3 transition-colors duration-500 ${current > i - 1 ? 'bg-slate-300' : 'bg-slate-100'}`} />
              )}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                  status === 'done'   ? 'bg-blue-900' :
                  status === 'active' ? 'border-2 border-blue-900 bg-white' :
                                        'border-2 border-slate-200 bg-white'
                }`}>
                  {status === 'done'   && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-pulse" />}
                </div>
                <span className={`text-[10px] font-medium ${status === 'pending' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {s.label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

const I = {
  Phone: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>,
  Mail: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  MapPin: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  Spark: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  Circle: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>,
  Copy: () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>,
};

function ClientCard({ q, s }: { q: QualificationResult; s: ScoringResult }) {
  const tempCfg = TEMP_CONFIG[s.temperature];
  const fullName = [q.firstName, q.lastName].filter(Boolean).join(' ') || 'Prospect';
  const cityFromAddress = q.address?.split(',')[0]?.trim();
  const currency = detectCurrency(q);

  const downPaymentPct = q.down_payment && q.price ? Math.round((q.down_payment / q.price) * 100) : null;
  const debtRatio = q.existing_debts_monthly !== null && q.monthly_income
    ? Math.round((q.existing_debts_monthly / q.monthly_income) * 100)
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-5">
          <ScoreRing score={s.score} temperature={s.temperature} />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{fullName}</h2>
              <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${tempCfg.badge}`}>
                {tempCfg.label}
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

      {(q.monthly_income || q.down_payment || q.employment_status) && (
        <div className="px-6 py-5 bg-emerald-50/40 border-b border-slate-100">
          <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest mb-4">Bancabilité</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {q.monthly_income && (
              <div>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Revenus mensuels</p>
                <p className="text-base font-semibold text-slate-900">{formatMoney(q.monthly_income, currency)}</p>
                {q.is_couple && <p className="text-[10px] text-slate-400 mt-0.5">Foyer</p>}
              </div>
            )}
            {q.down_payment && (
              <div>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Apport</p>
                <p className="text-base font-semibold text-slate-900">{formatMoney(q.down_payment, currency)}</p>
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
            {q.existing_debts_monthly !== null && (
              <div>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Crédits en cours</p>
                <p className="text-base font-semibold text-slate-900">
                  {q.existing_debts_monthly === 0 ? 'Aucun' : formatMoney(q.existing_debts_monthly, currency) + '/m'}
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

      <div className="px-6 py-5 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Profil emprunteur</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          {[
            { label: 'Bien ciblé', value: q.propertyType },
            { label: 'Localisation', value: q.address },
            { label: 'Surface', value: q.surface ? `${q.surface} m²` : null },
            { label: 'Pièces', value: q.rooms },
            { label: 'Budget / Prix', value: q.price ? q.price.toLocaleString('fr-FR') + (q.address?.toLowerCase().includes('genève') || q.address?.toLowerCase().includes('lausanne') ? ' CHF' : ' €') : null },
            { label: 'Délai d\'achat', value: q.purchase_timeline ? TIMELINE_LABEL[q.purchase_timeline] : null },
            { label: 'Délai de vente', value: q.sell_timeline ? TIMELINE_LABEL[q.sell_timeline] : null },
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

      {s.keyFactors.length > 0 && (
        <div className="px-6 py-4 bg-slate-50/30 border-b border-slate-100">
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
  );
}

export default function ManualDemo() {
  const sector = 'credit' as const;
  const [listing,       setListing]       = useState('');
  const [step,          setStep]          = useState<PipelineStep>('idle');
  const [qualification, setQualification] = useState<QualificationResult | null>(null);
  const [documents,     setDocuments]     = useState<DocumentChecklistResult | null>(null);
  const [scoring,       setScoring]       = useState<ScoringResult | null>(null);
  const [prospection,   setProspection]   = useState<ProspectionResult | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [tab,           setTab]           = useState<Tab>('email');
  const [copied,        setCopied]        = useState(false);

  const isLoading  = step !== 'idle' && step !== 'done';
  const config     = SECTORS[sector];

  function reset() {
    setStep('idle');
    setQualification(null);
    setDocuments(null);
    setScoring(null);
    setProspection(null);
    setError(null);
    setListing('');
    setTab('email');
  }

  async function analyze() {
    if (!listing.trim() || isLoading) return;

    setStep('reading');
    setQualification(null);
    setDocuments(null);
    setScoring(null);
    setProspection(null);
    setError(null);
    setTab('email');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing, sector }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Erreur serveur' })) as { error?: string };
        throw new Error(err.error ?? 'Erreur serveur');
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const event = JSON.parse(line.slice(6)) as {
            step: string; data?: unknown; message?: string;
          };

          switch (event.step) {
            case 'qualification':
              setQualification(event.data as QualificationResult);
              setStep('scoring');
              break;
            case 'documents':
              setDocuments(event.data as DocumentChecklistResult);
              break;
            case 'scoring':
              setScoring(event.data as ScoringResult);
              setStep('writing');
              break;
            case 'prospection':
              setProspection(event.data as ProspectionResult);
              break;
            case 'done':
              setStep('done');
              break;
            case 'error':
              throw new Error(event.message ?? 'Erreur interne');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStep('idle');
    }
  }

  function copyEmail() {
    if (!prospection) return;
    const text = `Objet : ${prospection.email.subject}\n\n${prospection.email.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main className="max-w-3xl mx-auto px-5 py-8 space-y-5">

      {step === 'idle' && (
        <div className="text-center pt-2 pb-2 animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
            Collez une demande de financement
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Un email de prospect, un message reçu, un formulaire de contact. BankKey extrait le profil, calcule le score, prépare la réponse et liste les documents à demander.
          </p>
        </div>
      )}

      {step === 'idle' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">{config.label}</span>
            <button
              onClick={() => setListing(config.example)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Charger un exemple
            </button>
          </div>
          <textarea
            value={listing}
            onChange={e => setListing(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze(); }}
            placeholder={config.placeholder}
            rows={6}
            className="w-full text-sm text-slate-700 placeholder-slate-300 border border-slate-200
                       rounded-lg px-3.5 py-3 resize-none focus:outline-none focus:ring-2
                       focus:ring-blue-900 focus:border-transparent leading-relaxed"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {listing.length > 0 ? `${listing.length} car.` : '⌘ Entrée pour analyser'}
            </span>
            <button
              onClick={analyze}
              disabled={!listing.trim()}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800
                         disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                         text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Analyser
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 animate-fade-up">
          {error}
        </div>
      )}

      {isLoading && <PipelineProgress step={step} />}

      {qualification && scoring && (
        <div className="animate-fade-up">
          <ClientCard q={qualification} s={scoring} />
        </div>
      )}

      {(prospection || documents) && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-up">

          <div className="flex border-b border-slate-100">
            {([
              { id: 'email' as const,     label: 'Réponse email',  enabled: !!prospection, badge: undefined as string | undefined },
              { id: 'call' as const,      label: 'Briefing appel', enabled: !!prospection, badge: undefined as string | undefined },
              { id: 'documents' as const, label: 'Documents',      enabled: !!documents,   badge: documents?.urgency === 'urgent' ? 'Urgent' : undefined },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => t.enabled && setTab(t.id as Tab)}
                disabled={!t.enabled}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 ${
                  tab === t.id
                    ? 'text-slate-900 border-b-2 border-blue-900'
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

            {tab === 'email' && prospection && (
              <div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-baseline gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-10 shrink-0">Objet</span>
                    <span className="text-sm font-medium text-slate-800">{prospection.email.subject}</span>
                  </div>
                  <div className="px-4 py-4">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {prospection.email.body}
                    </pre>
                  </div>
                </div>
                <div className="mt-2.5 flex justify-end">
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <I.Copy />
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'call' && prospection && (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Contexte</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {prospection.callScript.briefing}
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Besoin du prospect</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {prospection.callScript.need}
                    </p>
                  </div>
                </div>

                <div className="border border-emerald-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Question clé à poser en premier</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      « {prospection.callScript.keyQuestion} »
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'documents' && documents && (
              <div className="space-y-4">

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <I.MapPin />
                      Juridiction : <span className="font-medium text-slate-900">{JURISDICTION_LABEL[documents.jurisdiction]}</span>
                    </span>
                    {documents.urgency === 'urgent' && (
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <I.Spark />
                        Compromis signé, priorité haute
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400">
                    Profil rempli à <span className="font-semibold text-slate-700">{documents.estimatedCompleteness}%</span>
                  </span>
                </div>

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

                <p className="text-[11px] text-slate-400 text-center pt-2">
                  Checklist générée selon le profil détecté ({JURISDICTION_LABEL[documents.jurisdiction]}). Adaptez selon votre cabinet.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="flex justify-center pt-2 animate-fade-up">
          <button
            onClick={reset}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Nouvelle analyse
          </button>
        </div>
      )}

    </main>
  );
}
