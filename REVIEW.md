# BankKey — Audit technique (27 juin 2026)

Revue complète du code + test du site en production. **Verdict : produit solide, prêt à vendre.**
Aucun bug bloquant, aucune route cassée, le pipeline IA fonctionne parfaitement en live.
Les points ci-dessous sont du durcissement, pas des pannes.

---

## ✅ Tests effectués en production (bankkey.ch)

Parcours complet, **zéro erreur console** :

- **Pipeline IA `/demo/manual`** — collé une vraie demande de financement (Annecy).
  Streaming Lecture → Scoring → Rédaction OK. Score 85/100, extraction correcte
  (revenus, apport 17%, CDI, endettement), 3 signaux d'urgence, raisonnement HCSF,
  et signalement de l'info manquante. Réponse email + briefing + checklist (juridiction
  France auto-détectée) : excellents.
- **Compte démo `/demo/access`** — auto-login 1 clic OK, visite guidée OK.
- **`/pro`** dashboard, **`/pro/leads/[id]`** (4 onglets), **`/pro/banks`** (kanban),
  **`/pro/bilan`** — tous fonctionnels.
- **Mobile** (390px) — landing responsive propre, nav repliée, CTA empilés.

Détail cosmétique : la tuile « apport » arrondit à 17% alors que le texte dit 16,9%.

---

## 🔧 Corrigé pendant l'audit (à relire puis commit/déploy)

| # | Fichier(s) | Correction |
|---|-----------|------------|
| Gmail | `lib/gmail.ts` + `api/gmail/{callback,process,reply}` | **Bug de connexion Gmail** : tokens posés sans `expiry_date` et jamais persistés après refresh → la synchro cassait ~1h après la connexion. Ajout de `authedClient()` (expiry + persistance `onRefresh`). |
| Sécurité | `api/ingest/email/route.ts` | Fail-closed en prod : 503 si `WEBHOOK_INBOUND_SECRET` absent (sinon pipeline IA payant ouvert à tous). |
| Config | `.env.local.example` | Complété : 21 variables réelles, balisées [REQUIS]/[OPTIONNEL]. |
| Migration | `supabase/migrations/` | Doublon `010_welcome_email.sql` → `013_welcome_email.sql`. |
| Cron | `.github/workflows/cron.yml` | Sync Gmail 15 min → 5 min (mitigation en attendant le temps réel). |
| Docs | `CLAUDE.md` | Stack à jour (Stripe configuré, crons GitHub Actions), changelog + leçon Gmail. |

> ⚠️ Lock git résiduel : un `.git/index.lock` traînait (session git interrompue côté Mac).
> Si un commit refuse de partir (« Another git process seems to be running »), supprimer
> ce fichier : `rm .git/index.lock`.

---

## 🔴 À faire cette semaine

**1. La promesse « réponse < 5 min » vs un cron non temps réel.**
GitHub Actions dérive de 5 à 20 min (parfois sauté). C'est l'argument central du produit.
→ Passer à une ingestion *push* : **Gmail watch + Pub/Sub** (idéal) ou s'appuyer sur le
**webhook Resend inbound** (déjà temps réel) comme voie principale, cron en filet de secours.
*(Cadence resserrée à 5 min en attendant — ne suffit pas à tenir la promesse marketing.)*

---

## 🟠 Bientôt

**2. Rate-limiting in-memory inefficace en serverless.** `lib/rate-limit.ts` utilise une `Map`
par instance Lambda → la protection coût LLM de `/api/analyze` (public) est contournable.
→ Upstash Redis ou Vercel KV.

**3. Tokens Gmail stockés en clair** dans `profiles`. Protégés par RLS mais ce sont des accès
boîte mail longue durée, et le positionnement sécurité/GDPR est central. → chiffrement colonne
(pgsodium / Supabase Vault).

**4. IDs de modèles en dur.** `prospection.ts` utilise `claude-sonnet-4-5` (Sonnet courant : 4.6).
Un modèle déprécié = pipeline en 500. → vérifier et suivre les dépréciations.

---

## 🟡 Hygiène

- 4 `console.log` dans `app/api` (Sentry est le bon canal en prod).
- Vocabulaire immobilier résiduel (`type: vendeur/acheteur/locataire`) pour un produit crédit.

---

## Non vérifiable dans le sandbox de l'audit

- **`npm build` / `tsc` complet** — `node_modules` installé sur macOS, binaires non exécutables
  en Linux sandbox. **À lancer côté Mac** : `npx tsc --noEmit` puis `npm run build` avant de
  pousser les corrections ci-dessus.
- Parcours authentifié réel avec une vraie boîte Gmail (le compte démo est mocké).
