import Link from 'next/link'
import type { Metadata } from 'next'
import SiteHeader from '@/app/_components/SiteHeader'
import SiteFooter from '@/app/_components/SiteFooter'

export const metadata: Metadata = {
  title: 'Conditions générales d\'utilisation · BankKey',
  description: 'CGU et CGV de BankKey, service SaaS de qualification de leads pour courtiers en crédit.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      <SiteHeader
        right={
          <Link href="/" className="text-sm font-medium text-[#374151] hover:text-navy transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        }
      />

      <article className="max-w-3xl mx-auto px-6 py-16">

        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Conditions générales</p>
        <h1 className="text-4xl font-extrabold tracking-tightest text-navy mb-3">Conditions d&apos;utilisation et de vente</h1>
        <p className="text-sm text-slate-500 mb-12">Dernière mise à jour : 7 juin 2026 · Version 1.0</p>

        <div className="space-y-8">

          <Section title="1. Objet">
            <p>BankKey est un service en ligne (SaaS) de qualification automatique d&apos;emails de demande de financement, destiné aux courtiers en crédit immobilier en France et en Suisse. Le service inclut : analyse IA des emails entrants, scoring de bancabilité, rédaction de réponses, briefing d&apos;appel, génération de checklist documents.</p>
          </Section>

          <Section title="2. Identification du fournisseur">
            <p>BankKey (en cours d&apos;immatriculation)<br/>
            Suisse · Contact : contact@bankkey.ch · DPO : dpo@bankkey.ch</p>
          </Section>

          <Section title="3. Acceptation des CGU">
            <p>L&apos;utilisation du service vaut acceptation pleine et entière des présentes conditions. Toute personne créant un compte déclare avoir la capacité juridique requise et représenter valablement le cabinet de courtage indiqué.</p>
          </Section>

          <Section title="4. Inscription et compte">
            <ul>
              <li>L&apos;inscription est gratuite et ouvre droit à un essai de 30 jours sans engagement</li>
              <li>Vous garantissez l&apos;exactitude des informations fournies</li>
              <li>Vous êtes seul responsable de la confidentialité de vos identifiants</li>
              <li>Un compte = un cabinet (le partage est interdit)</li>
            </ul>
          </Section>

          <Section title="5. Tarifs et facturation">
            <ul>
              <li><strong>Essai gratuit</strong> : 30 jours, accès complet, sans carte bancaire requise</li>
              <li><strong>Solo</strong> : 249 € HT / mois (France) ou 249 CHF HT / mois (Suisse) · 1 courtier, jusqu&apos;à 60 leads/mois</li>
              <li><strong>Cabinet</strong> : 449 € HT / mois (France) ou 449 CHF HT / mois (Suisse) · leads illimités, jusqu&apos;à 5 courtiers</li>
              <li><strong>Réseau</strong> : sur devis (multi-agences, API)</li>
              <li>Facturation mensuelle ou annuelle (2 mois offerts en annuel) via Stripe</li>
              <li>Annulation possible à tout moment depuis votre espace facturation</li>
              <li>Aucun remboursement au prorata du mois en cours</li>
              <li>Tout dépassement d&apos;usage fera l&apos;objet d&apos;un échange préalable, jamais d&apos;une facturation surprise</li>
            </ul>
          </Section>

          <Section title="6. Engagements de BankKey">
            <ul>
              <li>Disponibilité : SLA de 99,5 % hors maintenance planifiée</li>
              <li>Confidentialité : voir notre <Link href="/privacy" className="text-slate-900 underline">politique de confidentialité</Link></li>
              <li>Pas d&apos;envoi automatique sans validation : aucune réponse n&apos;est envoyée en votre nom sans votre clic explicite</li>
              <li>Support : réponse sous 48 h ouvrées (24 h pour Pro)</li>
            </ul>
          </Section>

          <Section title="7. Vos engagements">
            <ul>
              <li>Utilisation conforme à la loi (notamment IOBSP en France, LBA en Suisse)</li>
              <li>Pas d&apos;automatisation de spam ou de cold emailing massif</li>
              <li>Respect des droits des prospects (information, consentement, RGPD)</li>
              <li>Pas de tentative d&apos;intrusion ou de reverse engineering du service</li>
            </ul>
          </Section>

          <Section title="8. Propriété intellectuelle">
            <p>BankKey conserve l&apos;ensemble des droits sur le code source, l&apos;interface, les modèles de prompts et la marque. Vous conservez la propriété intégrale de vos données : prospects, notes, configurations, signatures. Vous pouvez les exporter à tout moment au format CSV ou JSON.</p>
          </Section>

          <Section title="9. Limitation de responsabilité">
            <ul>
              <li>Le score de bancabilité est un <strong>outil d&apos;aide à la décision</strong>, jamais un avis bancaire ou une garantie d&apos;acceptation</li>
              <li>La responsabilité finale du conseil au client reste celle du courtier IOBSP/IAS</li>
              <li>BankKey ne peut être tenu pour responsable d&apos;une perte d&apos;opportunité commerciale liée à une erreur d&apos;extraction IA</li>
              <li>Responsabilité plafonnée au montant des 12 derniers mois d&apos;abonnement</li>
            </ul>
          </Section>

          <Section title="10. Résiliation">
            <ul>
              <li>Résiliation par vous : à tout moment, en un clic depuis votre espace facturation</li>
              <li>Résiliation par nous : avec préavis de 30 jours sauf manquement grave (fraude, spam, comportement abusif)</li>
              <li>À la résiliation : conservation de vos données 30 jours pour récupération, puis suppression définitive</li>
            </ul>
          </Section>

          <Section title="11. Droit applicable et juridiction">
            <p>Les présentes sont régies par le droit suisse. En cas de litige, recherche préalable d&apos;une solution amiable. À défaut, juridiction compétente : tribunaux du canton de Genève.</p>
            <p>Pour les utilisateurs en France, les dispositions impératives du droit français de la consommation et du RGPD restent applicables si elles sont plus protectrices.</p>
          </Section>

          <Section title="12. Modifications">
            <p>Toute modification matérielle vous sera notifiée par email 30 jours à l&apos;avance. La continuation du service après ces 30 jours vaut acceptation. Si vous refusez les nouvelles conditions, vous pouvez résilier sans frais.</p>
          </Section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 text-sm text-slate-500 flex items-center justify-between">
          <Link href="/privacy" className="text-slate-700 hover:text-slate-900 transition-colors">→ Politique de confidentialité</Link>
          <Link href="/security" className="text-slate-700 hover:text-slate-900 transition-colors">→ Page sécurité</Link>
        </div>
      </article>

      <SiteFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h2>
      <div className="text-sm text-slate-700 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-2 [&_a]:text-slate-900">
        {children}
      </div>
    </section>
  )
}
