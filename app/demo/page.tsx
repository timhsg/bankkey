'use client';

import { Fragment, useState } from 'react';
import type { QualificationResult, ScoringResult, ProspectionResult } from '@/types';
import { SECTORS } from '@/lib/sectors';

// ── Types ──────────────────────────────────────────────────────────────────────

type PipelineStep = 'idle' | 'reading' | 'scoring' | 'writing' | 'done';

// ── Helpers ────────────────────────────────────────────────────────────────────

const TEMP_CONFIG = {
  cold: { label: 'Non prioritaire', dot: 'bg-slate-400',    badge: 'bg-slate-100 text-slate-600 border-slate-200',   ring: '#94a3b8' },
  warm: { label: 'À qualifier',     dot: 'bg-amber-400',    badge: 'bg-amber-50 text-amber-700 border-amber-200',    ring: '#fbbf24' },
  hot:  { label: 'Prioritaire',     dot: 'bg-emerald-500',  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: '#34d399' },
} as const;

const TIMELINE_LABEL: Record<string, string> = {
  less_3_months:   '< 3 mois',
  '3_to_6_months': '3 – 6 mois',
  more_6_months:   '> 6 mois',
};

const FINANCING_LABEL: Record<string, string> = {
  obtained:    'Obtenu',
  in_progress: 'En cours',
  none:        'Non démarré',
};

const STEP_ORDER: Record<PipelineStep, number> = {
  idle: -1, reading: 0, scoring: 1, writing: 2, done: 3,
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreRing({ score, temperature }: { score: number; temperature: 'cold' | 'warm' | 'hot' }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = TEMP_CONFIG[temperature].ring;

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900 leading-none">{score}</span>
        <span className="text-[10px] font-medium text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
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
                  status === 'done'   ? 'bg-slate-800' :
                  status === 'active' ? 'border-2 border-slate-800 bg-white' :
                                        'border-2 border-slate-200 bg-white'
                }`}>
                  {status === 'done'   && <span className="text-white text-[9px] font-bold">✓</span>}
                  {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse" />}
                </div>
                <span className={`text-[10px] font-medium ${status === 'pending' ? 'text-slate-300' : 'text-slate-500'}`}>
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

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const sector = 'credit' as const;
  const [listing,      setListing]      = useState('');
  const [step,         setStep]         = useState<PipelineStep>('idle');
  const [qualification, setQualification] = useState<QualificationResult | null>(null);
  const [scoring,      setScoring]      = useState<ScoringResult | null>(null);
  const [prospection,  setProspection]  = useState<ProspectionResult | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [tab,          setTab]          = useState<'email' | 'call'>('email');
  const [copied,       setCopied]       = useState(false);

  const isLoading  = step !== 'idle' && step !== 'done';
  const hasResults = !!(qualification && scoring && prospection);
  const config     = SECTORS[sector];

  function reset() {
    setStep('idle');
    setQualification(null);
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

  const tempCfg = scoring ? TEMP_CONFIG[scoring.temperature] : null;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 h-13 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="font-semibold text-slate-900 tracking-tight">BankKey</a>
            <span className="text-slate-200 select-none">|</span>
            <span className="text-xs font-medium text-slate-500">Démo crédit immobilier</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">v0.1</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-4">

        {/* ── Input ── */}
        {step === 'idle' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">{config.emoji} {config.label}</span>
              <button
                onClick={() => setListing(config.example)}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Exemple
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
                         focus:ring-slate-900 focus:border-transparent leading-relaxed"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {listing.length > 0 ? `${listing.length} car.` : '⌘ Entrée pour analyser'}
              </span>
              <button
                onClick={analyze}
                disabled={!listing.trim()}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700
                           disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                           text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Analyser →
              </button>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 animate-fade-up">
            {error}
          </div>
        )}

        {/* ── Pipeline progress ── */}
        {isLoading && <PipelineProgress step={step} />}

        {/* ── Results card ── */}
        {(qualification || scoring || prospection) && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-up">

            {/* Score section */}
            {scoring && tempCfg && (
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start gap-5">
                  <ScoreRing score={scoring.score} temperature={scoring.temperature} />
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {qualification?.firstName && (
                        <span className="font-semibold text-slate-900">
                          {qualification.firstName}
                          {qualification.lastName ? ` ${qualification.lastName}` : ''}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${tempCfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tempCfg.dot}`} />
                        {tempCfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-3">{scoring.explanation}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {scoring.keyFactors.map((f, i) => (
                        <span key={i} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                          +{f.points} {f.factor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact data */}
            {qualification && (
              <div className="p-5 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Profil
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                  <Field label="Email"         value={qualification.email} />
                  <Field label="Téléphone"     value={qualification.phone} />
                  <Field label="Type de bien"  value={qualification.propertyType} />
                  <Field label="Adresse"       value={qualification.address} />
                  <Field label="Surface"       value={qualification.surface ? `${qualification.surface} m²` : null} />
                  <Field label="Pièces"        value={qualification.rooms} />
                  <Field label="Prix / Budget" value={qualification.price ? `${qualification.price.toLocaleString('fr-FR')} €` : null} />
                  <Field label="Délai de vente"
                    value={qualification.sell_timeline ? TIMELINE_LABEL[qualification.sell_timeline] : null} />
                  <Field label="Délai d'achat"
                    value={qualification.purchase_timeline ? TIMELINE_LABEL[qualification.purchase_timeline] : null} />
                  <Field label="Financement"
                    value={qualification.financing_status ? FINANCING_LABEL[qualification.financing_status] : null} />
                </div>

                {qualification.description && (
                  <p className="mt-4 text-sm text-slate-500 italic leading-relaxed">
                    {qualification.description}
                  </p>
                )}

                {qualification.urgencySignals.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {qualification.urgencySignals.map((s, i) => (
                      <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Prospection tools */}
            {prospection && (
              <div>
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                  {(['email', 'call'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
                        tab === t
                          ? 'text-slate-900 border-b-2 border-slate-900'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {t === 'email' ? 'Email' : 'Guide d\'appel'}
                    </button>
                  ))}
                </div>

                <div className="p-5">

                  {/* Email tab */}
                  {tab === 'email' && (
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
                          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {copied ? '✓ Copié' : 'Copier'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Call briefing tab */}
                  {tab === 'call' && (
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
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Ce qu'il veut</span>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {prospection.callScript.need}
                          </p>
                        </div>
                      </div>

                      <div className="border border-emerald-200 rounded-xl overflow-hidden">
                        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
                          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Question clé à poser en premier</span>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm text-slate-700 leading-relaxed italic">
                            « {prospection.callScript.keyQuestion} »
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Reset ── */}
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
    </div>
  );
}
