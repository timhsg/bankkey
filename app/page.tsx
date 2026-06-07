import Link from 'next/link'

// ── Inline icons (Lucide-style) ───────────────────────────────────────────

const iconBase = 'w-5 h-5 stroke-[1.5]'

const Icons = {
  Mail: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Gauge: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  ),
  FileText: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  ),
  Send: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  ),
  Phone: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  ),
  Lock: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Shield: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  Database: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  ),
  Bolt: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  ),
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ───── Header ───── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tighter">BK</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
            <a href="#process" className="hover:text-slate-900 transition-colors">Comment ça marche</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Fonctionnalités</a>
            <a href="#security" className="hover:text-slate-900 transition-colors">Sécurité</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/pro/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Connexion
            </Link>
            <Link href="/pro/login" className="text-sm bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Hero ───── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Pour cabinets de courtage en crédit immobilier
        </div>

        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6 text-slate-900">
          Chaque demande de financement,<br />
          <span className="text-slate-500">qualifiée en 60 secondes.</span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
          BankKey lit vos emails entrants, qualifie le profil de l'emprunteur,
          calcule un score de bancabilité et rédige votre réponse —
          avant que le prospect n'ait le temps d'appeler un concurrent.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/pro/login" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg transition-colors w-full sm:w-auto">
            Démarrer l'essai 30 jours
            <Icons.ArrowRight />
          </Link>
          <Link href="/demo" className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-medium px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors w-full sm:w-auto">
            Voir la démo en direct
          </Link>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Sans carte bancaire. Mise en service en moins de 10 minutes.
        </p>
      </section>

      {/* ───── Trust bar ───── */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-2"><Icons.Shield /> Conforme RGPD</span>
            <span className="flex items-center gap-2"><Icons.Database /> Données hébergées dans l'UE</span>
            <span className="flex items-center gap-2"><Icons.Lock /> Chiffrement de bout en bout</span>
            <span className="flex items-center gap-2"><Icons.Bolt /> Mise en service en 10 minutes</span>
          </div>
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section id="process" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Le processus</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Du email entrant à la réponse personnalisée</h2>
          <p className="text-slate-600 mt-4 max-w-xl mx-auto">Aucun changement dans votre quotidien. BankKey travaille en parallèle de votre boîte mail.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              n: '01',
              title: 'Connexion Gmail',
              desc: 'Connectez votre boîte professionnelle en lecture seule. Aucun email envoyé sans votre validation.',
            },
            {
              n: '02',
              title: 'Analyse en temps réel',
              desc: 'Chaque demande entrante est lue, structurée et scorée selon vos critères bancaires.',
            },
            {
              n: '03',
              title: 'Tableau de bord',
              desc: 'Vos prospects classés par priorité, avec pré-dossier, réponse rédigée et briefing d\'appel.',
            },
          ].map((step) => (
            <div key={step.n} className="relative">
              <div className="text-[11px] font-mono text-slate-400 mb-3">{step.n}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/demo" className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">
            Tester maintenant avec un email réel
            <Icons.ArrowRight />
          </Link>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section id="features" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Ce que BankKey livre</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Tout ce qu'il faut pour répondre en premier</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
            {[
              { icon: <Icons.Mail />, title: 'Lecture des emails', desc: 'Connexion Gmail sécurisée. Synchronisation automatique des nouvelles demandes entrantes.' },
              { icon: <Icons.Gauge />, title: 'Score de bancabilité', desc: 'Notation 0-100 selon vos critères : revenus, apport, situation pro, maturité du projet.' },
              { icon: <Icons.FileText />, title: 'Pré-dossier structuré', desc: 'Profil emprunteur complet : champs extraits automatiquement, prêt pour votre CRM.' },
              { icon: <Icons.Send />, title: 'Réponse email rédigée', desc: 'Message personnalisé, ton professionnel, prêt à être envoyé en un clic après relecture.' },
              { icon: <Icons.Phone />, title: 'Briefing d\'appel', desc: 'Contexte, besoin du prospect, et question clé à poser en ouverture de conversation.' },
              { icon: <Icons.Bolt />, title: 'Priorisation automatique', desc: 'Vos meilleurs dossiers en haut de liste. Les leads froids n\'encombrent plus votre boîte.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-7">
                <div className="text-slate-900 mb-4">{f.icon}</div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Security ───── */}
      <section id="security" className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Confidentialité</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Conçu pour la confidentialité bancaire.
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Les données de vos prospects sont sensibles. BankKey applique les standards de la finance européenne — chiffrement, isolation, et droit à l'effacement.
            </p>
          </div>

          <div className="md:col-span-3 space-y-5">
            {[
              { title: 'Hébergement européen', desc: 'Infrastructure dans l\'Union européenne. Vos données ne sortent jamais de l\'UE.' },
              { title: 'Chiffrement TLS et au repos', desc: 'Toutes les communications chiffrées en transit. Stockage chiffré avec AES-256.' },
              { title: 'Isolation par cabinet', desc: 'Chaque cabinet a sa propre instance logique. Aucun croisement de données entre clients.' },
              { title: 'Droit à l\'effacement', desc: 'Suppression définitive des données sous 72h sur simple demande. Conformité RGPD complète.' },
            ].map((s) => (
              <div key={s.title} className="flex gap-4 border-l-2 border-slate-200 pl-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Pricing ───── */}
      <section id="pricing" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Tarification</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Simple. Transparent. Annulable à tout moment.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Trial */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Essai</h3>
                <p className="text-xs text-slate-500">Pour tester sans engagement</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-slate-900">0 CHF</span>
                <span className="text-sm text-slate-500 ml-2">/ 30 jours</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Gmail connecté',
                  'Qualification illimitée',
                  'Scoring et pré-dossier',
                  'Réponses email rédigées',
                  'Briefing d\'appel',
                  'Support par email',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="text-slate-400 mt-0.5"><Icons.Check /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pro/login" className="block w-full text-center py-2.5 text-sm font-medium border border-slate-300 hover:border-slate-400 text-slate-900 rounded-lg transition-colors">
                Démarrer l'essai
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 text-white border border-slate-900 rounded-2xl p-8 flex flex-col relative">
              <div className="absolute -top-3 right-6 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                Recommandé
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-1">Pro</h3>
                <p className="text-xs text-slate-400">Pour les cabinets actifs</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-semibold">399 CHF</span>
                <span className="text-sm text-slate-400 ml-2">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Tout de l\'essai',
                  'Volume illimité',
                  'Export CSV des prospects',
                  'Webhook API personnalisé',
                  'Notifications Slack',
                  'Support prioritaire',
                  'SLA 99.5 %',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="text-emerald-400 mt-0.5"><Icons.Check /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pro/login" className="block w-full text-center py-2.5 text-sm font-medium bg-white hover:bg-slate-100 text-slate-900 rounded-lg transition-colors">
                Passer à Pro
              </Link>
            </div>

          </div>

          <p className="text-center text-xs text-slate-500 mt-10">
            Annulation en un clic. Aucune pénalité. Vos données vous appartiennent.
          </p>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Questions fréquentes</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Les réponses aux questions des courtiers</h2>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {[
            {
              q: 'BankKey envoie-t-il des emails automatiquement ?',
              a: 'Non. BankKey lit vos emails entrants en lecture seule et prépare une réponse rédigée. Vous gardez la main et envoyez après relecture.',
            },
            {
              q: 'Mes données restent-elles confidentielles ?',
              a: 'Oui. Toutes les données sont chiffrées, hébergées dans l\'UE, et isolées par cabinet. Aucun email n\'est conservé après analyse — seulement le pré-dossier extrait.',
            },
            {
              q: 'Combien de temps pour mettre BankKey en place ?',
              a: 'Moins de 10 minutes. Connexion Gmail en un clic, premier prospect analysé dans les 5 minutes qui suivent.',
            },
            {
              q: 'Le score de bancabilité est-il fiable ?',
              a: 'Le score reflète des critères objectifs (revenus, apport, endettement, situation pro). C\'est un outil de priorisation — pas une décision finale. Le courtier reste décisionnaire.',
            },
            {
              q: 'Que se passe-t-il si je résilie ?',
              a: 'Vous gardez l\'accès jusqu\'à la fin de la période payée. Suppression complète des données sous 72h sur simple demande.',
            },
            {
              q: 'Puis-je essayer sans engagement ?',
              a: 'Oui. Essai 30 jours gratuit, sans carte bancaire requise. Vous pouvez tester la démo immédiatement sur cette page.',
            },
          ].map((item, i) => (
            <details key={i} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-sm font-medium text-slate-900 pr-4">{item.q}</span>
                <span className="text-slate-400 group-open:rotate-45 transition-transform shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" /><path d="M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="text-sm text-slate-600 leading-relaxed mt-3 pr-8">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Répondez en premier, dès demain matin.
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            30 jours d'essai. Sans carte bancaire. Configuration en moins de 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/pro/login" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg transition-colors w-full sm:w-auto">
              Démarrer l'essai
              <Icons.ArrowRight />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-medium px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors w-full sm:w-auto">
              Tester la démo
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                  <span className="text-slate-900 text-xs font-bold tracking-tighter">BK</span>
                </div>
                <span className="font-semibold text-white">BankKey</span>
              </div>
              <p className="text-xs leading-relaxed">
                Qualification automatique pour les cabinets de courtage en crédit immobilier.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Produit</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#process" className="hover:text-white transition-colors">Comment ça marche</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Démo en ligne</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Entreprise</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="mailto:contact@bankkey.ch" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Légal</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Conditions générales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2025 BankKey. Tous droits réservés.</p>
            <p className="text-slate-500">Conçu en Suisse pour les courtiers européens.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
