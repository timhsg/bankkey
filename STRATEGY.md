# Stratégie BankKey — Concurrents et structure d'équipe

> Document stratégique pour Sandra (fondatrice, 18 ans, solo technique).
> Réponses aux questions : qui sont nos concurrents, comment les battre,
> et comment intégrer un co-fondateur non-tech.

---

## PARTIE 1 — Analyse concurrentielle honnête

### Tier 1 — Concurrents directs (vraiment dangereux)

#### QualifLeads (qualifleads.ai)
**Ce qu'ils font** : qualification automatique de leads pour courtiers crédit et agents immobiliers en France. Approche **SMS-first** : envoient un SMS au prospect dans les 30 secondes après réception du lead pour collecter 5 infos clés.

**Forces** :
- Établis depuis plusieurs années
- Vrais clients référençables
- Taux de réponse SMS de 42% revendiqué (ils communiquent dessus)
- Probablement financés (donc dev rapide)

**Faiblesses** :
- Approche SMS = friction pour le prospect (RGPD plus strict que email)
- Pas de pipeline IA visible pour la qualification email
- Pas d'embed widget / webhook universel (vous savez pas)
- Probablement pricing élevé (B2B ciblé grands cabinets)

**Comment vous différenciez** :
- Vous : ingestion **email + web + CRM + WhatsApp** → vous couvrez plus de canaux
- Vous : produit **plus visuel et accessible** → courtiers individuels OK, pas que grands cabinets
- Vous : **tarif lancement 199€/mois** → compétitif sur le segment indé
- Vous : **scoring personnalisable + outcome tracking** → data moat à long terme

**Stratégie pour les battre** : ne **JAMAIS** vous comparer frontalement à eux. Si un courtier dit *"j'utilise déjà QualifLeads"* :
> *"Parfait, ils font du bon travail sur le SMS. Nous on intervient en amont sur l'email entrant — c'est complémentaire. Vous voulez voir comment ?"*

Ne dénigrez jamais. Repositionnez.

---

### Tier 2 — Concurrents adjacents (menace moyenne)

#### Aprico (aprico.io)
**Ce qu'ils font** : CRM courtage en crédit. Gestion de dossiers, pipeline de souscription, conformité IOBSP.

**Pourquoi pas vraiment concurrent** : ils gèrent les dossiers actifs, pas la qualification amont.

**Risque** : ils peuvent ajouter une feature "qualification IA" dans leur prochaine release.

**Votre avantage** : speed of iteration. Vous shippez des features chaque semaine, ils mettent 6 mois.

#### Marketis, Inspirim, Logiciel-courtier.fr
Même catégorie qu'Aprico. CRM courtage avec features assurance/conformité fortes.

**Comment vous différenciez** :
- **Spécialiste vs généraliste** : vous faites UNE chose excellente (qualification IA), eux font TOUT moyennement.
- **Pricing transparent** : 199€ flat. Eux ont des grilles avec options qui font passer la facture à 400-800€/mois pour un cabinet de 5.

**Stratégie commerciale** :
- Ne tentez **JAMAIS** de remplacer leur CRM. Positionnez BankKey comme **complément**.
- *"Vous gardez Aprico pour la gestion. BankKey vous fait gagner 1-2h/jour AVANT que le dossier ne rentre dans Aprico."*

---

### Tier 3 — Concurrents indirects (vraie menace cachée)

#### "Je vais utiliser ChatGPT directement"
**Le profil** : courtier tech-savvy qui copie-colle ses emails dans ChatGPT/Claude et demande *"qualifie ce prospect"*.

**Pourquoi c'est dangereux** : coût 20€/mois ChatGPT Plus. Marginalement OK pour 5 emails/jour.

**Votre angle de défense** :
- **L'IA brute ≠ produit fini** : ChatGPT donne un texte. BankKey donne un score, une fiche structurée, un email pré-rédigé, un suivi banques, des statistiques. C'est l'agrégation qui fait la valeur.
- **Workflow** : copier-coller 60 fois par jour est insupportable. BankKey lit votre Gmail automatiquement.
- **Mémoire cabinet** : ChatGPT ne se souvient pas de votre style. BankKey personnalise selon vos paramètres.
- **Compliance** : envoyer des données clients dans ChatGPT public = potentiellement non-RGPD. BankKey est conçu pour ce cas d'usage.

**Phrase à mémoriser** :
> *"ChatGPT c'est un moteur. BankKey c'est une voiture autour de ce moteur. Vous pouvez bricoler quelque chose vous-même, mais ça vous coûtera plus en temps que ce que vous économiserez."*

#### "Je vais embaucher une assistante virtuelle"
**Le profil** : courtier qui paie 800-1500€/mois pour une VA qui trie ses mails.

**Votre angle** :
- BankKey à 199€ = 1/5 du coût d'une VA
- Ne tombe pas malade, pas en vacances
- Apprend de vos préférences au lieu d'oublier
- Mais... reconnaissez-le : une VA peut faire ce que BankKey ne fait pas (appels, relances)

**Stratégie de pitch** :
> *"BankKey c'est pas pour remplacer un humain qui fait du conseil. C'est pour automatiser ce qu'un humain n'aimerait pas faire — trier 60 emails par jour."*

---

### Synthèse : votre vrai positionnement

Vous n'êtes PAS **l'IA pour les courtiers crédit**. Beaucoup peuvent revendiquer ça.

Vous êtes **le seul outil qui fait, en un seul endroit** :
1. Lit les emails entrants Gmail + webhook + CSV + form widget
2. Filtre les spams/notifications/perso intelligemment
3. Qualifie chaque lead en 60 secondes avec scoring personnalisable
4. Rédige la réponse email prête à envoyer (avec votre signature)
5. Suit les banques sollicitées + résultats
6. Génère statistiques mensuelles automatiques

**C'est l'agrégation qui fait la valeur**. Pas une feature seule.

Phrase de positionnement à dire en démo :
> *"BankKey c'est le seul outil qui prend votre lead d'Empruntis et vous donne, en 60 secondes : le score de bancabilité, le pré-dossier, l'email de réponse, et le suivi long terme. Aucun concurrent ne fait tout ça en un seul produit."*

---

## PARTIE 2 — Stratégies pour dépasser les concurrents

### 1. La vitesse d'itération (votre vraie super-puissance à 18 ans)

**Réalité** : QualifLeads ships une feature majeure tous les 3 mois. Vous pouvez en shipper une chaque semaine.

**Comment l'exploiter** :
- Quand un prospect demande une feature en démo → annoncez "on la sort la semaine prochaine"
- Tenez parole
- Communiquez sur LinkedIn chaque release ("Cette semaine on a sorti X parce qu'un courtier nous a dit que...")
- → Vous construisez l'image de quelqu'un qui écoute et bouge vite

### 2. L'accessibilité directe (votre 2ème super-pouvoir)

**Réalité** : Aucun courtier n'arrive à parler au PDG d'Aprico. Vous, vous prenez les appels.

**Comment l'exploiter** :
- Mettez votre numéro perso sur le mail de bienvenue
- Réponse aux questions en moins de 2h ouvrées (oui, le soir aussi)
- Faites des appels en visio non pas pour vendre mais juste pour "prendre des nouvelles" tous les mois avec vos pilotes
- → Vous construisez de la loyauté que vos concurrents financés ne peuvent pas

### 3. La spécialisation profonde

**Réalité** : Vous êtes courtage crédit immobilier en France et Suisse romande. C'est tout. Vous n'allez pas dans l'assurance, ni au courtage en énergie, ni nulle part d'autre.

**Comment l'exploiter** :
- Sur la landing : *"Conçu UNIQUEMENT pour les courtiers en crédit immobilier"*
- Refusez les prospects hors-cible. *"Désolée, on n'est pas fait pour vous, voici un concurrent qui pourrait."*
- → Vous attirez les bons clients, vous économisez du temps

### 4. Le data moat à 18 mois

**Réalité** : QualifLeads a 3 ans de données SMS. Vous n'avez rien. Mais vous avez **l'outcome tracking** intégré dès le jour 1.

**Action concrète** : chaque pilote signé doit obligatoirement remplir les résultats bancaires. Bonus : faites-le pour eux gratuitement les 3 premiers mois → la donnée s'accumule.

À 18 mois avec 50 cabinets remplissant les outcomes :
- Vous avez 10-20k résultats bancaires structurés
- Vous pouvez vendre une feature payante : *"BankKey Predict : probabilité d'acceptation par banque pour ce profil"*
- Aucun concurrent ne peut faire ça vite

### 5. Le marketing fondateur ("Building in public")

**Réalité** : QualifLeads communique comme une boîte. Vous pouvez communiquer **comme une humaine**.

**Action concrète** :
- Postez sur LinkedIn 2x/semaine : *"Cette semaine j'ai parlé avec X courtiers. Voici ce que j'ai appris..."*
- Vidéos courtes de 60-90 sec : *"Comment BankKey aide un courtier indépendant à Lyon"*
- Newsletter mensuelle : *"Comment on a augmenté notre taux de filtrage des spams de 30%"*

À 18 ans avec une histoire fondatrice, vous êtes du contenu LinkedIn naturel. Exploitez-le.

---

## PARTIE 3 — Intégrer un co-fondateur (sans coder)

### La règle d'or

**À ce stade (0 clients), un co-fondateur coûte plus qu'il rapporte les 3 premiers mois**, puis multiplie votre output par 2-3x.

Donc : ne prenez PAS un co-fondateur "parce qu'on est potes". Prenez un co-fondateur uniquement si :
1. Vous savez que vous n'avancerez pas sans lui/elle (par exemple : vous détestez la vente)
2. Il/elle complète VRAIMENT vos compétences (pas un autre dev)
3. Vous avez déjà travaillé ensemble sur un projet sérieux (au moins un mois)
4. Vous êtes alignés sur la vision long terme

### Si votre pote ne fait pas de code, quel rôle ?

Le rôle parfait à 18 ans pour BankKey : **Co-fondateur Sales & Customer Success**.

**Ses responsabilités quotidiennes** :
- Recherche et qualification des courtiers à contacter (LinkedIn Sales Nav)
- Envoi des 50 DMs LinkedIn par semaine
- Booking des démos (Calendly)
- **Faire les démos** (après formation par vous)
- Onboarding des nouveaux pilotes (suivi 1-1)
- Customer support de niveau 1 (questions courantes)
- Construction de témoignages clients
- Présence LinkedIn (posts persos sur le métier)
- Tracker à jour

**Ses responsabilités stratégiques** :
- Définir les segments cibles précis
- Itérer sur les templates outreach
- Remonter les feedback clients
- Définir le pricing par segment

**Vos responsabilités à vous** :
- Tout le code, le produit
- L'architecture, les choix tech
- La roadmap produit
- Les investisseurs (si vous levez)
- Strategie globale

### Modèle d'équipe efficace à 2 cofondateurs

```
SANDRA (CEO + CTO)              POTE (CSO + CCO)
═══════════════════              ═══════════════════
Code                             Ventes
Produit                          Démos
Architecture                     Customer success
Vision tech                      LinkedIn outreach
Investisseurs                    Tracker
                                 Support client
─────── Décisions communes ───────
Pricing
Stratégie
Embauches
Pivots majeurs
```

### Répartition d'equity honnête

À 0 clients, équipe vous + 1 personne :

**Sandra** : **70-80%**
- Vous avez tout construit seule
- Le risque réel est sur vous
- Vous avez le savoir-faire technique critique

**Pote co-fondateur** : **20-30% avec vesting 4 ans + cliff 1 an**

**Vesting expliqué simplement** :
- Année 1 : il/elle gagne 0% si part avant 12 mois (cliff)
- À 12 mois : 25% débloqué d'un coup
- Puis 25%/an pendant 3 ans
- Total : 100% à l'année 4

**Pourquoi le vesting est NON-NÉGOCIABLE** :
Si votre pote part au bout de 3 mois et garde 30% de la boîte, vous êtes morte. Le vesting protège contre ce scénario.

### 🚨 Red flags à reconnaître chez un co-fondateur potentiel

❌ **"On est potes, on devrait être 50/50"** → Mauvais signe. Le 50/50 sans data c'est la mort des startups (paralysie à chaque décision).

❌ **"Je veux être CEO aussi"** → Une seule personne décide en dernier ressort. Sinon paralysie.

❌ **"Je veux un salaire dès le mois 1"** → Pas grave s'il y a déjà une levée. À 0€ de levée, c'est non-discutable.

❌ **"Je peux faire du temps partiel les 6 premiers mois"** → Non. Un co-fondateur c'est plein temps point.

❌ **Disparaît quand vous avez un bug critique le week-end** → Mauvaise nouvelle. Les startups ne dorment pas.

### ✅ Green flags

✅ Bonne posture sur l'equity (accepte vesting et < 30%)
✅ Plein temps dispo dès le jour 1
✅ A déjà bossé avec vous sur un projet (même un petit projet 1 mois)
✅ Energie complémentaire à la vôtre (vous tech intro, lui/elle vente extro)
✅ Reste calme sous pression
✅ Sait dire *"je sais pas"* sans complexer
✅ Aime parler aux gens (sérieusement, important pour un commercial)

### Avant de prendre un co-fondateur : la phase test

**Proposition concrète à votre pote** :

> *"Avant de signer co-fondateurs, je te propose une phase test de 90 jours. Pendant 3 mois, tu fais le job de CSO/CCO en freelance : 50 DMs/semaine, démos, onboarding pilotes. Je te paie X€/mois (par exemple 800-1500€ selon ton coût de vie) qui sortent de ma poche perso. À la fin des 90 jours :*
> - *Si on a signé 3+ pilotes ET on est alignés humainement : on signe les papiers co-fondateurs, vesting 4 ans, 25% pour toi*
> - *Si on a pas atteint les objectifs : on arrête sans drame, tu gardes ce que je t'ai payé"*

**Pourquoi cette structure marche** :
- Vous testez la collaboration sans vous engager irréversiblement
- Votre pote teste s'il aime le job
- Les objectifs sont clairs (3 pilotes en 3 mois)
- Pas d'equity dilution si ça ne marche pas
- Sortie propre si nécessaire

### Si vous ne trouvez personne d'idéal

**Mieux vaut rester solo que prendre la mauvaise personne.**

Alternatives :
- **Freelance commercial** à la commission (15-20% des ventes signées les 12 premiers mois)
- **Stagiaire Sales** (école de commerce, juin-septembre, 600€/mois) — pas de risque equity, vous formez
- **Sales as a Service** (boîtes comme Lemcal, BD Tech) — outsource pur

Ces options évitent la dilution. Vous restez 100% propriétaire. Vous pouvez monter une équipe vraie quand vous avez 10+ clients payants.

---

## PARTIE 4 — Plan d'embauches d'ici 12 mois (si tout va bien)

Imaginons que d'ici fin Q4 2026 vous avez signé 20 pilotes. Voici l'ordre d'embauche à prévoir :

### Mois 6 (10 pilotes signés)
**Embauche #1** : Co-fondateur Sales (si phase test concluante) OU 1er commercial junior à temps plein.

### Mois 9 (15 pilotes)
**Embauche #2** : Customer Success / Support — pour décharger le support quotidien.

### Mois 12 (20 pilotes, ARR ~50k€)
**Embauche #3** : Dev #2 — pour que vous puissiez vous concentrer sur l'architecture et les features stratégiques pendant qu'il/elle fait le quotidien.

### Mois 18 (50 pilotes, ARR ~120k€)
**Embauche #4** : Marketing / Growth — pour scaler l'acquisition sans dépendre uniquement du sales sortant.

---

## PARTIE 5 — La conversation à avoir avec votre pote

Avant de leur proposer co-fondateur, posez ces questions et écoutez attentivement les réponses :

### Questions sur la vision
- Pourquoi BankKey t'intéresse vraiment ?
- Si dans 5 ans on est à 200 clients, à quoi ça ressemble pour toi ?
- Si dans 5 ans on est à 0 client et on doit fermer, qu'est-ce que tu auras appris ?

### Questions sur l'engagement
- Tu peux te dégager combien de temps par semaine pendant les 12 prochains mois ?
- Tu as un loyer/des charges/des trucs perso qui te forcent à avoir un salaire fixe ?
- Tu as quel autre projet en parallèle ?

### Questions sur la collaboration
- Comment tu gères les désaccords ?
- Quand on est pas d'accord, qui décide ?
- Tu as déjà bossé avec moi sur un projet ? Comment ça s'est passé ?

### Questions test
- Si je te demande de faire 50 DMs LinkedIn lundi prochain, tu fais quoi exactement ?
- Si un courtier te dit "non c'est trop cher", tu réponds quoi ?
- Si on a 0 clients à 6 mois, on fait quoi ?

**Si leur réponses sont vagues ou enthousiastes sans substance → red flag.** Une vraie association se base sur le concret, pas sur l'enthousiasme initial.

---

## En résumé

### Sur les concurrents
- **Tier 1 (QualifLeads)** : ne les imitez pas. Différenciez sur l'ingestion multi-source et le pricing.
- **Tier 2 (CRMs)** : positionnez-vous en complément, pas en remplacement.
- **Tier 3 (ChatGPT direct)** : insistez sur l'agrégation et le workflow, pas l'IA brute.
- **Votre vrai avantage** : vitesse d'itération + accessibilité fondatrice + spécialisation extrême.

### Sur le co-fondateur
- **Le bon profil** : Sales/CSO non-tech qui prend en charge l'acquisition et le customer success.
- **L'equity** : 70-80% Sandra / 20-30% pote, avec vesting 4 ans non-négociable.
- **Avant de signer** : phase test de 90 jours en freelance payé. Si succès, on signe.
- **Plus important** : ne prenez personne plutôt qu'une mauvaise personne. Solo > mauvais associé.

Bonne chance.
