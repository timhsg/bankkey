# Outreach BankKey — Plan d'action concret

> Document actionnable : à utiliser tel quel cette semaine.
> Objectif Q2 2026 : signer 5 cabinets pilotes.

---

## 1. Cible précise : qui chercher

### Profil parfait (haute conversion)

- **Courtier crédit immobilier** (IOBSP en France, indépendant en Suisse)
- **1-5 personnes** dans le cabinet (les structures plus grosses ont déjà des CRMs lourds)
- **Activité depuis 1 à 8 ans** (moins ouverts si > 15 ans, pas de signal si < 1 an)
- **Présence LinkedIn active** (signe d'ouverture aux outils)
- **Site web propre** (signe d'investissement, peut intégrer notre widget)
- **Localisation** : Lyon, Bordeaux, Nantes, Toulouse, Genève, Lausanne (cabinets moyens), **éviter Paris** (saturé, cycles longs)

### Anti-cible (ne pas perdre de temps)

- Réseaux franchisés (Cafpi, Empruntis filiales) — décision centralisée
- > 20 personnes — cycle de vente trop long
- Pas de site web visible — signal qu'ils ne digitalisent pas
- Profil 100% "assurance" — leur crédit est accessoire

---

## 2. Sources concrètes pour trouver 50 cibles

### A. LinkedIn Sales Navigator (méthode #1 — recommandée)

**Essai gratuit 30 jours** : https://business.linkedin.com/sales-solutions/sales-navigator

Recherche avancée à coller :

```
Title: "courtier crédit immobilier" OR "courtière crédit immobilier" OR "broker crédit"
Country: France OR Switzerland
Industry: Financial Services
Company size: 1-10
Tenure at company: 1-5 years
```

**Filtres bonus** :
- Géographie : Lyon, Bordeaux, Nantes, Genève, Lausanne
- Posted on LinkedIn in last 30 days = TRUE (montre qu'ils sont actifs)

→ Sauver la recherche. Exporter en CSV via [Apollo](https://apollo.io) (gratuit 50 leads/mois) ou [Lemlist](https://www.lemlist.com).

### B. Google Maps (méthode #2 — pour ceux qui veulent éviter LinkedIn payant)

Recherche : `"courtier crédit immobilier" Lyon` (puis Bordeaux, Nantes, etc.)

Pour chaque résultat avec ≤ 10 employés :
- Visite site web → trouve le contact principal
- Note dans le tracker
- Cherche le profil LinkedIn de la personne via : `[Prénom] [Nom] "courtier" site:linkedin.com`

### C. ORIAS (France uniquement, base officielle IOBSP)

https://www.orias.fr/web/guest/search

Cherche par catégorie "IOBSP". Donne nom + adresse cabinet. Croise avec LinkedIn pour trouver les profils individuels.

### D. Empruntis Partenaires + Pretto Pro

Ces plateformes listent des courtiers partenaires :
- https://www.empruntis.com/courtier/trouver-courtier.php
- https://pretto.fr/pro

Sources gratuites pour récupérer nom + ville + spécialités.

---

## 3. Tracker Google Sheets — colonnes minimum

Créez un Google Sheet "BankKey Outreach 2026" avec ces colonnes :

| Colonne | Type | Exemples |
|---------|------|----------|
| Date ajout | Date | 8/6/2026 |
| Prénom | Texte | Marie |
| Nom | Texte | Lefèvre |
| Cabinet | Texte | Cabinet Lefèvre Courtage |
| Ville | Texte | Lyon |
| LinkedIn URL | Lien | linkedin.com/in/marie-lefevre |
| Email | Email | marie@lefevre-courtage.fr |
| Téléphone | Texte | 04 78 12 34 56 |
| Site web | Lien | lefevre-courtage.fr |
| Source du contact | Liste | LinkedIn Sales Nav / Google Maps / ORIAS / Pretto |
| Statut | Liste | À contacter / Contacté / Répondu / Démo bookée / Pilote signé / Refusé / Ghosted |
| Date dernier contact | Date | 10/6/2026 |
| Date prochain follow-up | Date | 14/6/2026 |
| Notes | Texte | Mention "perd des leads le weekend" dans son post LinkedIn |
| Email outreach utilisé | Liste | A / B / C |

**Tip Google Sheets** : conditional formatting sur la colonne "Statut" pour voir en rouge/vert/orange instantanément.

---

## 4. Templates LinkedIn DM — par ordre d'efficacité

### Template A — Le plus simple, le plus performant

> **Pas de pitch dans le 1er message.** Curiosité + crédibilité.

```
Bonjour [Prénom],

Je vois que vous êtes courtier crédit immobilier à [Ville]. Question rapide :
combien de leads recevez-vous par mois (Empruntis, SeLoger, direct), et combien
arrivez-vous à traiter sérieusement ?

Je développe BankKey, un outil qui qualifie ces leads automatiquement.
Je cherche à comprendre la réalité terrain avant de finaliser.

Merci,
Sandra — bankkey.ch
```

**Pourquoi ça marche** :
- Pas perçu comme commercial → taux de réponse 3x supérieur
- Question ouverte → ils aiment partager leur quotidien
- Crédibilité via le projet réel
- Pas d'engagement demandé

**Taux de réponse attendu** : 15-25%

### Template B — Si ils ont posté récemment

Cherchez leurs posts LinkedIn récents (clic sur leur profil → onglet Activity). Si ils parlent de :
- Gestion des leads → utilisez ce template
- Difficultés à qualifier → idem
- Outils tech → idem

```
Bonjour [Prénom],

J'ai vu votre post sur [sujet précis du post — "perdre des dossiers le weekend",
"trier 80 emails/jour", etc.]. C'est exactement le problème qu'on résout avec
BankKey : qualifier vos emails entrants en 60 secondes pour ne plus rater de
dossiers urgents.

Programme pilote ouvert, places limitées. Démo de 20 min sur vos vrais emails ?

Sandra — bankkey.ch
```

**Pourquoi** : personnalisation forte → ils sentent que vous les avez vraiment lus.

**Taux de réponse attendu** : 25-40%

### Template C — Direct mais pas commercial

```
Bonjour [Prénom],

Je lance BankKey : un outil qui lit vos emails Gmail/Outlook entrants, qualifie
chaque demande de financement en 60 secondes, score la bancabilité et rédige
votre réponse.

J'ouvre un programme pilote pour 20 cabinets en France et Suisse romande.
Tarif préférentiel à vie, accompagnement perso.

5 min en visio cette semaine pour voir si ça vous parle ?

Sandra — bankkey.ch
```

**Quand utiliser** : si A et B ne marchent pas après 2 essais.

**Taux de réponse attendu** : 8-15%

---

## 5. Email outreach (si pas répondu sur LinkedIn après 7 jours)

**Objet** : `[Prénom], j'ai vu votre profil de courtier crédit à [Ville]`

```
Bonjour [Prénom],

Je vous écris parce que [Cabinet] correspond au profil que je cherche pour le
programme pilote BankKey 2026.

Le problème : vous recevez probablement 40-80 leads par mois (Empruntis,
SeLoger, contacts directs). Vous passez 1 à 2 heures par jour à trier ceux qui
valent la peine. Et quand un dossier urgent arrive en pleine semaine chargée,
vous le perdez.

Ce que fait BankKey :
- Lit vos emails entrants (OAuth Gmail, lecture seule)
- Qualifie chaque demande en 60 secondes
- Calcule un score de bancabilité selon vos critères
- Rédige la réponse email pré-remplie + briefing d'appel
- Suit les banques sollicitées + résultats

Le pilote :
- 20 cabinets sélectionnés
- 199 €/mois (au lieu de 349 € prix public futur)
- Tarif bloqué à vie
- Accompagnement perso pendant 3 mois

Démo de 20 min sur vos propres emails : https://bankkey.ch/book

Bien à vous,
Sandra
[Téléphone perso pour réponse rapide]
bankkey.ch
```

---

## 6. Séquence de follow-up

| Étape | Délai | Action |
|-------|-------|--------|
| **J0** | — | Envoi DM LinkedIn Template A |
| **J+4** | si pas de réponse | Relance LinkedIn courte : *"Pas vu mon message [Prénom] ? Promis 5 min seulement."* |
| **J+10** | si toujours pas | Email Template (voir #5) |
| **J+18** | si toujours pas | Dernier message LinkedIn : *"Dernière relance promis ! Si pas votre besoin, voici la démo en autoplay pour curiosité : bankkey.ch/demo. Bonne suite à vous."* |
| **J+25** | si toujours pas | Marquer "Ghosted" dans tracker, ne plus relancer |

---

## 7. Quand ils répondent positivement

### Si ils disent "oui je veux voir"

Réponse immédiate (moins de 2h) :

```
Super [Prénom], merci. Je vous propose 3 créneaux :

- [Jour] [Heure]
- [Jour] [Heure]
- [Jour] [Heure]

Démo de 20 min en visio. Vous ouvrez votre Gmail, on regarde 2-3 de vos
vrais leads, je vous montre comment BankKey les qualifierait.

Sinon dites-moi votre dispo, je m'adapte.

Sandra
```

### Si ils disent "trop cher"

```
Je comprends. Le programme pilote est justement fait pour ça : 199 €/mois au
lieu de 349, et c'est bloqué à vie. Soit vous voyez un retour rapide (en
moyenne 1 dossier supplémentaire/mois rembourse l'abonnement), soit vous
annulez sans frais.

5 min pour qu'on en parle ?
```

### Si ils disent "j'ai déjà un CRM"

```
Parfait. BankKey ne remplace pas votre CRM, il intervient EN AMONT sur la
qualification des emails entrants. Vous gardez Aprico/Marketis pour la gestion
des dossiers actifs. BankKey vous fait gagner les 1-2h/jour que vous passez à
trier les nouveaux leads.

5 min pour voir comment on s'intègre ?
```

---

## 8. Script démo 20 min — structure

| Temps | Section | À dire |
|-------|---------|--------|
| 0-2 min | Découverte | "Avant de vous montrer, dites-moi comment vous recevez vos leads aujourd'hui, combien par mois, et où ça pèche pour vous." |
| 2-7 min | Démo live | Ouvrez bankkey.ch/demo (vue auto), montrez 2 prospects. Insistez sur le scoring + l'email pré-rédigé. |
| 7-12 min | Test réel | "Donnez-moi un de vos vrais emails de la semaine dernière, on le passe ensemble." Utilisez /demo/manual. |
| 12-15 min | Tableau de bord | Montrez `/pro` (votre compte avec quelques exemples). Stats. Banques. Bilan mensuel. |
| 15-18 min | Programme pilote | Tarif, accompagnement, durée. |
| 18-20 min | Closing | "Vous me dites oui maintenant, on vous setup demain. Sinon dites-moi ce qui bloque vraiment." |

**Tip** : enregistrez vos premières démos (avec leur accord). Vous verrez vos tics et les vraies objections.

---

## 9. Métriques à suivre chaque semaine

| Métrique | Cible semaine 1 | Cible semaine 4 |
|----------|----------------|----------------|
| Ajouts tracker | 50 | 200 cumulés |
| DMs envoyés | 30 | 150 cumulés |
| Taux de réponse | 15% | 20% (après itération) |
| Démos bookées | 3-5 | 15 cumulés |
| Pilotes signés | 0 | 3-5 |

**Si après 100 DM vous n'avez pas 3 démos bookées** : changer le template ou la cible. Quelque chose ne colle pas.

---

## 10. Limites à respecter

### LinkedIn
- Maximum **80 invitations + DMs / semaine** (Linkedin déclare 100 mais cap réel ~80)
- **Ne pas spammer** : personnaliser chaque message (au moins prénom + détail)
- Si vous êtes coupée pour spam → 48h sans pouvoir envoyer

### Email
- Max **20-30 emails / jour** depuis votre adresse pro (Google peut flag spam)
- **Toujours mention RGPD** en bas : *"Vous pouvez vous opposer à toute relance — répondez STOP"*

### Téléphone
- Le téléphone est OK en B2B mais **pas avant 9h, pas après 18h**
- Maximum 2 essais espacés de 3 jours

---

## 11. Outils utiles (gratuits ou freemium)

| Outil | Usage | Gratuit ? |
|-------|-------|-----------|
| LinkedIn Sales Navigator | Recherche ciblée | Essai 30j |
| Apollo.io | Trouver emails depuis LinkedIn | 50/mois gratuit |
| Hunter.io | Vérifier emails avant envoi | 25/mois gratuit |
| Calendly | Booking démos | Gratuit basique |
| Loom | Vidéos pitch courtes | 25 vidéos gratuit |
| Notion / Google Sheets | Tracker | Gratuit |

---

## Action de cette semaine

1. **Lundi matin (1h)** : créer compte LinkedIn Sales Navigator (essai 30j), exporter 50 prospects dans Apollo, importer dans tracker Google Sheets
2. **Lundi après-midi (1h)** : envoyer 20 DMs Template A
3. **Mercredi (30 min)** : check réponses, relancer non-répondants J+4
4. **Vendredi (30 min)** : envoyer 20 nouveaux DMs, planifier semaine suivante

**Si vous bookez 1 démo cette semaine, c'est une victoire.**
Si vous bookez 3 démos, c'est exceptionnel.

---

## Et après la première démo

Reportez tout dans CLAUDE.md pour que je puisse vous aider à itérer :
- Ce qui a marché
- Les objections récurrentes
- Les fonctionnalités demandées
- Les abandons (et à quel moment)

On ajuste BankKey en fonction des vrais retours, pas de mon intuition.
