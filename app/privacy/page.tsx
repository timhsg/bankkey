import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — BankKey',
  description: 'Comment BankKey traite vos données personnelles et celles de vos prospects.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tighter">BK</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            ← Accueil
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">

        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Politique de confidentialité</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">Comment nous protégeons vos données</h1>
        <p className="text-sm text-slate-500 mb-12">Dernière mise à jour : 7 juin 2026 · Version 1.0</p>

        <div className="prose prose-slate max-w-none space-y-8">

          <Section title="1. Qui sommes-nous ?">
            <p>BankKey est un service SaaS conçu pour les courtiers en crédit immobilier en France et en Suisse. Il qualifie automatiquement les emails de demande de financement reçus par les courtiers, calcule un score de bancabilité, et rédige une réponse pré-remplie.</p>
            <p><strong>Responsable de traitement :</strong> BankKey (en cours d&apos;immatriculation)<br/>
            <strong>Contact DPO :</strong> dpo@bankkey.ch</p>
          </Section>

          <Section title="2. Données collectées">
            <p>Nous collectons trois catégories de données :</p>

            <h4>2.1 Données du courtier (vous)</h4>
            <ul>
              <li>Email, mot de passe (chiffré bcrypt)</li>
              <li>Informations cabinet : nom, adresse, téléphone, signature email</li>
              <li>Préférences de scoring et de communication</li>
              <li>Données de facturation (via Stripe — nous ne stockons jamais votre numéro de carte)</li>
            </ul>

            <h4>2.2 Données du prospect (vos demandeurs de crédit)</h4>
            <ul>
              <li>Contenu des emails reçus (sujet, corps, métadonnées)</li>
              <li>Informations extraites par notre IA : nom, situation pro, revenus, apport, projet immobilier</li>
              <li>Vos notes internes sur le prospect</li>
            </ul>

            <h4>2.3 Données de connexion Gmail (optionnel)</h4>
            <ul>
              <li>Tokens OAuth chiffrés (accès en lecture aux emails entrants)</li>
              <li>Email Gmail connecté</li>
              <li>Nous ne stockons <strong>jamais</strong> l&apos;intégralité de votre boîte mail — seulement les emails que vous nous demandez de traiter</li>
            </ul>
          </Section>

          <Section title="3. Comment nous utilisons vos données">
            <ul>
              <li><strong>Qualification IA</strong> : le contenu des emails est envoyé à Claude (Anthropic) pour analyse. Aucune donnée n&apos;est conservée chez Anthropic au-delà de la requête (rétention zéro contractuelle).</li>
              <li><strong>Stockage sécurisé</strong> : seules les données extraites structurées sont conservées dans votre instance Supabase isolée, chiffrée au repos.</li>
              <li><strong>Pas d&apos;entraînement de modèle</strong> : vos données ne sont jamais utilisées pour entraîner un modèle d&apos;IA.</li>
              <li><strong>Pas de revente</strong> : nous ne partageons aucune donnée avec des tiers commerciaux.</li>
            </ul>
          </Section>

          <Section title="4. Conformité Google API Services">
            <p>BankKey respecte la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener" className="text-slate-900 underline">Google API Services User Data Policy</a>, y compris les Limited Use Requirements :</p>
            <ul>
              <li>Nous accédons à vos emails Gmail uniquement pour fournir le service de qualification</li>
              <li>Vos emails ne sont jamais transférés à des tiers à des fins publicitaires</li>
              <li>Vos emails ne sont jamais utilisés pour entraîner un modèle d&apos;intelligence artificielle</li>
              <li>L&apos;accès humain à vos emails est strictement limité au support utilisateur autorisé par vous</li>
              <li>Vous pouvez révoquer notre accès à Gmail à tout moment depuis votre <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener" className="text-slate-900 underline">compte Google</a></li>
            </ul>
          </Section>

          <Section title="5. Hébergement et sous-traitants">
            <p>Tous nos sous-traitants ont signé un DPA conforme RGPD :</p>
            <ul>
              <li><strong>Supabase</strong> (EU - Francfort) : base de données et authentification</li>
              <li><strong>Anthropic</strong> (US, clauses contractuelles types) : analyse IA des emails</li>
              <li><strong>Vercel</strong> (EU - Francfort) : hébergement de l&apos;application web</li>
              <li><strong>Stripe</strong> (EU - Dublin) : traitement des paiements</li>
              <li><strong>Google</strong> : accès Gmail via OAuth (selon vos autorisations)</li>
            </ul>
          </Section>

          <Section title="6. Durée de conservation">
            <ul>
              <li><strong>Données de connexion Gmail</strong> : tant que vous maintenez la connexion active</li>
              <li><strong>Prospects et qualifications</strong> : tant que votre abonnement est actif + 30 jours après résiliation</li>
              <li><strong>Données de facturation</strong> : 10 ans (obligations comptables)</li>
              <li><strong>Logs techniques</strong> : 90 jours</li>
            </ul>
          </Section>

          <Section title="7. Vos droits RGPD">
            <p>Vous disposez à tout moment des droits suivants :</p>
            <ul>
              <li><strong>Accès</strong> : obtenir une copie de toutes vos données</li>
              <li><strong>Rectification</strong> : corriger une donnée inexacte</li>
              <li><strong>Effacement</strong> : suppression complète sous 72 h ouvrées</li>
              <li><strong>Portabilité</strong> : export CSV/JSON de l&apos;ensemble de vos données</li>
              <li><strong>Opposition</strong> : refuser tout traitement non strictement nécessaire au service</li>
              <li><strong>Réclamation</strong> auprès de la CNIL (France) ou du PFPDT (Suisse)</li>
            </ul>
            <p>Pour exercer vos droits : <a href="mailto:dpo@bankkey.ch" className="text-slate-900 underline">dpo@bankkey.ch</a> — réponse sous 30 jours.</p>
          </Section>

          <Section title="8. Sécurité">
            <ul>
              <li>Chiffrement TLS 1.3 en transit, AES-256 au repos</li>
              <li>Tokens OAuth chiffrés via Supabase Vault</li>
              <li>Row Level Security PostgreSQL : isolation stricte par cabinet</li>
              <li>Politique de mot de passe forte + 2FA disponible</li>
              <li>Audit logs des accès aux données sensibles</li>
            </ul>
          </Section>

          <Section title="9. Cookies">
            <p>Nous n&apos;utilisons que des cookies strictement nécessaires au fonctionnement du service :</p>
            <ul>
              <li>Cookie de session Supabase (authentification)</li>
              <li>Préférence de devise (EUR/CHF)</li>
            </ul>
            <p>Aucun cookie publicitaire ou de tracking tiers.</p>
          </Section>

          <Section title="10. Modifications">
            <p>Toute modification matérielle de cette politique vous sera notifiée par email 30 jours à l&apos;avance. La version en vigueur est toujours disponible sur cette page.</p>
          </Section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 text-sm text-slate-500 flex items-center justify-between">
          <Link href="/terms" className="text-slate-700 hover:text-slate-900 transition-colors">→ Conditions générales</Link>
          <Link href="/security" className="text-slate-700 hover:text-slate-900 transition-colors">→ Page sécurité</Link>
        </div>
      </article>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h2>
      <div className="text-sm text-slate-700 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-2 [&_h4]:font-semibold [&_h4]:text-slate-900 [&_h4]:mt-4 [&_h4]:mb-1 [&_a]:underline">
        {children}
      </div>
    </section>
  )
}
