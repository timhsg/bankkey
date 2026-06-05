'use client'

export default function BankKeyLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-slate-900">BankKey</div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Fonctionnalités</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Tarifs</a>
            <a href="/pro/login" className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Connexion
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 py-32 text-center space-y-8">
        <div className="inline-block">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
            Pour courtiers en crédit immobilier
          </span>
        </div>

        <h1 className="text-6xl font-bold text-slate-900 leading-tight">
          Qualifiez <span className="text-emerald-600">TOUS</span> vos dossiers<br />en moins d'une minute
        </h1>

        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Chaque heure où vous tardez, un lead va chez le concurrent. BankKey qualifie, score et prépare votre réponse automatiquement.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <a href="/pro/login" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-lg transition-colors text-lg">
            Essai gratuit 30 jours
            <span className="text-xl">→</span>
          </a>
          <a href="/" className="inline-flex items-center gap-2 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-bold px-8 py-3.5 rounded-lg transition-colors text-lg">
            Voir une démo
          </a>
        </div>

        <p className="text-sm text-slate-500">
          Aucune carte bancaire requise. Accès immédiat.
        </p>
      </section>

      {/* Problem + Solution */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-slate-900">Votre problème réel</h2>
              <div className="space-y-4">
                {[
                  "Vous recevez 60-120 demandes par semaine sur email",
                  "Chacune demande 15-20 min de qualification",
                  "Vous en ratez 30-50% parce que vous n'avez pas le temps",
                  "Chaque dossier perdu = 1 500 € de commission",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl mt-1">✕</span>
                    <p className="text-slate-700 text-lg">{item}</p>
                  </div>
                ))}
              </div>
              <p className="text-3xl font-bold text-red-600 pt-4">
                -5 000 € / mois en revenus perdus
              </p>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-8 border-2 border-emerald-300 space-y-6">
              <h3 className="text-2xl font-bold text-slate-900">La solution BankKey</h3>
              <div className="space-y-3">
                {[
                  "Chaque email analysé en < 60 secondes",
                  "Score de bancabilité automatique (0-100)",
                  "Pré-dossier structuré (10 champs clés)",
                  "Réponse email prête à envoyer",
                  "Briefing appel : contexte + question clé",
                  "Synchronisation auto toutes les 5 min",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-xl">✓</span>
                    <p className="text-slate-700 text-base">{item}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-4 border border-emerald-200 mt-6">
                <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Gain économique réel</p>
                <p className="text-3xl font-bold text-emerald-600">+2 000 € / mois</p>
                <p className="text-xs text-slate-600 mt-2">Avec juste 2 dossiers sauvés de plus par mois</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-5 py-24">
        <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">
          Fonctionnalités
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🔗', title: 'Connexion Gmail', desc: 'Connectez en 1 clic. BankKey lit vos demandes et analyse automatiquement.' },
            { icon: '📊', title: 'Score de bancabilité', desc: 'Chaque lead reçoit un score 0-100. Identifiez les bons dossiers instantanément.' },
            { icon: '📋', title: 'Pré-dossier', desc: 'Revenus, apport, situation pro, urgence. Tout est structuré et prêt.' },
            { icon: '✉️', title: 'Réponse email', desc: 'Message professionnel, personnalisé, prêt à envoyer en un clic.' },
            { icon: '📞', title: 'Briefing appel', desc: 'Contexte du dossier + question critique à poser en premier.' },
            { icon: '🔄', title: 'Sync automatique', desc: 'Vérification toutes les 5 minutes. Zéro configuration.' },
          ].map((f, i) => (
            <div key={i} className="space-y-4">
              <span className="text-4xl">{f.icon}</span>
              <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-24">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">
            Tarification simple
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Essai gratuit',
                price: '0 CHF',
                period: '30 jours',
                features: ['Gmail connecté', 'Analyse automatique', 'Score + briefing', 'Réponses email', 'Support'],
                cta: 'Commencer maintenant',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '399 CHF',
                period: 'par mois',
                features: ['Tout de l\'essai', 'Intégrations Slack', 'Export de données', 'API webhook', 'Support prioritaire', 'SLA 99.5%'],
                cta: 'Passer à Pro',
                highlight: true,
              },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 border-2 ${
                plan.highlight
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-white border-slate-200'
              }`}>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-4xl font-bold text-slate-900 mt-4">{plan.price}</p>
                <p className="text-sm text-slate-600 mb-8">{plan.period}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 font-bold rounded-lg transition-colors text-base ${
                  plan.highlight
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'border-2 border-slate-300 hover:border-slate-400 text-slate-900'
                }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-600 mt-12">
            Un seul dossier sauvé par mois paie la subscription. La plupart sauvent 3-5 dossiers.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-5 py-24 text-center space-y-8">
        <h2 className="text-4xl font-bold text-slate-900">
          Récupérez vos leads perdus dès aujourd'hui
        </h2>
        <p className="text-lg text-slate-600">
          30 jours gratuits. Pas de carte bancaire requise.
        </p>
        <a href="/pro/login" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
          Commencer l'essai
          <span>→</span>
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-white text-lg">BankKey</span>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm hover:text-white">Conditions</a>
              <a href="#" className="text-sm hover:text-white">Confidentialité</a>
              <a href="mailto:support@bankkey.ch" className="text-sm hover:text-white">Support</a>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            BankKey © 2025 — Qualification IA pour courtiers crédit
          </p>
        </div>
      </footer>
    </div>
  )
}
