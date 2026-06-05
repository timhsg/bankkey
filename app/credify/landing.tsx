'use client'

export default function CredifyLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-slate-900">Credify</span>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">Fonctionnalités</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">Tarifs</a>
            <a href="/pro/login" className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
              Se connecter
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-5 py-24">
        <div className="text-center space-y-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Pour courtiers en crédit immobilier
          </span>

          <h1 className="text-5xl font-bold text-slate-900 leading-tight">
            Répondez à <span className="text-emerald-600">TOUS</span> vos leads<br />en moins d'une minute
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Chaque heure que vous tardez à répondre, un lead va chez le concurrent.
            Credify qualifie, score et prépare votre réponse automatiquement.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <a href="/pro/login" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Essai gratuit 30 jours →
            </a>
            <a href="/demo" className="flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-6 py-3 rounded-lg transition-colors">
              Voir une démo
            </a>
          </div>

          <p className="text-xs text-slate-500">
            Aucune carte bancaire requise. Accès immédiat.
          </p>
        </div>

        {/* Screenshot placeholder */}
        <div className="mt-16 bg-slate-100 rounded-2xl border border-slate-200 h-96 flex items-center justify-center">
          <span className="text-slate-400 text-sm">[Capture d'écran du dashboard]</span>
        </div>
      </section>

      {/* Problem + Solution */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Le problème réel</h2>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">✕</span>
                  <span>Vous recevez 80+ demandes par semaine sur email</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">✕</span>
                  <span>La qualification manuelle prend 15-30 min par dossier</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">✕</span>
                  <span>Chaque heure de délai = un lead perdu</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">✕</span>
                  <span>Commission moyenne perdue : 1 500 € par dossier non qualifié</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-200">
              <h3 className="font-bold text-slate-900 mb-4">La solution Credify</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Réponse en < 60 secondes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Scoring de bancabilité automatique</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Pré-dossier structuré prêt à traiter</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Économisez 2h/jour de qualification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Gardez 30% de leads supplémentaires</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-white rounded-lg border border-emerald-200">
                <p className="text-xs text-slate-500 mb-1">Gain économique mensuel</p>
                <p className="text-2xl font-bold text-emerald-600">+1 800 € net/mois</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-4xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          Ce que vous obtenez
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔗',
              title: 'Connexion Gmail',
              desc: 'Connectez votre boîte email en 1 clic. Credify lit vos demandes et répond automatiquement.',
            },
            {
              icon: '📊',
              title: 'Score de bancabilité',
              desc: 'Chaque lead reçoit un score 0-100. Identifiez immédiatement les bons dossiers.',
            },
            {
              icon: '📋',
              title: 'Pré-dossier structuré',
              desc: '10 champs pré-remplis : revenus, apport, situation pro, urgence. Prêt à traiter.',
            },
            {
              icon: '✉️',
              title: 'Réponse pré-rédigée',
              desc: 'Email professionnel, personnalisé, prêt à envoyer. Un clic pour valider et envoyer.',
            },
            {
              icon: '📞',
              title: 'Briefing d\'appel',
              desc: 'Contexte clé + question prioritaire. Appelez avec le bon angle.',
            },
            {
              icon: '🔄',
              title: 'Synchronisation auto',
              desc: 'Vérification toutes les 5 minutes. Aucune setup, zéro maintenance.',
            },
          ].map((f, i) => (
            <div key={i} className="space-y-3">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Tarification transparente
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Essai',
                price: '0 CHF',
                period: '30 jours gratuits',
                features: [
                  'Gmail connecté',
                  'Analyse automatique',
                  'Score + briefing',
                  'Réponses email',
                  'Support email',
                ],
                cta: 'Commencer l\'essai',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '399 CHF',
                period: 'par mois',
                features: [
                  'Tout de l\'essai',
                  'Intégrations Slack + SMS',
                  'Export de données',
                  'Webhook API',
                  'Support prioritaire',
                  'SLA 99.5%',
                ],
                cta: 'Passer à Pro',
                highlight: true,
              },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">{plan.price}</p>
                <p className="text-sm text-slate-600 mb-6">{plan.period}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2.5 font-medium rounded-lg transition-colors ${
                  plan.highlight
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'border border-slate-300 hover:border-slate-400 text-slate-700'
                }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-600 mt-8">
            1 dossier sauvé par mois = ROI positif. La plupart des courtiers en sauvent 3-5.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-5 py-20 text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Prêt à récupérer vos leads perdus ?
        </h2>
        <p className="text-lg text-slate-600">
          Essayez Credify 30 jours gratuitement. Aucune configuration requise.
        </p>
        <a href="/pro/login" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-4 rounded-lg text-lg">
          Commencer →
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 text-center text-sm">
        <div className="max-w-6xl mx-auto px-5">
          <p>Credify © 2025 — Qualification IA pour courtiers crédit immobilier</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="#" className="hover:text-white">Conditions</a>
            <a href="#" className="hover:text-white">Confidentialité</a>
            <a href="mailto:support@credify.ch" className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
