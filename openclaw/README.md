# OpenClaw × BankKey — Système d'acquisition multi-agents

> Blueprints versionnés dans le repo. Pour exécuter : copier `skills/` vers
> `~/.openclaw/workspace/skills/` sur la machine qui fait tourner OpenClaw
> (VPS ou Mac allumé en permanence), et `knowledge/` vers
> `~/.openclaw/workspace/knowledge/`.

## 1. Vue d'ensemble

```
            ┌─────────────┐        ┌──────────────────┐        ┌────────────┐
  Sources   │  ScoutClaw  │  DB    │   OutreachClaw   │ emails │  DealClaw  │
  publiques →  recherche  → sales_ →  séquences 1:1   →  boîte →  copilote  → RDV / essai
  (ORIAS,   │  + scoring  │ prosp. │  personnalisées  │ dédiée │  réponses  │   30 jours
  Zefix…)   └─────────────┘        └──────────────────┘        └────────────┘
                   │                        │                        │
                   └────────── WhatsApp de Tim = console d'approbation ─────────┘
```

Trois agents, une base commune (`sales_prospects` + `sales_touches` dans le
Supabase existant, isolée de l'app par RLS), et **un principe non négociable** :
tout message sortant vers un prospect est approuvé par Tim sur WhatsApp
(mode `review`). L'automatisation porte sur la recherche, la mémoire, le
timing et la rédaction, pas sur la signature.

## 2. Prérequis

| Élément | Détail |
|---|---|
| Machine | VPS 4 €/mois (Hetzner CX22) ou Mac qui ne dort pas |
| OpenClaw | installé + onboarding fait, canal **WhatsApp** relié au numéro de Tim |
| Boîte d'envoi | Google Workspace sur un **domaine cousin** (ex. `bankkey-app.com`), jamais `bankkey.ch` |
| DNS boîte d'envoi | SPF + DKIM + DMARC (`p=quarantine`) posés, warm-up 2-3 semaines (5→15 emails/j) |
| CLI Gmail | `gog` (ou équivalent) authentifié sur la boîte d'envoi |
| Variables | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `OUTREACH_MODE=review` |
| SQL | exécuter `sql/sales_crm.sql` dans Supabase → SQL Editor |

Pourquoi un domaine cousin : si un email froid tombe en spamtrap, c'est la
réputation du domaine d'envoi qui brûle. `bankkey.ch` porte les emails
transactionnels du produit, il ne doit jamais porter la prospection.

## 3. Cron (fuseau Europe/Zurich)

La demande initiale était « tous les 4 jours à 8h ». En cron, `0 8 */4 * *`
dérive à chaque changement de mois (le compteur repart au 1er). Plus fiable
et plus régulier : **lundi + jeudi**.

```jsonc
// Extrait openclaw.json — adapter à la syntaxe exacte de ta version
// (vérifier avec `openclaw cron --help` : les clés peuvent différer).
{
  "cron": {
    "jobs": [
      { "name": "scoutclaw",    "schedule": "0 8 * * 1,4",      "tz": "Europe/Zurich",
        "prompt": "Exécute la skill scoutclaw de bout en bout.", "session": "isolated" },
      { "name": "outreachclaw", "schedule": "30 8 * * 2,3,4",   "tz": "Europe/Zurich",
        "prompt": "Exécute la skill outreachclaw.",              "session": "isolated" },
      { "name": "dealclaw",     "schedule": "*/10 8-19 * * 1-5", "tz": "Europe/Zurich",
        "prompt": "Exécute la skill dealclaw.",                  "session": "isolated" }
    ]
  }
}
```

- ScoutClaw : lun + jeu 08:00 (recherche, jamais d'envoi).
- OutreachClaw : mar→jeu 08:30 (meilleure fenêtre B2B ; jamais lundi matin ni vendredi).
- DealClaw : toutes les 10 min en heures ouvrées (une réponse chaude attend < 10 min).

## 4. Garde-fous (résumé opérationnel, détail dans knowledge/playbook.md)

1. **Suisse (LCD art. 3 al. 1 let. o + nLPD)** : pas d'envoi de masse sans
   consentement. Chaque email CH doit être un courrier individuel, nominatif,
   personnalisé, avec identité complète de l'expéditeur et opt-out. Volume
   faible par construction.
2. **France (règles CNIL B2B)** : prospection B2B licite en opt-out si le
   message concerne la fonction professionnelle + désinscription simple.
3. **Sources de données** : registres et pages publiques uniquement
   (ORIAS open data, Zefix, annuaires, Meta Ad Library, Google Ads
   Transparency, sites des cabinets). **Interdit** : scraping automatisé de
   LinkedIn ou de Google Maps en headless (violation des CGU, comptes bannis) ;
   LinkedIn reste un outil manuel pour Tim, l'agent peut traiter un export
   manuel fourni par Tim.
4. **Volumes** : max 15 envois/jour (5/jour les 2 premières semaines),
   max 30 nouveaux prospects par run ScoutClaw. Le marché romand est petit :
   un marché brûlé ne se répare pas.
5. **Stop-on-reply** : toute réponse (même négative) stoppe la séquence,
   immédiatement et définitivement.
6. **Transparence** : jamais prétendre être humain si la question est posée.
   Les emails signés « Tim » sont approuvés par Tim : c'est sa parole.
7. **Pas de tracking pixel** : on mesure les réponses et les RDV, pas les
   ouvertures. (Meilleure délivrabilité, meilleure posture pour un produit
   qui vend la confiance.)
8. **Pricing verrouillé** : aucune remise hors grille (essai 30 j, annuel
   −2 mois, fondateurs 3 mois). Toute demande hors cadre → escalade à Tim.

## 5. Ordre de build recommandé (1 brique par semaine)

1. **Semaine 1 — ScoutClaw seul.** Il remplit `sales_prospects`, Tim reçoit
   le top 10 sur WhatsApp. Zéro risque, ça alimente déjà le plan phone-first
   d'`OUTREACH-2026.md` (l'agent fabrique la liste d'appels que le doc
   demandait de faire à la main en 4 h).
2. **Semaine 2 — OutreachClaw en mode review.** L'email prépare l'appel
   (le doc outreach le dit : le téléphone convertit, le mail réchauffe).
   Tim approuve chaque envoi en 1 tap.
3. **Semaine 3 — DealClaw copilote.** Classification + brouillons + alertes
   lead chaud. Tim ne rédige plus, il valide.
4. **Ensuite seulement** : envisager `OUTREACH_MODE=auto` pour T2/T3
   (relances), si ≥ 95 % des brouillons partent sans retouche sur 100 envois.

## 6. Les 2 agents bonus (forte valeur, à brancher après)

### PulseClaw — activation & conversion des essais (le plus rentable de tous)
Surveille le Supabase produit (service key, lecture seule) : nouveaux comptes,
boîte connectée ou non, premier lead scoré, dernière activité, J-x avant fin
d'essai. Alerte WhatsApp (« Cabinet X : essai J12, Gmail jamais connecté ») +
brouillon d'email de relance ciblé. **Pourquoi c'est stratégique** : avec un
essai 30 jours sans carte, le vrai tunnel de revenu c'est essai→payant, pas
cold→réponse. Un cabinet qui connecte sa boîte en semaine 1 se convertit ;
un cabinet qui ne la connecte pas churn silencieusement. Personne ne fait ce
suivi aujourd'hui.

### VeilleClaw — vigie taux & règles d'octroi CH/FR
Chaque semaine : SARON et taux hypothécaires CH, OAT/taux d'usure FR,
changements réglementaires (FINMA, HCSF). Produit : (a) le « chiffre de la
semaine » injecté dans les emails T2 d'OutreachClaw (crédibilité d'expert),
(b) une proposition de diff sur `lib/agents/expertise.ts` quand une règle
change (ex. seuil travaux, taux d'usure), que Tim applique ou rejette.
**Pourquoi c'est stratégique** : ça nourrit à la fois la vente (emails qui
sonnent métier, pas marketing) et le produit (le scoring reste juste, ce qui
est LA promesse de BankKey). Un scoring périmé = churn assuré.

> Pourquoi pas le « document validator » suggéré : c'est une feature produit
> (la checklist déterministe la couvre en partie), pas un levier
> d'acquisition. À remettre dans la roadmap produit, pas dans OpenClaw.

## 7. Coûts de fonctionnement estimés

| Poste | Coût |
|---|---|
| VPS | ~4-6 €/mois |
| Domaine cousin | ~10 €/an |
| Google Workspace (boîte outreach) | ~7 €/mois |
| API Anthropic (3 agents, volumes ci-dessus) | ~10-30 €/mois |
| **Total** | **< 50 €/mois** pour un SDR qui ne dort jamais |
