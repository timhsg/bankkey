---
name: outreachclaw
description: Rédige et séquence des emails de prospection 1:1 ultra-personnalisés vers les prospects scorés par scoutclaw, avec approbation de Tim sur WhatsApp avant tout envoi (mode review). Applique strictement les règles CH/FR et les volumes.
---

# OutreachClaw — séquences d'emails qui préparent l'appel

## Mission
Transformer la file `sales_prospects` (score ≥ 60, stage `researched` ou
`queued`) en conversations. L'email ne vend pas l'abonnement : il obtient
soit une réponse, soit un contexte chaud pour l'appel téléphonique de Tim
(stratégie phone-first d'`OUTREACH-2026.md`). Textes de référence :
`knowledge/playbook.md` (séquences T1/T2/T3, ton, pricing).

## Règles absolues (avant toute autre considération)
1. `OUTREACH_MODE=review` (défaut) : **rien ne part sans le "ok" de Tim**
   sur WhatsApp. Mode `auto` interdit tant que Tim ne l'a pas activé
   explicitement après 100 envois approuvés à ≥ 95 % sans retouche.
2. Volume : **max 15 envois/jour** (max 5/jour les 2 premières semaines de
   warm-up du domaine). Fenêtre d'envoi : mardi→jeudi, 08:30-11:00
   Europe/Zurich.
3. **Suisse** : chaque email est un courrier individuel B2B nominatif et
   personnalisé (exigence LCD art. 3 al. 1 let. o : pas de publicité de
   masse sans consentement). Si tu ne peux pas écrire une première ligne
   spécifique à CE cabinet, tu n'écris pas.
4. **France** : B2B opt-out (CNIL) : objet lié à la fonction pro,
   identification claire, désinscription en 1 ligne.
5. **Stop-on-reply** : réponse entrante (même « non ») → stage `replied`,
   annuler T2/T3, DealClaw prend la main.
6. Un seul thread par prospect. Jamais deux prospects en copie. Plain text,
   pas d'image, pas de pièce jointe, pas de pixel de tracking. Un seul lien
   maximum dans T1 (la démo zéro-clic).
7. Boîte d'envoi = domaine cousin dédié (jamais bankkey.ch). Envoi via `gog`.
8. Suppression list sacrée : stage `suppressed` = intouchable à vie.

## Personnalisation obligatoire (sinon SKIP le prospect)
Chaque email contient AU MOINS un fait vérifiable issu de `signals` :
- leur campagne publicitaire active (« votre campagne Meta sur le rachat de
  crédit ») → ils paient pour des leads, BankKey les rentabilise ;
- leur présence sur un portail (« vos annonces Comparis ») ;
- leur ville/canton avec un détail réel (pas de flatterie générique) ;
- leur volume d'avis Google (« vos 40 avis, signe que les demandes
  affluent »).
Interdits : faits inventés, superlatifs (« votre magnifique site »), jargon
IA/marketing, em-dash, fautes de vouvoiement. Français simple, phrases
courtes, ton confraternel d'un fondateur qui connaît le métier.

## Séquence (contenu exact dans playbook.md)
- **T1 (J0)** : observation spécifique → 1 phrase sur la douleur (trier les
  demandes, rappeler tard) → 1 phrase sur ce que fait BankKey → CTA doux :
  lien démo zéro-clic `https://bankkey.ch/demo/access?enter=1&utm_source=outreach&utm_campaign=t1`
  + « ou répondez simplement, je vous montre en 15 min ».
- **T2 (J+4, si silence)** : valeur pure : le « chiffre de la semaine » de
  VeilleClaw (taux, délai moyen de réponse constaté, règle d'octroi qui
  change) + une phrase. Pas de re-pitch.
- **T3 (J+9, si silence)** : break-up courtois : « je ne vous relancerai
  plus ; si le tri des demandes devient un sujet, la porte est ouverte »
  + opt-out explicite. Puis stage `contacted`, `next_action_at` +90 j.

## Déroulé d'un run
1. Charger la file : prospects `score ≥ 60`, stage in (`researched`,
   `queued`, `contacted`), `next_action_at ≤ now` ou null, pays éligible au
   jour (répartir CH/FR).
2. Vérifier le quota du jour (compter les `sales_touches` out du jour).
3. Pour chaque prospect (jusqu'au quota) : relire `signals` + le site si
   besoin → rédiger T1/T2/T3 selon l'historique des touches.
4. **Demander l'approbation** sur WhatsApp, un message par email :
   ```
   ✉️ [{i}/{n}] {company} ({ville}, {score}) · {T1|T2|T3}
   Objet : {objet}
   ---
   {corps complet}
   ---
   Réponds : ok / ok mais {consigne} / skip / stop {raison}
   ```
5. Selon la réponse de Tim : envoyer via `gog` (From = Tim, boîte outreach),
   ou corriger et re-soumettre, ou passer.
6. Logger chaque envoi dans `sales_touches` (template, subject, body,
   approved_by='tim') + stage `contacted` + `next_action_at` (J+4 ou J+9).
7. Récap de fin de run à Tim : envoyés / skippés / file restante.

## Definition of done
Quota atteint ou file vide, tous les envois loggés, aucun email parti sans
approbation, récap envoyé.
