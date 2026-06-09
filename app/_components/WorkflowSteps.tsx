// ════════════════════════════════════════════════════════════════════════
//  Workflow visuel : 3 étapes avec mini-mockups réalistes
// ════════════════════════════════════════════════════════════════════════

export default function WorkflowSteps() {
  return (
    <section id="process" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Comment ça marche</p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
          Du email entrant à la réponse en 60 secondes
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto">
          BankKey s&apos;exécute en arrière-plan de votre boîte mail. Aucun changement dans votre quotidien.
        </p>
      </div>

      {/* 3 colonnes avec mini-mockups */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Step 1 — Email reçu */}
        <div className="space-y-4">
          <StepNumber num="01" label="Réception" />
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover-lift transition-base">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Boîte mail</div>
            <div className="space-y-2">
              {/* Email 1 — nouveau */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-900">Camille Martin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
                <p className="text-[10px] text-slate-700 font-medium leading-snug mb-0.5">
                  Recherche financement résidence
                </p>
                <p className="text-[9px] text-slate-500 truncate">
                  Bonjour, nous cherchons un courtier...
                </p>
              </div>
              {/* Email 2 — vu */}
              <div className="border border-slate-100 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-700">Sophie Lefèvre</span>
                </div>
                <p className="text-[10px] text-slate-600 truncate">Demande info taux Lyon</p>
              </div>
              {/* Email 3 — vu */}
              <div className="border border-slate-100 rounded-lg p-2.5 opacity-70">
                <span className="text-[11px] font-medium text-slate-600">Marc Dubois</span>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Vos emails restent vos emails</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Connexion en lecture seule à Gmail ou adresse email forwarding. BankKey n&apos;envoie rien sans vous.
          </p>
        </div>

        {/* Step 2 — Analyse */}
        <div className="space-y-4">
          <StepNumber num="02" label="Analyse IA" />
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover-lift transition-base">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Pipeline</div>

            {/* Étapes pipeline */}
            <div className="space-y-2.5">
              {[
                { label: 'Lecture du contenu',  done: true },
                { label: 'Extraction du profil', done: true },
                { label: 'Score bancabilité',   done: true },
                { label: 'Rédaction réponse',   active: true },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                    s.done ? 'bg-emerald-500' : s.active ? 'border-2 border-emerald-500 bg-white' : 'border-2 border-slate-200 bg-white'
                  }`}>
                    {s.done && (
                      <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {s.active && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-soft-pulse" />}
                  </div>
                  <span className={`text-[11px] ${s.done ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Tags extraits */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1">
                {['CDI', 'Apport 20%', 'Compromis signé', 'Genève'].map(tag => (
                  <span key={tag} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">L&apos;IA fait le tri</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Profil structuré, score de bancabilité, réponse rédigée. Spams et messages perso sont filtrés.
          </p>
        </div>

        {/* Step 3 — Fiche client */}
        <div className="space-y-4">
          <StepNumber num="03" label="Action" />
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover-lift transition-base">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Fiche client</div>

            <div className="flex items-start gap-3 mb-3">
              {/* Score ring */}
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="18" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="24" cy="24" r="18" fill="none" stroke="#10b981" strokeWidth="3"
                    strokeLinecap="round" strokeDasharray={113.097} strokeDashoffset={113.097 * (1 - 0.87)} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-slate-900">87</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Camille Martin</p>
                <p className="text-[10px] text-slate-500">Couple · Genève · Compromis signé</p>
                <span className="inline-block mt-1.5 text-[8px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">
                  Prioritaire
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-emerald-50/50 rounded-md p-1.5">
                <p className="text-[8px] uppercase tracking-widest text-slate-500">Apport</p>
                <p className="text-[11px] font-semibold text-slate-900">170k CHF</p>
              </div>
              <div className="bg-emerald-50/50 rounded-md p-1.5">
                <p className="text-[8px] uppercase tracking-widest text-slate-500">Revenus</p>
                <p className="text-[11px] font-semibold text-slate-900">5 800/mo</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-blue-900 text-white text-center py-1.5 rounded-md text-[10px] font-medium">
                Envoyer réponse
              </div>
              <div className="px-2 py-1.5 border border-slate-200 rounded-md text-[10px] text-slate-700">
                Appeler
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Vous décidez, vous gagnez</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Fiche client complète, briefing d&apos;appel, checklist documents. Plus qu&apos;à valider et envoyer.
          </p>
        </div>
      </div>
    </section>
  )
}

function StepNumber({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono font-semibold text-slate-400">{num}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  )
}
