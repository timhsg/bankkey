# BankKey — Contexte projet

> Fichier lu automatiquement par Claude au début de chaque session.
> Mettre à jour les sections "Statut actuel" et "Décisions" au fil de l'eau.

## 1. Mission

BankKey est un SaaS qui qualifie automatiquement les emails de demande de financement reçus par les **courtiers en crédit immobilier** en France et en Suisse. L'IA :

1. **Lit** chaque email Gmail entrant (OAuth lecture seule)
2. **Extrait** un profil emprunteur structuré (revenus, apport, situation pro, projet)
3. **Score** la bancabilité (0-100) selon des critères bancaires réels
4. **Rédige** la réponse email + briefing d'appel + checklist documents (FR ou CH)
5. **Priorise** les leads dans un tableau de bord

**Cible** : cabinets de courtage en crédit (1-5 personnes), 60-120 leads/mois, commission moyenne 2 500 CHF/dossier.

**Tarif lancement programme pilote** : Essai gratuit 30 jours · Pro **199 €/mois** (et 199 CHF/mois pour la Suisse).
- Stripe Price ID actuel : `price_1TfyJw0reUrQKljH2Z3oIAKX` (199 EUR/mois)
- Ancien Price ID (349 EUR, archivé) : `price_1TffPa0reUrQKljHZBVtkXHM`
- **Resend** (emails transactionnels + digest mensuel) : compte créé, clé API dans `.env.local` (jamais dans ce fichier — il est commité). ⚠️ L'ancienne clé a fuité dans l'historique git le 11/06/2026 et doit être révoquée + régénérée sur resend.com/api-keys. Domaine `bankkey.ch` à vérifier via DNS pour envoyer depuis @bankkey.ch.
- **Sentry** : setup en cours par Tim (compte gratuit Developer + projet Next.js)

## 2. Stack technique

| Couche | Tech | Notes |
|--------|------|-------|
| Frontend | Next.js 14 (App Router) + Tailwind + Inter font | Vercel deploy auto sur push main |
| Auth | Supabase Auth (email+password) | RLS strict par cabinet |
| DB | Supabase PostgreSQL | Hébergé EU (Francfort) |
| IA | Claude (Anthropic) | claude-haiku-4-5 (qualif+score), claude-sonnet-4-5 (prospection) |
| Email | Gmail OAuth pour ingestion + envoi | Resend pour transactionnels (pas encore prod) |
| Paiement | Stripe (à venir) | Pas encore configuré |
| Domaine | bankkey.ch | Vercel DNS configuré |

## 3. Structure du repo (clés)

```
app/
  page.tsx                  # Landing (hero, ROI calc, comparison, testimonials, security, pricing, FAQ)
  layout.tsx                # Inter font + metadata SEO
  globals.css               # Tailwind + animate-fade-up
  demo/
    page.tsx                # /demo — démo interactive (5 prospects mockés, auto-play intro)
    _data.ts                # Données des 5 prospects mockés
    manual/page.tsx         # /demo/manual — démo textarea (vrai appel API)
  book/page.tsx             # /book — formulaire réservation démo
  security/page.tsx         # /security — page sécurité complète
  pro/
    page.tsx                # /pro — dashboard prospects (auth requis)
    login/page.tsx          # /pro/login
    onboarding/page.tsx     # /pro/onboarding — connexion Gmail
    leads/[id]/page.tsx     # /pro/leads/:id — détail prospect
  api/
    analyze/route.ts        # POST /api/analyze — pipeline IA en SSE
    book/route.ts           # POST /api/book — sauve réservation démo
    gmail/                  # OAuth + sync + reply (Gmail)
  _components/
    ROICalculator.tsx       # Widget interactif sur landing

lib/
  sectors.ts                # SectorId = 'credit' uniquement
  agents/
    qualification.ts        # Extraction profil emprunteur (Haiku)
    scoring.ts              # Scoring bancabilité (Haiku)
    prospection.ts          # Email + briefing appel (Sonnet)
  documents/
    checklist.ts            # Génération déterministe checklist documents (FR/CH)
  supabase/
    server.ts               # Server clients (avec CookieOptions typés)
    client.ts               # Browser client

supabase/migrations/
  001_initial.sql           # profiles + prospects + RLS + trigger profil
  002_credit_mvp.sql        # Force sector='credit', colonnes documents/notes/appointments
  003_demo_bookings.sql     # Table réservations démo

types/index.ts              # Types partagés (QualificationResult, ScoringResult, etc.)
```

## 4. Décisions structurantes prises

| Décision | Raison |
|----------|--------|
| Sector verrouillé à `'credit'` uniquement | MVP focus, on a supprimé immobilier/esthétique |
| Checklist documents déterministe (pas LLM) | Latence < 1ms + 100% fiable |
| Auto-détection juridiction FR/CH par mots-clés | Permet d'adapter LAMAL/LPP en Suisse vs avis impo en France |
| Démo interactive avec 5 prospects mockés | Pas d'appel LLM, latence zéro, démo prévisible |
| Animation auto-play joue **une seule fois** (pas de loop) | L'utilisateur avait jugé la boucle bugguée |
| Selection prospect : fond gris clair + barre verticale gauche | Le fond noir initial rendait le texte illisible |
| Ton design : slate + emerald discret | Pas de "tech startup générique" — vise sobriété bancaire |
| Programme pilote "50 places" | Crée de la rareté honnête plutôt que faux compteurs |
| **Prix unifié 199 € / 199 CHF** | Lowering bar pour les 20 premiers cabinets pilotes. Le Suisse paie 5% de plus en réel — acceptable. |
| **Auto-détection source via domaine email** | Plus de forwarding manuel — courtier connecte Gmail et BankKey reconnaît Empruntis, SeLoger, Pretto via @domaine |
| **Filtre strict "default reject"** | Vercel, LinkedIn, Disney+ etc. étaient laissés passer. Maintenant on rejette par défaut, on accepte sur signal explicite. |
| **BankKey = hub des prospects, pas seulement qualif email** | Création manuelle ajoutée pour referrals, agences, téléphone — couverture complète des dossiers |
| **4 onglets sur fiche prospect** (Vue / Communication / Banques / Historique) | Évite l'empilement infini, navigation claire |
| **"Prospect" universel, "dossier" contextuel** | Cohérence terminologique sans rigidité — courtage parle des 2 |
| **/admin supprimée** | Prématurée à 0-1 cabinet, on la recréera quand on en aura 10+ |
| **Cron Gmail tous les jours 8h** | Le produit travaille sans clic — la sync manuelle reste pour debug |

## 5. Préférences utilisateur (Tim)

- **Langue** : français exclusivement
- **Profil** : Tim, 18 ans, homme, fondateur solo de BankKey
- **Niveau dev** : débutant — explications **ultra-détaillées**, commandes exactes, chemins absolus
- **Workflow** : Tim montre les erreurs Vercel/Supabase brutes → je diagnostique et corrige
- **Style** : préfère des plans clairs avec ordre de priorité
- **Décisions** : me laisse souvent carte blanche ("fais ce qui te parait le mieux") — j'exécute et je documente
- **Ne pas** : bouton "rejouer" cliché, emojis génériques type 🔗📊, animations trop rapides, fonds noirs sur sélection

## 6. Comptes & ressources externes

- **GitHub** : github.com/timhsg/bankkey
- **Vercel** : vercel.com/timhsg/bankkey (déploiement auto sur push main)
- **Supabase** : projet `pffnjqylzdxnytbyorhk` (EU Francfort)
- **Anthropic** : compte de Tim (clé API rotée après une fuite chat le 7 juin 2026)
- **Domaine** : bankkey.ch
- **Email** : pas encore configuré (support@bankkey.ch, dpo@bankkey.ch sont mentionnés mais pas créés)

## 7. Statut actuel (mettre à jour à chaque session)

### 🆕 Livré le 10 juin 2026

**Refonte visuelle complète**
- Logo : composant `LogoMark` réutilisable (clé géométrique navy, plus de "BK" texte)
- Typo : Fraunces sur les H1/H2 (serif distinctive), Inter sur le corps
- Couleur brand : navy `#1e3a8a` (vs noir slate-900 avant)
- Textes : passe sans em-dash, sans marketing-IA — sur landing, login, security, FAQ
- 13 instances "BK" remplacées sur tout le site

**Compte démo `/demo/access` + seed enrichi**
- Page publique avec identifiants `demo@bankkey.ch / DemoBankKey2026`
- Bouton "Copier" sur les credentials
- Liste de 10 sections à explorer
- Seed Supabase v2 (`supabase/seed-demo-reset.sql`) : profil cabinet 7 mois,
  90 prospects (10 récents détaillés + 80 historiques),
  25 emails filtrés (spam, perso, promo, notifications),
  50 décisions bancaires sur 6 mois avec rate_pct + commissions JSONB,
  sources variées (Empruntis, Pretto, SeLoger, Meilleurtaux, web_form, forwarding, whatsapp),
  bank_submitted JSONB sur ~35 prospects pour alimenter `/pro/banks` kanban
- Reset nocturne via pg_cron (`supabase/setup-cron.sql`)

**Auth & inscription**
- Login page brandée 2 colonnes (navy panel + form blanc)
- `signInWithOAuth({ provider: 'google' })` via Supabase
- Callback `/auth/callback` qui détecte nouveau vs existant
- Page d'aide pour brander écran consentement Google (à faire côté Tim)

**Outreach & demo playbook**
- OUTREACH-2026.md : refonte phone-first + plan 7 jours + 50 cibles
- DEMO-PLAYBOOK.md : carte "fondateur transparent" intégrée partout
- Section §11 "20 cabinets fondateurs" dans tous les scripts

**Features pro app**
- `/api/ingest/email` : webhook Resend Inbound pour ingestion par email forward
- `/pro/filtered` : page emails écartés + bouton Restaurer
- Modale `EditQualificationModal` : "Corriger" sur fiche prospect
- Export CSV sur /pro/prospects (BOM UTF-8)
- Créneaux dynamiques `/book` (10 prochains ouvrés, exclut passés)
- Admin v2 enrichie : MRR/ARR/commissions, top 5 actifs, AdminTable interactive
- Pricing scoring `/pro/settings` : sliders indépendants + normalisation au save

**Polish & SEO**
- robots.ts, sitemap.ts, not-found.tsx, error.tsx
- icon.svg + apple-icon.svg (clé navy)
- metadataBase + Open Graph
- Mot de passe oublié (`?mode=reset`)

### ✅ Livré (état au 8 juin 2026)

**Landing & marketing**
- Landing complète : hero avec mockup produit, ROI calc, comparison, "Pour qui" (sans fakes), Security, Pricing 199€, FAQ, Footer
- Démo unifiée `/demo` + `/demo/manual` (toggle commun en haut)
- `/book` réservation démo avec sauvegarde Supabase
- `/security`, `/privacy`, `/terms` (pour Google OAuth verification)

**Pro application**
- Sidebar permanente avec : Aujourd'hui · Prospects · Banques · Bilan · Statistiques · Sources · Mon profil · Abonnement
- `/pro` Aujourd'hui (top 3 prioritaires, stats du jour)
- `/pro/prospects` liste complète avec filtres + recherche + tri + bouton "Ajouter un prospect"
- `/pro/prospects/new` création manuelle (8 sources : referral, agence, téléphone, etc.)
- `/pro/leads/[id]` fiche en **4 onglets propres** : Vue d'ensemble / Communication / Banques / Historique
- `/pro/banks` suivi banques en kanban (En attente / Contre-offre / Accordé / Refusé)
- `/pro/bilan` bilan mensuel (this month vs previous, sources, banques) — base future de l'email digest
- `/pro/statistiques` insights avec carte complétude gamifiée (tiers Démarrage → Mémoire complète)
- `/pro/sources` 11 canaux (Gmail live, Outlook beta, IMAP Q3, webhook, etc.) + auto-détection source
- `/pro/settings` mémoire courtier + scoring weights customisables (curseurs additionnant à 100)
- `/pro/billing` abonnement Stripe (essai 30j → Pro 199€)
- `/pro/onboarding` wizard 4 étapes + création d'un prospect démo Camille Martin

**Intelligence**
- Filtre strict "default reject" : rejette Vercel, LinkedIn, Disney+, Slack, etc.
- Auto-détection source via domaine email (Empruntis, SeLoger, Pretto…)
- 4 agents IA : relevance (Haiku) → qualification (Haiku) → scoring (Haiku) → prospection (Sonnet)
- Activity log JSONB par prospect (chronologique)
- Outcome tracking : modal auto qui demande taux/conditions quand banque accordée
- Document checklist déterministe FR/CH

**Communication**
- Email response éditable dans l'onglet Communication
- Envoi direct via Gmail OAuth (pas de copier-coller)
- Toasts feedback (succès / erreur)
- Activity log automatique des envois

**Auto-sync**
- Cron Vercel `/api/cron/sync-gmail` tous les jours à 8h UTC
- Synchro manuelle reste disponible (bouton "Synchroniser" sur /pro/sources et /pro/prospects)

### 🟡 En attente (besoin input Tim)
- **Vercel env vars** : `STRIPE_PRICE_ID_PRO` doit être à jour (`price_1TfyJw0reUrQKljH2Z3oIAKX`)
- **Vercel cron** : sera activé automatiquement au prochain deploy (vercel.json présent)
- **CRON_SECRET** sur Vercel (optionnel mais recommandé pour sécuriser la route cron)
- **Resend** : pour envoi automatique du bilan mensuel par email (pas encore intégré)
- **Outlook OAuth** : Azure app registration à créer si on veut le supporter

### 🔮 Roadmap proche
1. **Email bilan mensuel automatique** via Resend (page /pro/bilan déjà prête)
2. **Outlook OAuth** (Azure setup + Microsoft Graph API)
3. **Webhook API ingest** pour brokers avec CRM custom
4. **Mobile pass** complet (responsivité fine)
5. **Activity log → table dédiée** (passer de JSONB array à table propre pour scaling)
6. **Recréer /admin** quand on aura 10+ cabinets pour suivi MRR/churn
7. **Google OAuth verification** (4-6 semaines de process)

## 8. Migrations SQL à appliquer manuellement

L'utilisateur applique les SQL sur Supabase Dashboard → SQL Editor.

**Statut des migrations** :
- `001_initial.sql` ✅ — profiles + prospects + RLS + trigger
- `002_credit_mvp.sql` ✅ — sector='credit' contrainte + colonnes documents
- `003_demo_bookings.sql` ✅ — table réservations démo
- `004_broker_memory.sql` ✅ — colonne JSONB broker_memory
- `005_subscriptions.sql` ✅ — colonnes Stripe sur profiles + trial_ends_at
- `006_relevance_sources.sql` ✅ — colonne relevance JSONB + forwarding_address
- `007_detected_source.sql` ✅ — colonne detected_source JSONB
- `008_activity_admin.sql` ✅ — activity JSONB + is_admin flag
- `009_outcomes.sql` ✅ — table deal_outcomes pour le data moat

**Toujours fournir le SQL inline en chat avec le lien direct vers le SQL editor**, pas juste référencer un fichier — Tim n'arrive pas toujours à les trouver dans Finder.

## 9. Bugs connus / à surveiller

- Si Vercel build échoue : vérifier `npx tsc --noEmit` localement avant push
- Le `<` dans du JSX text doit être `&lt;` (problème historique)
- Le défaut `'immobilier'` partout doit être `'credit'` (problème historique récurrent)
- Quand on ajoute des champs à `QualificationResult`, mettre `max_tokens: 2048` minimum

## 10. Comment je dois travailler

1. **Lire ce fichier** au début de chaque session pour reprendre le contexte
2. **Mettre à jour la section 7 (Statut actuel)** après chaque livraison
3. **Documenter les nouvelles décisions** dans la section 4
4. **Toujours typer-check** avant de push (`npx tsc --noEmit`)
5. **Build vérification** avant push si changement majeur (`npm run build`)
6. **Ne pas créer de fichiers MD** sauf demande explicite — sauf ce CLAUDE.md
