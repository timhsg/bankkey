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

## 5. Préférences utilisateur (Sandra)

- **Langue** : français exclusivement
- **Niveau dev** : débutante — explications **ultra-détaillées**, commandes exactes, chemins absolus
- **Workflow** : Sandra montre les erreurs Vercel/Supabase brutes → je diagnostique et corrige
- **Style** : préfère des plans clairs avec ordre de priorité
- **Décisions** : me laisse souvent carte blanche ("fais ce qui te parait le mieux") — j'exécute et je documente
- **Ne pas** : bouton "rejouer" cliché, emojis génériques type 🔗📊, animations trop rapides, fonds noirs sur sélection

## 6. Comptes & ressources externes

- **GitHub** : github.com/timhsg/bankkey
- **Vercel** : vercel.com/timhsg/bankkey (déploiement auto sur push main)
- **Supabase** : projet `pffnjqylzdxnytbyorhk` (EU Francfort)
- **Anthropic** : compte de Sandra (clé API rotée après une fuite chat le 7 juin 2026)
- **Domaine** : bankkey.ch
- **Email** : pas encore configuré (support@bankkey.ch, dpo@bankkey.ch sont mentionnés mais pas créés)

## 7. Statut actuel (mettre à jour à chaque session)

### ✅ Livré
- Landing complète : hero, ROI calc, comparison table, testimonials, security teaser, pricing, FAQ, footer
- Démo interactive `/demo` avec 5 prospects, auto-play une fois, click pour explorer
- Démo textarea `/demo/manual` (vrai appel API)
- Page réservation démo `/book` avec sauvegarde Supabase
- Page sécurité complète `/security`
- Dashboard pro `/pro` avec stats + filtres
- Page détail prospect `/pro/leads/[id]` avec ClientCard + 3 onglets
- Qualification IA enrichie : revenus, apport, endettement, employment_status, is_couple
- Scoring crédit basé sur vrais critères bancaires
- Checklist documents auto-générée FR/CH

### 🟡 En attente (besoin input Sandra)
- **Stripe** : clés `pk_test_…` et `sk_test_…` à fournir
- **Crisp live chat** : Website ID à fournir (compte gratuit)
- **Cal.com sync** : lien calendrier (compte gratuit)
- **Migration SQL** : à appliquer manuellement sur Supabase Dashboard

### 🔮 Roadmap proche
1. Mémoire courtier (broker memory injectée dans prompts IA)
2. Stripe Pro 399 CHF/mois (paiement)
3. Gmail OAuth réel (ingestion production)
4. Lead magnet PDF "Guide courtier IA 2026"
5. Blog SEO

## 8. Migrations SQL à appliquer manuellement

L'utilisateur applique les SQL sur Supabase Dashboard → SQL Editor. À la dernière session :
- `001_initial.sql` — appliqué (probablement)
- `002_credit_mvp.sql` — fourni inline en chat, à confirmer
- `003_demo_bookings.sql` — fourni inline en chat, à confirmer

**Toujours fournir le SQL inline en chat avec le lien direct vers le SQL editor**, pas juste référencer un fichier — Sandra n'arrive pas toujours à les trouver dans Finder.

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
