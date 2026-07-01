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

**Tarifs (grille 3 paliers, décidée le 01/07/2026)** — EUR = CHF affiché :
- **Solo** 249 €/mois — 1 courtier, ~60 leads/mois.
- **Cabinet** 449 €/mois — leads illimités, jusqu'à 5 courtiers, scoring sur-mesure, support prioritaire.
- **Réseau** sur devis (dès ~890 €) — multi-agences, API.
- **Annuel** : 2 mois offerts (= 10 mois payés). **Fondateurs (20 premiers)** : 3 mois offerts (via coupon Stripe).
- Essai standard 30 jours sans carte.
- ⚠️ Stripe : créer 4 Price (Solo/Cabinet × mensuel/annuel) + coupon « FONDATEUR » 3 mois → variables
  `STRIPE_PRICE_SOLO_MONTH/YEAR`, `STRIPE_PRICE_CABINET_MONTH/YEAR` sur Vercel. `STRIPE_PRICE_ID_PRO`
  reste le fallback. Source de vérité prix : `lib/currency.ts` (`PLAN_PRICING`).
- Ancien : 199€ (`price_1TfyJw…`), 349€ archivé (`price_1TffPa…`).
- **Resend** (emails transactionnels + digest mensuel) : compte créé, clé API dans `.env.local` (jamais dans ce fichier — il est commité). ⚠️ L'ancienne clé a fuité dans l'historique git le 11/06/2026 et doit être révoquée + régénérée sur resend.com/api-keys. Domaine `bankkey.ch` à vérifier via DNS pour envoyer depuis @bankkey.ch.
- **Sentry** : setup en cours par Tim (compte gratuit Developer + projet Next.js)

## 2. Stack technique

| Couche | Tech | Notes |
|--------|------|-------|
| Frontend | Next.js 14 (App Router) + Tailwind + Inter font | Vercel deploy auto sur push main |
| Auth | Supabase Auth (email+password) | RLS strict par cabinet |
| DB | Supabase PostgreSQL | Hébergé EU (Francfort) |
| IA | Claude (Anthropic) | claude-haiku-4-5 (qualif+score), claude-sonnet-4-5 (prospection) |
| Email | Gmail OAuth pour ingestion + envoi | Resend pour transactionnels (intégré, activable via clés env) |
| Paiement | Stripe | Configuré : checkout + webhook signé + portail abonnement |
| Domaine | bankkey.ch | Vercel DNS configuré |
| Crons | GitHub Actions (.github/workflows/cron.yml) | Sync Gmail /5 min, brief 8h15, digest mensuel — PAS Vercel cron |

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

### 🆕 Livré le 1er juillet 2026 — Outlook en prod + synchro zéro-clic

**Outlook activé en production**
- App Azure « BankKey » créée (multitenant + comptes Microsoft perso), redirect
  `https://bankkey.ch/api/outlook/callback`, permissions Graph déléguées
  (Mail.Read, Mail.Send, offline_access, openid, email, User.Read), client secret 24 mois.
- `MICROSOFT_CLIENT_ID` = `8221934b-9c24-4c23-9a65-13ecb72b3b1d` (secret dans Vercel).
- ✅ Confirmé par Tim : la connexion Outlook fonctionne.

**Synchro automatique « zéro bouton »**
- Première synchro AUTO déclenchée dès la connexion d'une boîte (Gmail → `/pro`,
  Outlook/IMAP → `/pro/sources`, via `?connected=`). Plus besoin d'« actualiser ».
- Récap des mécanismes auto : Gmail = push Pub/Sub temps réel + cron 5 min ;
  Outlook/IMAP = cron 5 min ; webhook/Zapier = temps réel à la réception.
- ⚠️ Dépendance : le cron GitHub Actions doit tourner (secret `CRON_SECRET` présent
  côté GitHub **et** Vercel). À vérifier dans l'onglet Actions du repo.
- 🔭 Outlook temps réel (Microsoft Graph change notifications) = amélioration future ;
  le cron 5 min suffit pour le pilote.

**Modèle IA**
- `prospection.ts` : `claude-sonnet-4-5` → `claude-sonnet-4-6` (évite une panne de
  dépréciation ; les agents qualif/scoring/relevance restent en `claude-haiku-4-5`).

**Pricing refondu (grille 3 paliers)**
- `lib/currency.ts` : `PLAN_PRICING` (Solo 249 / Cabinet 449, EUR=CHF) + helpers mensuel/annuel.
  `getDisplayPrice('pro')` renvoie désormais 249 (compat billing/ROI). Ancien 199 supprimé.
- Landing : nouveau composant `app/_components/PricingTiers.tsx` (grille Solo/Cabinet/Réseau,
  devise dynamique, toggle mensuel/annuel −2 mois, bandeau fondateurs 3 mois). Remplace la
  carte unique inline dans `page.tsx`. (Ancien `PricingSection.tsx` = code mort, non importé.)
- `lib/stripe.ts` : `resolveStripePrice(plan, interval)` → env `STRIPE_PRICE_{SOLO,CABINET}_{MONTH,YEAR}`,
  fallback `STRIPE_PRICE_ID_PRO`. `/api/checkout` accepte `{plan, interval}` (défaut solo/mensuel).
- CGU mises à jour (3 paliers + annuel). ⚠️ Reste à faire côté Tim : créer les 4 Price + coupon
  fondateur dans Stripe, poser les 4 variables sur Vercel.

**Chiffrement des secrets en base (lib/crypto.ts)**
- AES-256-GCM, clé dans `BANKKEY_ENC_KEY` (Vercel). Chiffre tokens Gmail/Outlook
  (access+refresh) + `imap_password` à chaque écriture, déchiffre à chaque lecture.
- 2 garde-fous anti-casse : **no-op si la clé absente** (déploiement neutre), et
  **tolérance legacy clair** (decryptSecret renvoie tel quel une valeur non préfixée
  `enc:v1:`). Round-trip testé (y compris tokens avec `:` `/` `+`).
- Activation : poser `BANKKEY_ENC_KEY` (= `openssl rand -base64 32`) sur Vercel + redeploy.
  Les tokens Gmail/Outlook se chiffrent au 1er refresh (~1 h). L'`imap_password` ne se
  rafraîchit pas → reconnecter la boîte IMAP une fois, ou backfill manuel.
- ⚠️ NE JAMAIS changer/supprimer la clé après activation (secrets chiffrés = illisibles).
- Touché : lib/crypto.ts (neuf) + gmail/callback, outlook/callback, imap/connect,
  gmail/reply, gmail/process, cron/renew-gmail-watch.

**Audit complet du site (page/lien/texte)**
- 🔴 Pages Sécurité + Confidentialité affirmaient « Tokens OAuth chiffrés via Supabase
  Vault » → **FAUX** (tokens en clair). Reformulé honnêtement (lecture seule, révocable,
  isolation RLS, chiffrement infra au repos). Risque crédibilité/juridique évité.
  ⚠️ Le vrai chiffrement colonne (tokens + imap_password) reste à implémenter — à faire
  avec Tim qui pourra tester (trop risqué à l'aveugle, casse la synchro si raté).
- Onboarding : ajout du bouton **Connecter Outlook** (avant : Gmail seul) + libellés
  généralisés (« boîte mail » au lieu de « Gmail »).
- `EMAIL_FROM` Resend : `hello@` → `contact@bankkey.ch` (cohérence des adresses).
- Vérifié : 0 lien mort, prix 199 cohérents partout, nav sidebar OK, pas de TODO/lorem,
  pas de placeholder légal. Landing déjà cohérente (Outlook, sources, « < 5 min »).
- 🔭 À signaler : `/pro/sources` et `/pro/integrations` se chevauchent (mailboxes+webhook
  vs site/CSV/email) → envisager de fusionner pour éviter la confusion. Mentions légales
  (éditeur/hébergeur) absentes des CGU — à ajouter quand l'entité juridique existe.

**À faire côté Tim (Gmail temps réel)** : config Pub/Sub sur le projet `bankkey-gmail`
(topic `gmail-leads`, rôle Publisher à `gmail-api-push@system.gserviceaccount.com`,
souscription push vers `/api/gmail/push?token=…`) + variables `GMAIL_PUBSUB_TOPIC`
et `GMAIL_PUSH_TOKEN` sur Vercel.

### 🆕 Livré le 30 juin 2026 — synchro multi-sources + Outlook réparé

**Outlook : 2 bugs critiques corrigés + activation**
- 🔴 Token Outlook jamais rafraîchi → la synchro mourait ~1h après connexion
  (même classe de bug que Gmail). Fix : `getValidOutlookToken()` dans `lib/outlook.ts`
  (refresh + persistance `outlook_access_token`/`outlook_refresh_token`/`outlook_token_expiry`).
- 🔴 Un courtier **Outlook-only** n'était jamais synchronisé : le cron `sync-gmail`
  ne sélectionnait que les profils Gmail. Le cron interroge maintenant Gmail + Outlook + IMAP.
- `outlook_last_processed_at` ajouté (migration 014) + affiché dans `/pro/sources`.
- ⚠️ Reste à faire côté Tim : créer l'app Azure + `MICROSOFT_CLIENT_ID`/`MICROSOFT_CLIENT_SECRET`
  sur Vercel (sans ça, le bouton Outlook renvoie `outlook_not_configured`).

**Nouvelle source : IMAP (Yahoo, iCloud, OVH, Infomaniak, custom)**
- `lib/imap.ts` (imapflow + mailparser, imports dynamiques) : `withImap()`, `testImapConnection()`.
- `POST/DELETE /api/imap/connect` (teste la connexion avant d'enregistrer).
- Intégré au pipeline `process` + cron, marquage `\Seen` sur une connexion unique.
- Formulaire de connexion dans `/pro/sources` (presets + mot de passe d'app).
- Migration 015. ⚠️ `imap_password` en clair (comme tokens Gmail) → à chiffrer plus tard.
- Nouvelle dépendance : `npm install` requis (imapflow, mailparser, @types/mailparser).

**Webhook / API exposé (Zapier, Make, CRM)**
- `/pro/sources` affiche l'URL `/api/ingest/<ingest_key>` + doc Zapier/Make + exemple cURL.
  (Le backend `/api/ingest/[key]` existait déjà ; on le rend visible et utilisable.)

**Détection de sources étendue (`lib/sources/detection.ts` + icons)**
- FR : CAFPI, Vousfinancer, La Centrale de Financement, Ymanci, Cyberprêt, ACE Crédit, Logic-Immo, PAP.
- CH : Homegate, ImmoScout24.ch, Comparis, MoneyPark, Hypotheke.ch, Newhome, RealAdvisor.

**Gmail temps réel** : code déjà en place (watch + Pub/Sub + `/api/gmail/push`). Reste la
config Google Cloud (`GMAIL_PUBSUB_TOPIC`, `GMAIL_PUSH_TOKEN`) — procédure fournie à Tim.

> ✅ Vérifié : esbuild OK sur les 8 fichiers touchés. À lancer côté Mac : `npm install`
> puis `npx tsc --noEmit` et `npm run build` avant push.

### 🆕 Livré le 27 juin 2026 — audit complet + corrections

**Bug Gmail corrigé (important)**
- Cause : `lib/gmail.ts` faisait `setCredentials({ access_token, refresh_token })` SANS
  `expiry_date` et ne persistait jamais le token rafraîchi → la connexion Gmail
  marchait ~1h puis tombait en panne (token expiré, jamais rafraîchi).
- Fix : nouvel `authedClient()` + interface `GmailCredentials` (expiry_date + callback
  `onRefresh` qui réécrit `gmail_access_token`/`gmail_token_expiry` en base).
  Routes mises à jour : gmail/callback, gmail/process, gmail/reply.

**Sécurité & config**
- `/api/ingest/email` : fail-closed en production si `WEBHOOK_INBOUND_SECRET` absent (503).
- `.env.local.example` : complété (21 variables réelles documentées, avec [REQUIS]/[OPTIONNEL]).
- Migration dupliquée `010_welcome_email.sql` → renommée `013_welcome_email.sql`.
- Cron Gmail resserré de 15 → 5 min (en attendant une ingestion push temps réel).

**À traiter (cf. REVIEW.md à la racine)**
- 🔴 Promesse "< 5 min" vs cron GitHub (non temps réel) → passer à Gmail push / Resend inbound.
- 🟠 Rate-limit in-memory inefficace en serverless → Upstash/Vercel KV.
- 🟠 Tokens Gmail stockés en clair → envisager chiffrement colonne.
- 🟠 Vérifier les IDs de modèles (`claude-sonnet-4-5`) avant dépréciation.

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
- `010_outlook.sql` ⏳ — colonnes Outlook (à appliquer)
- `011_webhook_ingest.sql` ⏳ — ingest_key + ingest_metadata (à appliquer)
- `012_hot_lead_notifications.sql` ⏳ — (à vérifier/appliquer)
- `013_welcome_email.sql` ⏳ — (à vérifier/appliquer)
- `014_outlook_last_processed.sql` ⏳ — outlook_last_processed_at (30/06)
- `015_imap.sql` ⏳ — colonnes IMAP host/port/secure/user/password/email/last_processed (30/06)

**Toujours fournir le SQL inline en chat avec le lien direct vers le SQL editor**, pas juste référencer un fichier — Tim n'arrive pas toujours à les trouver dans Finder.

## 9. Bugs connus / à surveiller

- Si Vercel build échoue : vérifier `npx tsc --noEmit` localement avant push
- Le `<` dans du JSX text doit être `&lt;` (problème historique)
- Le défaut `'immobilier'` partout doit être `'credit'` (problème historique récurrent)
- Quand on ajoute des champs à `QualificationResult`, mettre `max_tokens: 2048` minimum
- **Gmail/OAuth** : toujours passer par `authedClient()` de `lib/gmail.ts` (expiry + persistance).
  Ne JAMAIS refaire un `setCredentials` brut sans `expiry_date` → re-casserait la synchro après 1h.

## 10. Comment je dois travailler

1. **Lire ce fichier** au début de chaque session pour reprendre le contexte
2. **Mettre à jour la section 7 (Statut actuel)** après chaque livraison
3. **Documenter les nouvelles décisions** dans la section 4
4. **Toujours typer-check** avant de push (`npx tsc --noEmit`)
5. **Build vérification** avant push si changement majeur (`npm run build`)
6. **Ne pas créer de fichiers MD** sauf demande explicite — sauf ce CLAUDE.md
