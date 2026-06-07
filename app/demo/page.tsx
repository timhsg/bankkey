'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ════════════════════════════════════════════════════════════════════════
//  Product Theater — démo auto-jouée pour les courtiers
//  Pas d'appel LLM. Données préchargées. Animation déterministe.
// ════════════════════════════════════════════════════════════════════════

// ── Données mockées ────────────────────────────────────────────────────

type Email = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
  isNew?: boolean;
};

type Prospect = {
  id: string;
  name: string;
  city: string;
  score: number;
  temp: 'cold' | 'warm' | 'hot';
  summary: string;
  time: string;
  isNew?: boolean;
};

const INITIAL_EMAILS: Email[] = [
  { id: 'e1', from: 'Marc Dubois',     subject: 'Refinancement de prêt en cours',     preview: 'Bonjour, suite à notre discussion du mois dernier...', time: '08:42' },
  { id: 'e2', from: 'Sophie Lefèvre',  subject: 'Demande d\'information taux',         preview: 'Bonjour, pouvez-vous m\'indiquer les taux actuels...',  time: '09:15' },
  { id: 'e3', from: 'Alex Bernard',    subject: 'Achat résidence principale',         preview: 'Bonjour, nous cherchons à acheter notre première...',  time: '09:48' },
  { id: 'e4', from: 'Lisa Moreau',     subject: 'Question sur l\'apport personnel',    preview: 'Bonjour, est-il possible d\'obtenir un crédit avec...', time: '10:21' },
];

const NEW_EMAIL: Email = {
  id: 'e5',
  from: 'Camille Martin',
  subject: 'Recherche financement résidence principale',
  preview: 'Bonjour, nous cherchons un courtier pour financer notre résidence principale à Genève. En couple, tous les deux en CDI...',
  time: 'À l\'instant',
  unread: true,
  isNew: true,
};

const INITIAL_PROSPECTS: Prospect[] = [
  { id: 'p1', name: 'Sophie Lefèvre', city: 'Lyon',     score: 72, temp: 'hot',  summary: 'CDI 4200€/mois, apport 18%, compromis à signer', time: 'Il y a 1h' },
  { id: 'p2', name: 'Marc Dubois',    city: 'Bordeaux', score: 65, temp: 'hot',  summary: 'Refinancement crédit existant 220k', time: 'Il y a 2h' },
  { id: 'p3', name: 'Lisa Moreau',    city: 'Paris',    score: 48, temp: 'warm', summary: 'Profil à clarifier — apport limité', time: 'Il y a 3h' },
  { id: 'p4', name: 'Alex Bernard',   city: 'Nantes',   score: 32, temp: 'cold', summary: 'Phase exploratoire, pas de bien ciblé', time: 'Il y a 5h' },
];

const NEW_PROSPECT: Prospect = {
  id: 'p5',
  name: 'Camille Martin',
  city: 'Genève',
  score: 87,
  temp: 'hot',
  summary: 'Couple CDI, apport 20%, compromis signé — délai 45j',
  time: 'À l\'instant',
  isNew: true,
};

const CARD_FIELDS = [
  { label: 'Revenus mensuels', value: '5 800 CHF', sub: 'Foyer' },
  { label: 'Apport',           value: '170 000 CHF', sub: '20% du prix', accent: 'emerald' },
  { label: 'Situation pro',    value: 'CDI', sub: 'Tous les deux' },
  { label: 'Crédits en cours', value: 'Aucun', sub: '', accent: 'emerald' },
];

// ── Sous-composants ────────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

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

function MiniScore({ score, temp }: { score: number; temp: 'cold' | 'warm' | 'hot' }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={TEMP_RING[temp]} strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-900 tracking-tight">{score}</span>
      </div>
    </div>
  );
}

function BigScore({ score, temp }: { score: number; temp: 'cold' | 'warm' | 'hot' }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={TEMP_RING[temp]} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-slate-900 leading-none tracking-tight">{score}</span>
        <span className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

function ProspectRow({ p, isHighlighted }: { p: Prospect; isHighlighted?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
      isHighlighted
        ? 'bg-emerald-50/60 border border-emerald-200'
        : 'border border-transparent hover:border-slate-200'
    }`}>
      <MiniScore score={p.score} temp={p.temp} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 truncate">{p.name}</span>
          {p.isNew && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded animate-pulse">
              Nouveau
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 truncate">{p.summary}</p>
      </div>
      <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${TEMP_BADGE[p.temp]}`}>
        {TEMP_LABEL[p.temp]}
      </span>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────

type Stage =
  | 'init'         // Tout est tranquille
  | 'arriving'     // Email arrive (notification)
  | 'reading'      // BankKey lit
  | 'extracting'   // Champs extraits (apparition progressive)
  | 'scoring'      // Score calculé (animation jauge)
  | 'priority'     // Liste prospects se réordonne, nouveau en tête
  | 'complete';    // Tout est affiché, état final

const STAGE_TIMINGS: Record<Stage, number> = {
  init:       1500,
  arriving:   1500,
  reading:    1800,
  extracting: 2500,
  scoring:    1500,
  priority:   1200,
  complete:   4000,
};

const STAGE_ORDER: Stage[] = ['init', 'arriving', 'reading', 'extracting', 'scoring', 'priority', 'complete'];

export default function ProductTheater() {
  const [stage, setStage] = useState<Stage>('init');
  const [fieldsShown, setFieldsShown] = useState(0);
  const [scoreAnimated, setScoreAnimated] = useState(false);
  const [loop, setLoop] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play state machine
  useEffect(() => {
    if (paused) return;

    const idx = STAGE_ORDER.indexOf(stage);
    const next = STAGE_ORDER[idx + 1];
    const delay = STAGE_TIMINGS[stage];

    if (next) {
      timeoutRef.current = setTimeout(() => setStage(next), delay);
    } else {
      // Boucle après 'complete'
      timeoutRef.current = setTimeout(() => {
        setStage('init');
        setFieldsShown(0);
        setScoreAnimated(false);
        setLoop(l => l + 1);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stage, paused, loop]);

  // Cascade des champs pendant 'extracting'
  useEffect(() => {
    if (stage !== 'extracting') {
      if (stage === 'init' || stage === 'arriving') setFieldsShown(0);
      return;
    }

    const interval = setInterval(() => {
      setFieldsShown(n => {
        if (n >= CARD_FIELDS.length) {
          clearInterval(interval);
          return n;
        }
        return n + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [stage]);

  // Score animation
  useEffect(() => {
    if (stage === 'scoring' || stage === 'priority' || stage === 'complete') {
      setScoreAnimated(true);
    } else {
      setScoreAnimated(false);
    }
  }, [stage]);

  const showNewEmail = ['arriving', 'reading', 'extracting', 'scoring', 'priority', 'complete'].includes(stage);
  const showCard     = ['reading', 'extracting', 'scoring', 'priority', 'complete'].includes(stage);
  const showPipeline = ['reading', 'extracting', 'scoring'].includes(stage);
  const showNewProspect = ['priority', 'complete'].includes(stage);

  const stageIdx = STAGE_ORDER.indexOf(stage);
  const allEmails = showNewEmail ? [NEW_EMAIL, ...INITIAL_EMAILS] : INITIAL_EMAILS;
  const allProspects = showNewProspect
    ? [NEW_PROSPECT, ...INITIAL_PROSPECTS]
    : INITIAL_PROSPECTS;

  // Pipeline step indicator
  const pipelineStep = stage === 'reading' ? 0 : stage === 'extracting' ? 1 : stage === 'scoring' ? 2 : -1;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold tracking-tighter">BK</span>
              </div>
              <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
            </Link>
            <span className="text-slate-200 select-none">|</span>
            <span className="text-xs font-medium text-slate-500">Démo en direct</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPaused(p => !p)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              {paused ? (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Reprendre
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  Pause
                </>
              )}
            </button>
            <Link href="/demo/manual" className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Tester avec mon email →
            </Link>
            <Link href="/pro/login" className="text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors">
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* ── Intro ── */}
      <div className="max-w-7xl mx-auto px-5 pt-10 pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Démo en temps réel</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
          Voyez BankKey traiter un email en direct
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Cette démo s&apos;exécute automatiquement, en boucle. Observez comment un nouvel email entrant
          est qualifié, scoré et priorisé en moins de 60 secondes.
        </p>
      </div>

      {/* ── Two-pane layout ── */}
      <main className="max-w-7xl mx-auto px-5 pb-16">
        <div className="grid lg:grid-cols-2 gap-5">

          {/* ─── Gmail pane (left) ─── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Gmail-style header */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-500">contact@cabinet-broker.fr — Boîte de réception</span>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 px-1">
                <MailIcon />
                <span className="text-sm font-semibold text-slate-900">Boîte de réception</span>
                <span className="text-xs text-slate-400">· {allEmails.length} messages</span>
              </div>

              <div className="space-y-1">
                {allEmails.map((email, i) => (
                  <div
                    key={email.id}
                    className={`px-3 py-2.5 rounded-lg transition-all duration-500 border ${
                      email.isNew
                        ? 'bg-blue-50/80 border-blue-200 shadow-sm'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    style={{
                      animation: email.isNew && i === 0 ? 'slideInTop 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      {email.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                      <span className={`text-sm font-semibold ${email.unread ? 'text-slate-900' : 'text-slate-700'} truncate`}>{email.from}</span>
                      {email.isNew && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500 text-white px-1.5 py-0.5 rounded animate-pulse ml-auto">
                          Nouveau
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 ml-auto shrink-0">{email.time}</span>
                    </div>
                    <p className={`text-xs ${email.unread ? 'text-slate-700' : 'text-slate-500'} truncate font-medium`}>{email.subject}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{email.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── BankKey pane (right) ─── */}
          <div className="space-y-5">

            {/* Pipeline indicator */}
            {showPipeline && (
              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">BankKey analyse un nouvel email</span>
                </div>
                <div className="flex items-center gap-2">
                  {['Lecture', 'Extraction', 'Scoring'].map((label, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        pipelineStep > i ? 'bg-slate-900 text-white' :
                        pipelineStep === i ? 'bg-white border-2 border-slate-900' : 'bg-white border-2 border-slate-200'
                      }`}>
                        {pipelineStep > i && (
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                        {pipelineStep === i && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />}
                      </div>
                      <span className={`text-xs font-medium ${pipelineStep >= i ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                      {i < 2 && <div className={`h-px flex-1 ${pipelineStep > i ? 'bg-slate-900' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Building Client Card */}
            {showCard && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-fade-up">

                {/* Card header with score */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <BigScore score={scoreAnimated ? NEW_PROSPECT.score : 0} temp={scoreAnimated ? NEW_PROSPECT.temp : 'cold'} />
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Camille Martin</h3>
                        {scoreAnimated && (
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${TEMP_BADGE.hot} animate-fade-up`}>
                            Prioritaire
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Couple
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Emprunteur · Genève</p>
                      {(stage === 'scoring' || stage === 'priority' || stage === 'complete') && (
                        <p className="text-sm text-slate-600 leading-relaxed mt-2.5 animate-fade-up">
                          Profil solide : couple en CDI, apport de 20%, compromis signé. Dossier urgent à traiter dans la journée.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bancabilité — fields cascading in */}
                <div className="px-5 py-4 bg-emerald-50/40 border-b border-slate-100 min-h-[120px]">
                  <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest mb-3">Bancabilité</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CARD_FIELDS.map((field, i) => (
                      <div key={i} className={`transition-all duration-500 ${
                        i < fieldsShown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                      }`}>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">{field.label}</p>
                        <p className="text-base font-semibold text-slate-900">{field.value}</p>
                        {field.sub && (
                          <p className={`text-[10px] font-medium mt-0.5 ${field.accent === 'emerald' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {field.sub}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action area when complete */}
                {stage === 'complete' && (
                  <div className="px-5 py-4 flex items-center gap-2 animate-fade-up">
                    <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                      Voir la réponse rédigée
                    </button>
                    <button className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                      Briefing appel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Prospects list */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Tableau de bord — Prospects par priorité</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{allProspects.length} actifs</span>
              </div>
              <div className="p-2.5 space-y-1">
                {allProspects.map((p) => (
                  <ProspectRow key={p.id} p={p} isHighlighted={p.isNew} />
                ))}
              </div>
            </div>

            {/* CTA section after complete */}
            {stage === 'complete' && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 animate-fade-up">
                <p className="text-sm font-semibold mb-1">Réponse en moins de 60 secondes.</p>
                <p className="text-xs text-slate-400 mb-3">
                  Imaginez ce même process appliqué à chaque email de votre boîte.
                </p>
                <div className="flex items-center gap-2">
                  <Link href="/pro/login" className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                    Démarrer l&apos;essai 30 jours
                  </Link>
                  <Link href="/demo/manual" className="text-xs text-slate-300 hover:text-white transition-colors ml-2">
                    Tester avec mon propre email →
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-12 text-center text-xs text-slate-400">
          <p>
            Démo automatique. Cycle : <span className="font-mono">{STAGE_ORDER.indexOf(stage) + 1}/{STAGE_ORDER.length}</span> · Boucle #{loop + 1}
          </p>
        </div>
      </main>

      {/* ── Keyframes ── */}
      <style jsx>{`
        @keyframes slideInTop {
          0% {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
