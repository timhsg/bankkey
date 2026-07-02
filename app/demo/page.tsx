'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Wordmark } from '@/app/_components/Logo';
import { generateDocumentChecklist } from '@/lib/documents/checklist';
import { MOCK_PROSPECTS, NEW_PROSPECT_ID, type MockProspect } from './_data';
import BanksKanban from './_BanksKanban';
import BilanSnapshot from './_BilanSnapshot';
import ManualDemo from './_ManualDemo';
import type { QualificationResult, ScoringResult } from '@/types';

// ════════════════════════════════════════════════════════════════════════
//  Démo interactive
//  - Auto-play intro : nouvel email arrive → analyse → priorisation
//  - Ensuite : libre exploration des 5 prospects
// ════════════════════════════════════════════════════════════════════════

type Tab = 'email_sent' | 'call' | 'documents' | 'original';

const TEMP_RING: Record<string, string> = {
  cold: '#94a3b8',
  warm: '#f59e0b',
  hot:  '#10b981',
};

const TEMP_BADGE: Record<string, string> = {
  cold: 'bg-slate-100 text-slate-600',
  warm: 'bg-amber-50 text-amber-700',
  hot:  'bg-emerald-50 text-emerald-700',
};

const TEMP_LABEL: Record<string, string> = {
  cold: 'Non prioritaire',
  warm: 'À qualifier',
  hot:  'Prioritaire',
};

const EMPLOYMENT_LABEL: Record<string, string> = {
  cdi: 'CDI', fonctionnaire: 'Fonctionnaire', cdd: 'CDD / Intérim',
  independant: 'Indépendant', retraite: 'Retraité', sans_emploi: 'Sans emploi',
};

const TIMELINE_LABEL: Record<string, string> = {
  less_3_months:   'Moins de 3 mois',
  '3_to_6_months': '3 à 6 mois',
  more_6_months:   'Plus de 6 mois',
};

const FINANCING_LABEL: Record<string, string> = {
  obtained: 'Accord obtenu', in_progress: 'En cours', none: 'Non démarré',
};

const JURISDICTION_LABEL: Record<string, string> = {
  FR: 'France', CH: 'Suisse', unknown: 'À préciser',
};

function detectCurrency(q: QualificationResult): string {
  const text = `${q.address ?? ''} ${q.description}`.toLowerCase();
  if (/genève|geneve|lausanne|zurich|chf|suisse/.test(text)) return 'CHF';
  return '€';
}

// ── Icônes inline ──────────────────────────────────────────────────────

const I = {
  Phone: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>,
  Mail: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  MapPin: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  Spark: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  Circle: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>,
  Copy: () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>,
  Inbox: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>,
  Trend: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
};

// ── Score visuals ──────────────────────────────────────────────────────

function MiniScore({ score, temp }: { score: number; temp: 'cold' | 'warm' | 'hot' }) {
  const r = 17;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#f1f5f9" strokeWidth="3" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={TEMP_RING[temp]} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-900 tracking-tight">{score}</span>
      </div>
    </div>
  );
}

function BigScore({ score, temp }: { score: number; temp: 'cold' | 'warm' | 'hot' }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={TEMP_RING[temp]} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-slate-900 leading-none tracking-tight">{score}</span>
        <span className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────

type Stage = 'intro' | 'arriving' | 'analyzing' | 'complete';

// Barre de progression discrète sous le header pendant l'auto-play
function IntroProgress({ stage }: { stage: Stage }) {
  const progress = stage === 'intro' ? 5 :
                   stage === 'arriving' ? 30 :
                   stage === 'analyzing' ? 70 :
                   100;
  return (
    <div className="h-px bg-slate-100">
      <div
        className="h-px bg-emerald-500 transition-all ease-linear"
        style={{ width: `${progress}%`, transitionDuration: '2500ms' }}
      />
    </div>
  );
}

export default function InteractiveDemo() {
  const [mode, setMode] = useState<'guided' | 'manual'>('guided');
  const [selectedId, setSelectedId] = useState<string>(MOCK_PROSPECTS[1].id); // Sophie par défaut
  const [stage, setStage] = useState<Stage>('intro');
  const [tab, setTab] = useState<Tab>('email_sent');
  const [copied, setCopied] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const introTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  // ── Auto-play l'intro au premier chargement ──
  // Cadencée pour laisser le temps de lire chaque étape
  useEffect(() => {
    if (introPlayed) return;

    // 0s        : init (tableau de bord calme)
    // 2.5s      : nouvel email arrive (visible 3s pour le remarquer)
    // 5.5s      : BankKey commence à analyser (visible 5s)
    // 10.5s     : fiche complète révélée + Camille en tête de liste
    const t1 = setTimeout(() => setStage('arriving'), 2500);
    const t2 = setTimeout(() => setStage('analyzing'), 5500);
    const t3 = setTimeout(() => {
      setSelectedId(NEW_PROSPECT_ID);
      setStage('complete');
      setIntroPlayed(true);
    }, 10500);

    introTimeoutRef.current = [t1, t2, t3];
    return () => introTimeoutRef.current.forEach(clearTimeout);
  }, [introPlayed]);

  const selected = useMemo(
    () => MOCK_PROSPECTS.find(p => p.id === selectedId) ?? MOCK_PROSPECTS[0],
    [selectedId]
  );

  const documents = useMemo(
    () => generateDocumentChecklist(selected.qualification),
    [selected]
  );

  // Reset tab when switching prospect
  useEffect(() => { setTab('email_sent'); }, [selectedId]);

  const newProspectVisible = stage !== 'intro';

  // Trier prospects par score décroissant
  const sortedProspects = useMemo(() => {
    return [...MOCK_PROSPECTS]
      .filter(p => p.id !== NEW_PROSPECT_ID || newProspectVisible)
      .sort((a, b) => b.scoring.score - a.scoring.score);
  }, [newProspectVisible]);

  // Stats
  const totalProspects = sortedProspects.length;
  const hotCount = sortedProspects.filter(p => p.scoring.temperature === 'hot').length;
  const warmCount = sortedProspects.filter(p => p.scoring.temperature === 'warm').length;

  function copyEmail() {
    const text = `Objet : ${selected.prospection.email.subject}\n\n${selected.prospection.email.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header avec toggle 2 modes ── */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="BankKey, retour à l'accueil">
            <Wordmark size={22} />
          </Link>

          {/* Toggle de mode démo (in-page) */}
          <div className="inline-flex items-center bg-slate-100 rounded-full p-0.5">
            <button
              onClick={() => setMode('guided')}
              className={`px-3 py-1 text-[11px] rounded-full transition-colors ${mode === 'guided' ? 'font-semibold bg-white text-slate-900 shadow-sm' : 'font-medium text-slate-500 hover:text-slate-700'}`}
            >
              Démo guidée
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-3 py-1 text-[11px] rounded-full transition-colors ${mode === 'manual' ? 'font-semibold bg-white text-slate-900 shadow-sm' : 'font-medium text-slate-500 hover:text-slate-700'}`}
            >
              Testez avec votre email
            </button>
          </div>

          <Link href="/pro/login" className="text-xs font-medium bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg transition-colors">
            Essai gratuit
          </Link>
        </div>

        {/* Barre de progression discrète pendant l'intro */}
        {mode === 'guided' && !introPlayed && <IntroProgress stage={stage} />}
      </header>

      {mode === 'manual' && <ManualDemo />}
      {mode === 'guided' && (<>


      {/* ── Intro ── */}
      <div className="max-w-7xl mx-auto px-5 pt-10 pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Une journée type</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
          {stage === 'complete'
            ? 'Explorez vos prospects, cliquez sur n\'importe quel email'
            : 'Regardez BankKey traiter un email en direct'}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {stage === 'intro' && 'Votre tableau de bord matinal : 4 prospects en attente, classés par score.'}
          {stage === 'arriving' && 'Un nouvel email vient d\'arriver.'}
          {stage === 'analyzing' && 'BankKey extrait le profil, calcule la bancabilité et rédige la réponse.'}
          {stage === 'complete' && 'Cliquez sur un prospect pour voir son email, son analyse et la réponse pré-rédigée.'}
        </p>
      </div>

      {/* ── Layout 3 colonnes ── */}
      <main className="max-w-7xl mx-auto px-5 pb-16">
        <div className="grid lg:grid-cols-12 gap-5">

          {/* ─── Colonne 1 — Liste prospects (4 cols) ─── */}
          <aside className="lg:col-span-4 space-y-4">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-lg font-semibold text-slate-900 mt-0.5">{totalProspects}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Prioritaires</p>
                <p className="text-lg font-semibold text-emerald-600 mt-0.5">{hotCount}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">À qualifier</p>
                <p className="text-lg font-semibold text-amber-600 mt-0.5">{warmCount}</p>
              </div>
            </div>

            {/* Prospects list */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <I.Inbox />
                <span className="text-xs font-semibold text-slate-900">Tableau de bord</span>
                <span className="text-[10px] text-slate-400 ml-auto">Triés par score</span>
              </div>

              {/* Pipeline pendant l'arrivée */}
              {stage === 'analyzing' && (
                <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-200 flex items-center gap-2">
                  <div className="relative">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700">BankKey analyse Camille Martin…</span>
                </div>
              )}

              <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
                {sortedProspects.map(p => {
                  const isSelected = p.id === selectedId;
                  const isNew = p.id === NEW_PROSPECT_ID && stage !== 'intro';
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`relative w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        isSelected
                          ? 'bg-slate-50 border border-slate-300 shadow-sm'
                          : isNew
                            ? 'bg-emerald-50/60 border border-emerald-200 hover:bg-emerald-50'
                            : 'border border-transparent hover:bg-slate-50'
                      }`}
                      style={isNew && stage === 'complete' ? { animation: 'slideInTop 0.6s cubic-bezier(0.16, 1, 0.3, 1)' } : undefined}
                    >
                      {/* Indicateur de sélection sur la gauche */}
                      {isSelected && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 bg-blue-900 rounded-r" />
                      )}
                      <MiniScore score={p.scoring.score} temp={p.scoring.temperature} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm font-semibold truncate text-slate-900">
                            {p.fromName}
                          </span>
                          {isNew && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded shrink-0 animate-pulse">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] truncate text-slate-500">
                          {p.qualification.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${TEMP_BADGE[p.scoring.temperature]}`}>
                            {TEMP_LABEL[p.scoring.temperature]}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            · {p.receivedDisplay}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ─── Colonne 2 — Détail prospect (8 cols) ─── */}
          <section className="lg:col-span-8 space-y-4">
            <ProspectDetail
              prospect={selected}
              documents={documents}
              tab={tab}
              setTab={setTab}
              copyEmail={copyEmail}
              copied={copied}
              showAnalyzing={stage === 'analyzing' && selectedId === NEW_PROSPECT_ID}
            />
          </section>

        </div>

        {/* ── CTA Footer ── */}
        {stage === 'complete' && (
          <>
            {/* Sections "le reste de l'app" */}
            <div className="mt-16 space-y-8 animate-fade-up">

              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Le reste de l&apos;app</p>
                <h2 className="font-semibold text-2xl md:text-3xl tracking-tight text-slate-900">
                  Ce que vous voyez après quelques semaines d&apos;utilisation.
                </h2>
                <p className="text-sm text-slate-600 mt-3 max-w-xl mx-auto">
                  BankKey ne s&apos;arrête pas à la qualification. Voici à quoi ressemble votre tableau de bord une fois les dossiers en mouvement.
                </p>
              </div>

              <BanksKanban />

              <BilanSnapshot />
            </div>

            <div className="mt-12 bg-blue-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold mb-1">Vous voyez tout ce que BankKey fait.</p>
                <p className="text-sm text-slate-400">Reste à le faire tourner sur vos vrais emails.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setMode('manual')} className="text-sm text-slate-300 hover:text-white transition-colors">
                  Tester avec votre email →
                </button>
                <Link href="/pro/login?mode=signup" className="bg-white hover:bg-slate-100 text-slate-900 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Commencer l&apos;essai 30 jours
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
      </>)}

      <style jsx>{`
        @keyframes slideInTop {
          0% { opacity: 0; transform: translateY(-12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Sous-composant : détail d'un prospect
// ════════════════════════════════════════════════════════════════════════

interface DocItem { name: string; required: boolean; hint?: string }
interface DocGroup { category: string; items: DocItem[] }
interface Documents {
  jurisdiction: 'FR' | 'CH' | 'unknown';
  urgency: 'urgent' | 'normal';
  groups: DocGroup[];
  estimatedCompleteness: number;
}

function ProspectDetail({
  prospect, documents, tab, setTab, copyEmail, copied, showAnalyzing
}: {
  prospect: MockProspect;
  documents: Documents;
  tab: Tab;
  setTab: (t: Tab) => void;
  copyEmail: () => void;
  copied: boolean;
  showAnalyzing: boolean;
}) {
  const q = prospect.qualification;
  const s = prospect.scoring;
  const p = prospect.prospection;
  const currency = detectCurrency(q);
  const fullName = [q.firstName, q.lastName].filter(Boolean).join(' ') || prospect.fromName;
  const cityFromAddress = q.address?.split(',')[0]?.trim();

  const downPaymentPct = q.down_payment && q.price ? Math.round((q.down_payment / q.price) * 100) : null;
  const debtRatio = q.existing_debts_monthly !== null && q.monthly_income
    ? Math.round((q.existing_debts_monthly / q.monthly_income) * 100) : null;

  return (
    <>
      {/* Email original — toujours en haut */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-3">
          <I.Mail />
          <span className="text-xs font-semibold text-slate-900">Email reçu</span>
          <span className="text-[10px] text-slate-400 ml-auto">{prospect.receivedDisplay}</span>
        </div>
        <div className="px-5 py-4 space-y-2">
          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-8 shrink-0">De</span>
            <span className="font-medium text-slate-900">{prospect.fromName}</span>
            <span className="text-slate-400">&lt;{prospect.fromEmail}&gt;</span>
          </div>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-8 shrink-0">Objet</span>
            <span className="font-medium text-slate-900">{prospect.subject}</span>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-4">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{prospect.body}</pre>
        </div>
      </div>

      {/* Analyzing overlay */}
      {showAnalyzing && (
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-sm font-medium text-slate-900">Analyse en cours par BankKey…</span>
          </div>
        </div>
      )}

      {/* Fiche client */}
      {!showAnalyzing && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-slate-100">
            <div className="flex items-start gap-5">
              <BigScore score={s.score} temp={s.temperature} />
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{fullName}</h2>
                  <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${TEMP_BADGE[s.temperature]}`}>
                    {TEMP_LABEL[s.temperature]}
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

          {/* Contact */}
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

          {/* Bancabilité */}
          {(q.monthly_income || q.down_payment || q.employment_status) && (
            <div className="px-6 py-5 bg-emerald-50/40 border-b border-slate-100">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest mb-4">Bancabilité</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {q.monthly_income && (
                  <div>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Revenus mensuels</p>
                    <p className="text-base font-semibold text-slate-900">{q.monthly_income.toLocaleString('fr-FR')} {currency}</p>
                    {q.is_couple && <p className="text-[10px] text-slate-400 mt-0.5">Foyer</p>}
                  </div>
                )}
                {q.down_payment !== null && q.down_payment !== undefined && (
                  <div>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Apport</p>
                    <p className="text-base font-semibold text-slate-900">
                      {q.down_payment === 0 ? '—' : `${q.down_payment.toLocaleString('fr-FR')} ${currency}`}
                    </p>
                    {downPaymentPct !== null && q.down_payment > 0 && (
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
                {q.existing_debts_monthly !== null && q.existing_debts_monthly !== undefined && (
                  <div>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Crédits en cours</p>
                    <p className="text-base font-semibold text-slate-900">
                      {q.existing_debts_monthly === 0 ? 'Aucun' : `${q.existing_debts_monthly.toLocaleString('fr-FR')} ${currency}/m`}
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

          {/* Profile */}
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Profil emprunteur</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              {[
                { label: 'Bien ciblé', value: q.propertyType },
                { label: 'Localisation', value: q.address },
                { label: 'Surface', value: q.surface ? `${q.surface} m²` : null },
                { label: 'Pièces', value: q.rooms },
                { label: 'Budget / Prix', value: q.price ? `${q.price.toLocaleString('fr-FR')} ${currency}` : null },
                { label: 'Délai d\'achat', value: q.purchase_timeline ? TIMELINE_LABEL[q.purchase_timeline] : null },
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

          {/* Scoring factors */}
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

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {([
              { id: 'email_sent' as Tab, label: 'Réponse rédigée', badge: undefined as string | undefined },
              { id: 'call'       as Tab, label: 'Briefing appel',  badge: undefined as string | undefined },
              { id: 'documents'  as Tab, label: 'Documents',       badge: documents.urgency === 'urgent' ? 'Urgent' : undefined },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 ${
                  tab === t.id ? 'text-slate-900 border-b-2 border-blue-900' : 'text-slate-400 hover:text-slate-600'
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
            {tab === 'email_sent' && (
              <div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-baseline gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-10 shrink-0">Objet</span>
                    <span className="text-sm font-medium text-slate-800">{p.email.subject}</span>
                  </div>
                  <div className="px-4 py-4">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {p.email.body}
                    </pre>
                  </div>
                </div>
                <div className="mt-2.5 flex justify-end">
                  <button onClick={copyEmail} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    <I.Copy />
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'call' && (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Contexte</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{p.callScript.briefing}</p>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Besoin du prospect</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-slate-700 leading-relaxed">{p.callScript.need}</p>
                  </div>
                </div>
                <div className="border border-emerald-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Question clé à poser en premier</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-slate-700 leading-relaxed italic">« {p.callScript.keyQuestion} »</p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'documents' && (
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
