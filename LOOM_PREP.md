# LOOM PREP — BankKey

> Tout ce que tu dois faire AVANT d'appuyer sur record.
> Tout ce que tu dois dire PENDANT.
> Tout ce que tu dois envoyer APRÈS.

Le Loom remplace la 1ère démo live. Objectif : qu'un courtier de 50 ans le regarde sur son canapé un dimanche soir et clique "Réserver 15 min" avant la fin.

---

## ⏱️ Avant tout : règles non négociables

| Règle | Pourquoi |
|---|---|
| Durée cible **5 min 30 — 6 min 30 max** | Au-delà de 7 min, taux de complétion s'effondre. En dessous de 4, tu n'as pas eu le temps de prouver |
| **Pas de slides.** Que du produit en direct | Slides = SaaS qui vend du vent. Produit = SaaS qui résout. Tu vends un produit |
| **Pas d'intro "Bonjour je suis Tim, fondateur de BankKey"** | Tu perds 20 secondes et tu rappelles ton âge avant que le contenu te crédibilise. L'intro vient de l'email d'envoi, pas du Loom |
| **Audio bon, pas excellent** | Casque-micro filaire correct > Airpods. Pas besoin de Shure SM7B. Mais pas de micro intégré MacBook |
| **Pas plus de 3 prises** | Si tu n'y arrives pas en 3 prises, le problème n'est pas la prise, c'est le script. Reviens à cette page |

---

## 1. La veille — préparer l'environnement (45 min)

### 1.1 Compte démo

- [ ] Connexion `demo@bankkey.ch / DemoBankKey2026` sur `/pro` OK
- [ ] Vérifier que le seed v2 est bien rejoué (90 prospects, 10 récents détaillés)
- [ ] Vérifier qu'au moins **1 prospect score >85**, **1 score 50-70**, **1 rejeté**
- [ ] Vérifier que `/pro/bilan` affiche des chiffres crédibles (pas de 0€ partout)
- [ ] Vérifier `/pro/banks` kanban : au moins 3 cartes par colonne
- [ ] Si quelque chose n'est pas à niveau : rejoue `supabase/seed-demo-reset.sql` avant tout

### 1.2 Hygiène écran (le détail qui te disqualifie en 2 secondes)

- [ ] **Fond d'écran macOS neutre** (uni gris foncé, pas une photo perso)
- [ ] **Cacher la barre du dock** : Réglages système → Bureau & Dock → "Masquer/afficher automatiquement"
- [ ] **Cacher la barre menu** : même panneau → "Toujours masquer"
- [ ] **Quitter** Slack, Discord, Messages, Mail, Notion — toute app qui peut faire un pop-up notif
- [ ] **Activer "Ne pas déranger"** macOS (Centre de contrôle → Focus → Ne pas déranger pendant 1h)
- [ ] **Vider la barre d'onglets** Chrome : 1 seul onglet ouvert sur `localhost:3000/pro` ou `bankkey.ch/pro`
- [ ] **Mode incognito** ou **profil Chrome dédié "Demo"** : zéro extension visible, zéro favori perso dans la barre
- [ ] **Zoom navigateur 110-125%** (le courtier regarde sur un écran 13 pouces, pas sur ton 27")

### 1.3 Audio

- [ ] Casque-micro filaire branché (USB ou jack), pas Bluetooth
- [ ] Loom → Paramètres → Microphone → sélectionner ton casque-micro explicitement (pas "défaut système")
- [ ] **Faire un test de 30s** : enregistre toi disant *"un, deux, trois, est-ce que mon micro respire bien"* — réécoute. Si tu entends ta respiration ou la ventilation du Mac : éloigne le micro de 5 cm
- [ ] Tester dans une pièce **calme et meublée** (rideau, tapis, canapé). Une chambre est mieux qu'un open space vide qui résonne

### 1.4 Setup Loom

- [ ] **Mode** : Écran + caméra
- [ ] **Caméra** : petit cercle bas-droit, taille S. Pas désactivée — ton visage rassure plus que tu ne crois. Mais petit
- [ ] **Format** : 1080p, mode "Cam Off" interdit
- [ ] **Background flou caméra** activé si ton arrière-plan n'est pas neutre

### 1.5 Cahier ouvert à côté

- Le script ci-dessous (impression A4 ou tablette). Tu peux **regarder discrètement** entre 2 sections — un Loom ce n'est pas un appel, des micro-pauses ne se voient pas

---

## 2. Le storyboard — 6 minutes, minute par minute

> Chaque section a : (a) ce que tu **montres** à l'écran, (b) ce que tu **dis**, (c) ce que tu **ne dis jamais**.

### ⏱️ 0:00 → 0:20 — L'accroche froide

**Tu montres :** un Gmail réaliste avec ~80 mails non lus (capture ou seed à préparer). Tu fais défiler 3 secondes.

**Tu dis (mot pour mot) :**

> *"Ça, c'est la boîte d'un courtier crédit un lundi matin. 80 mails. 6 valent un appel. 74 sont du bruit. Aujourd'hui le tri se fait à la main, en café, en 90 minutes. Je vais vous montrer comment BankKey le fait pour vous avant que vous arriviez."*

**Tu ne dis pas :** "Bonjour", "Je m'appelle", "Aujourd'hui je vais vous présenter", "Notre solution révolutionnaire". Aucune introduction de toi.

**Pourquoi ça marche :** tu démarres par leur réalité, pas par toi. Tu poses un problème concret en 20 secondes. Le courtier reconnaît sa boîte.

---

### ⏱️ 0:20 → 1:00 — Le réveil avec BankKey

**Tu montres :** tu bascules sur `/pro` (la page Aujourd'hui). Top 3 prioritaires visibles. Tu pointes avec le curseur sans cliquer.

**Tu dis :**

> *"Voici la même boîte, lue par BankKey à 7h du matin. 80 mails entrés. 6 dossiers réels en haut. 74 spams, newsletters, factures, écartés mais récupérables. Vous arrivez, vous voyez ces 3 prospects en haut — un à 92, un à 78, un à 65. C'est ce sur quoi vous allez gagner votre journée."*

**Tu ne dis pas :** "L'intelligence artificielle de notre plateforme utilise des modèles avancés…" Aucun jargon tech.

---

### ⏱️ 1:00 → 2:30 — Un dossier décortiqué

**Tu montres :** tu cliques sur le prospect score 92 → fiche détail, onglet **Vue d'ensemble**.

**Tu dis (en montrant chaque bloc) :**

> *"Ça, c'est ce que vous voyez en 6 secondes au lieu de relire son mail 2 fois. Revenu 4 200 net, apport 60K, situation pro CDI ancienneté 7 ans, projet résidence principale Lyon 380K. Sa source : Empruntis. Son score 92 sur 100 — détaillé ici en 4 critères. Et ça —"* (tu cliques sur l'onglet Communication) *"— c'est le brouillon de réponse, déjà rédigé, dans le ton que vous avez configuré. Vous relisez, vous corrigez 2 mots si vous voulez, vous cliquez envoyer. Le mail part de votre Gmail, signé de vous, sans que rien ne soit envoyé à votre place."*

**Tu ne dis pas :** "Notre IA propriétaire", "deep learning", "modèle entraîné sur". Tu décris ce qu'il VOIT, pas comment c'est fait.

**Le détail qui closes :** tu insistes sur *"signé de vous, sans que rien ne soit envoyé à votre place"*. C'est leur peur n°1.

---

### ⏱️ 2:30 → 3:30 — Le briefing d'appel

**Tu montres :** tu scrolles dans la fiche → bloc Briefing d'appel.

**Tu dis :**

> *"Avant d'appeler, vous lisez ces 4 lignes. Le contexte du dossier. Son vrai besoin — pas ce qu'il a écrit, ce qu'il veut vraiment. Une question d'ouverture qui marche. Et la checklist documents à demander, déjà juste pour son profil — apport personnel, CDI, résidence principale. Vous ne démarrez plus à froid. Vous appelez en sachant quoi dire."*

**Pause silencieuse de 2 secondes après "vous appelez en sachant quoi dire."** Laisse-le respirer.

---

### ⏱️ 3:30 → 4:30 — La preuve par les chiffres

**Tu montres :** tu vas sur `/pro/bilan` (ou `/pro/statistiques`).

**Tu dis :**

> *"Sur ce cabinet pilote, en mai : 142 emails entrés, 38 dossiers réels qualifiés, 11 dossiers signés. Avant BankKey : 14h par semaine pour faire le tri. Maintenant : 0. Ce qu'ils ont gagné, c'est pas du temps de courtier — c'est du temps de courtier qu'ils ont remis sur des appels. Et c'est ça qui a fait + 3 dossiers ce mois-là."*

**⚠️ Si tu n'as pas encore de pilote** : remplace par *"Voici ce que ça donnerait sur votre volume, en projection."* Et tu pointes le calculateur ROI. Sois honnête, ne fabrique pas un chiffre.

---

### ⏱️ 4:30 → 5:15 — L'objection silencieuse

**Tu montres :** tu reviens en haut de la fiche prospect → tu pointes le bouton "Corriger".

**Tu dis :**

> *"Si BankKey se trompe — ça arrive — vous cliquez ici, vous changez la valeur, le score se recalcule. Vos données sont à Francfort, chiffrées. Vos prospects ne sortent pas de votre cabinet. Et si vous voulez tout exporter ou tout supprimer, c'est 1 clic et 72 heures."*

**Tu ne dis pas :** "Conforme RGPD". Tu **montres** la conformité en parlant des actions concrètes du courtier (corriger, exporter, supprimer).

---

### ⏱️ 5:15 → 5:50 — Qui je suis (45 secondes, pas plus)

**Tu montres :** tu coupes le screenshare. Plein cadre caméra.

**Tu dis (mot pour mot) :**

> *"Je suis Tim, 18 ans, fondateur de BankKey. J'ai 32 ans de moins que la plupart des courtiers à qui je parle, et c'est pour ça que j'ai passé 6 mois à observer leur quotidien avant d'écrire une ligne. Ce que je sais bien, c'est la tech qu'on a construite. Ce que vous savez, c'est votre métier. C'est exactement la raison pour laquelle je propose 15 minutes de visio — pas pour vendre, pour que vous me disiez ce qui manque à BankKey pour votre cabinet précis."*

**Pourquoi cette formulation marche :**
- Tu **assumes l'âge en premier** → tu désamorces avant qu'il ne se le demande
- Tu **délimites ton expertise** (tech, pas courtage) → tu ne sembles pas prétentieux
- Tu **inverses le pitch** → ce n'est plus toi qui vends, c'est lui qui consulte
- Tu **promets 15 min**, pas 20 ni 30 → moins engageant à accepter

**Ce que tu ne dis JAMAIS :**
- *"Je sais que je suis jeune mais…"*
- *"Désolé pour mon âge…"*
- *"Je débute donc…"*
- *"Notre équipe est encore en formation…"*

---

### ⏱️ 5:50 → 6:15 — Le CTA

**Tu montres :** plein cadre, ou écran avec la page `/book` ouverte.

**Tu dis :**

> *"Sous cette vidéo, un lien pour réserver 15 minutes. Vous choisissez le créneau, vous arrivez, on parle de votre cabinet. Si BankKey est utile, on active votre essai 30 jours pendant l'appel. Sinon, vous repartez avec une démo et zéro engagement. À très vite."*

**Geste de fin :** un signe de main bref. Pas de "Merci d'avoir regardé !!" final qui fait amateur.

---

## 3. Ce qui doit être prêt SUR la page de destination du Loom

Quand le courtier clique sur ton lien `/book`, il doit voir :

- [ ] Page propre avec **ta photo + nom** (pas un avatar Slack)
- [ ] Une phrase qui répond à l'objection "ça sert à quoi 15 min" : *"On regarde ensemble votre boîte mail (anonymisée) et je vous dis si BankKey est utile pour votre cabinet."*
- [ ] **Créneaux à 15 min, pas 30** (cohérent avec ce que tu promets)
- [ ] 3 créneaux visibles cette semaine + 3 la semaine prochaine, **rien après 18h** (rester pro)
- [ ] Champ "Cabinet" obligatoire (te permet de Googler avant le call)

---

## 4. Post-prod (10 min, pas plus)

- [ ] **Aucun montage**. Tu laisses la prise complète. Les courtiers de 50 ans ne savent pas faire la différence entre brut et monté, mais ils repèrent une coupure trop nette
- [ ] **Titre du Loom** : *"BankKey en 6 min — comment 80 mails sont triés avant votre café"* (jamais "Démo BankKey")
- [ ] **Vignette personnalisée** : capture du dashboard, pas la première frame avec ta tête en train de cligner
- [ ] **Désactiver les emojis de réaction Loom** : Settings → Engagement → off. Tu ne veux pas que ton courtier voie 0 cœurs et se demande qui regarde
- [ ] **Activer "voir qui a regardé"** : tu sauras qui relance

---

## 5. L'email d'envoi (le Loom ne se vend pas seul)

Format strict, max 6 lignes. Le Loom est **l'objet** de l'email, pas un détail :

```
Objet : [Prénom courtier], 6 minutes sur votre boîte mail du lundi

Bonjour [Prénom],

[Cabinet] reçoit probablement 60 à 120 demandes par mois.
Le tri vous prend combien d'heures ?

J'ai filmé 6 minutes pour vous montrer comment BankKey le fait
avant votre arrivée : [lien Loom]

Si c'est utile : 15 min de visio cette semaine — [lien /book]
Sinon : pas de souci, supprimez ce mail.

Tim — BankKey
```

**Ce qui marche dans ce mail :**
- Personnalisation light mais réelle (cabinet, volume)
- Une question, pas une affirmation
- Le Loom est présenté comme un service rendu, pas un pitch
- "Sinon : supprimez ce mail" → désamorce la peur du suivi insistant

---

## 6. Avant d'envoyer aux vrais prospects : le test à 3 personnes

Avant que ton Loom atteigne un courtier réel, montre-le à :

1. **1 personne tech de ton âge** → te dira si le produit est clair
2. **1 adulte 40+ que tu connais** (parent, prof, voisin) → te dira si ta voix passe, si tu parais crédible
3. **1 personne qui ne connaît rien à BankKey** → te dira en 30 secondes ce qu'elle a compris

Si les 3 ne te disent pas, en moins de 30 secondes après visionnage : *"OK donc ça lit tes mails et te dit lesquels valent un appel"*, tu refais le Loom. Le test n'est pas "est-ce que c'est joli" — c'est "est-ce que le message tient".

---

## 7. Ne fais surtout pas

- [ ] ❌ Filmer en pyjama ou en sweat troué — pull col rond uni, sombre, suffit
- [ ] ❌ Filmer à 22h. Filme entre 10h et 16h, tu as plus d'énergie naturelle dans la voix
- [ ] ❌ Mettre une musique de fond
- [ ] ❌ Mettre un logo BankKey en watermark animé
- [ ] ❌ Filmer 12 prises et choisir la "meilleure". 3 prises max. Au-delà, tu rigidifies
- [ ] ❌ Envoyer le Loom à 50 personnes le premier jour. Envoie à 5, regarde les stats Loom (durée moyenne de visionnage), ajuste, puis scale

---

## 8. Critère de succès du Loom (à mesurer dans 7 jours)

| Métrique | Cible réaliste | Si en-dessous |
|---|---|---|
| Loom envoyés | 30-50 | Augmente le volume |
| Taux d'ouverture du Loom (vu) | 35-50% | Objet d'email à revoir |
| Durée moyenne visionnée | > 3 min | Les 3 premières minutes ne tiennent pas |
| Démos `/book` réservées | 2-5 sur 30-50 envoyés | Pitch ou CTA trop mou |
| Démos honorées | 70-80% des réservées | Rappel J-1 manquant |

**Si tu obtiens 2 démos réservées sur 30 Looms envoyés, c'est un succès.** Pas 20 démos. Deux suffisent pour valider que le pitch tient et pour gagner ta première conversation. Le reste vient avec l'itération.

---

## 9. Le seul vrai conseil

Le Loom n'est pas un film. C'est **toi en train de montrer ton produit à un ami courtier qui t'a demandé ce que tu fabriques**. Garde ce cadre mental tout le long. Si tu te surprends à "présenter" — coupe, respire, et reprends comme si tu parlais à un pote.

Tu n'es pas en train de vendre. Tu es en train de montrer.
