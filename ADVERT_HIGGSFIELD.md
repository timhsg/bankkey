# Pub BankKey — Storyboard & prompts Higgsfield

> Tout est prêt à coller dès que tu as des crédits Higgsfield.
> Règle d'or marque : **on ne vend pas de l'IA**, on vend du temps gagné et des dossiers signés.
> Jamais les mots "IA / intelligence artificielle" à l'écran ou en voix off.

---

## 0. Décisions de format

| Choix | Recommandation | Pourquoi |
|---|---|---|
| Durée | **20-25 s** | Assez pour la promesse, assez court pour LinkedIn/Insta |
| Ratio principal | **9:16 vertical** | LinkedIn mobile, Stories, Reels — là où sont les courtiers |
| Ratio secondaire | 16:9 | Header du site, YouTube pre-roll |
| Voix off | FR, masculine ou neutre, posée | Sérieux bancaire, pas hype tech |
| Musique | Corporate minimale, piano + nappe, montée douce | Confiance, pas "startup hype" |
| Palette | Navy #0A1F5C → bleu #3b5fe0, blanc, fond clair | Cohérent avec le site |

**Budget crédits estimé** (Higgsfield) :
- 5 keyframes images (nano_banana_pro, 2 cr ch.) = ~10 crédits
- 5 clips vidéo (marketing_studio_video ou seedance, ~75 cr/15s — viser 5s/clip si dispo) = gros poste
- ⚠️ Le plus économique : générer **1 seul plan produit animé de 15s** (~75 cr) + monter le reste avec captures écran réelles de ton app. Tu n'as pas besoin de tout générer en IA.

---

## 1. Concept narratif (le fil rouge)

**Titre de la pub : "Pendant que vous triez, votre concurrent signe."**

Un courtier submergé d'emails le matin → bascule → BankKey a déjà tout trié → il appelle, serein → il signe. Avant / Après.

---

## 2. Storyboard plan par plan

### PLAN 1 — L'accroche (0:00 – 0:04)
- **Visuel** : un bureau de courtier tôt le matin, écran d'ordinateur saturé d'emails non lus, mug de café qui fume. Lumière froide.
- **Texte écran** : « 80 emails. Lundi, 8h. »
- **Voix off** : *"Chaque matin, c'est la même chose. Des dizaines de demandes. Et le temps qui file."*

### PLAN 2 — La douleur (0:04 – 0:08)
- **Visuel** : gros plan sur le visage du courtier, légèrement las, qui scrolle sa boîte mail.
- **Texte écran** : « Lesquels valent un appel ? »
- **Voix off** : *"Trier à la main vous coûte des heures. Et pendant ce temps, un autre courtier a déjà rappelé."*

### PLAN 3 — La bascule (0:08 – 0:11)
- **Visuel** : transition fluide — l'écran chaotique se réorganise en un tableau de bord épuré (le dashboard BankKey). Mouvement de "mise en ordre".
- **Texte écran** : « BankKey s'en occupe. »
- **Voix off** : *"BankKey lit votre boîte avant vous."*

### PLAN 4 — La preuve produit (0:11 – 0:16)
- **Visuel** : **capture réelle du dashboard BankKey** (Aujourd'hui) — 4 dossiers qualifiés avec leurs scores qui apparaissent un à un. Zoom doux sur un score 92.
- **Texte écran** : « Vos vrais dossiers, déjà notés et préparés. »
- **Voix off** : *"Vos demandes triées, qualifiées, et la réponse déjà rédigée. Vous validez, vous envoyez."*

### PLAN 5 — Le résultat humain (0:16 – 0:20)
- **Visuel** : le même courtier, détendu, au téléphone, sourire léger, lumière chaude. Il prend des notes.
- **Texte écran** : « Vous appelez. Vous signez. »
- **Voix off** : *"Vous vous concentrez sur les rendez-vous. BankKey s'occupe du reste."*

### PLAN 6 — Logo + CTA (0:20 – 0:24)
- **Visuel** : fond navy dégradé, **wordmark BankKey** centré (icône clé + texte), apparition douce.
- **Texte écran** : « bankkey.ch — Réservez une démonstration »
- **Voix off** : *"BankKey. Le logiciel des courtiers qui répondent en premier."*

---

## 3. Prompts Higgsfield — IMAGES (keyframes)

> Modèle conseillé : `nano_banana_pro` (bon sur texte/détail). Ratio `9:16`. 2 crédits/image.
> Génère chaque keyframe, puis anime-la en vidéo (section 4).

**Keyframe Plan 1 — bureau submergé**
```
Cinematic vertical shot, early morning, a French mortgage broker's clean modern desk, a laptop screen completely full of unread email notifications, a steaming coffee mug beside it, cold blue morning light through a window, shallow depth of field, professional corporate photography, muted tones, no text, 9:16.
```

**Keyframe Plan 2 — visage las**
```
Cinematic vertical close-up of a 40-year-old professional man in a shirt, slightly tired expression, looking at a laptop screen, scrolling emails, soft window light, realistic, corporate documentary style, navy and grey palette, no text, 9:16.
```

**Keyframe Plan 4 — dashboard (À REMPLACER PAR UNE VRAIE CAPTURE)**
```
NE PAS GÉNÉRER EN IA. Utilise une capture d'écran réelle de /pro (BankKey) sur fond clair.
Importe-la dans Higgsfield via media_import_url puis anime-la (zoom doux).
```

**Keyframe Plan 5 — courtier serein au téléphone**
```
Cinematic vertical shot, the same 40-year-old professional man, relaxed and confident, smiling slightly while talking on a phone, taking notes, warm natural light, modern office, corporate lifestyle photography, navy accents, no text, 9:16.
```

**Keyframe Plan 6 — fond logo**
```
Minimal deep navy blue gradient background (#0A1F5C to #3b5fe0), clean, premium, empty center for a logo, subtle soft light glow, no text, 9:16.
```
*(Le wordmark BankKey sera ajouté en montage par-dessus — n'essaie pas de faire écrire "BankKey" par l'IA.)*

---

## 4. Prompts Higgsfield — VIDÉO (animation des plans)

> Modèle : `marketing_studio_video` (ads) ou `seedance_2_0`. Vise 5s/clip si le modèle le permet pour économiser.
> Pour animer une image existante : passe le `job_id` (ou media_id) de la keyframe en `medias` rôle `start_image`.

**Clip Plan 1**
```
Slow push-in on the cluttered laptop screen full of email notifications, steam rising from the coffee mug, subtle morning light shift, cinematic, calm but tense mood. 5s.
```

**Clip Plan 3 — la bascule (le plan signature)**
```
A chaotic email inbox on screen smoothly reorganizes itself into a clean, minimal dashboard with neat cards sliding into place, satisfying order-from-chaos motion, navy and white UI, premium fintech feel, smooth easing. 5s.
```

**Clip Plan 5**
```
Gentle handheld-style shot of the confident broker smiling while on a phone call, warm light, natural micro-movements, optimistic mood. 5s.
```

**Clip Plan 6 — logo reveal**
```
Deep navy gradient background with a soft light bloom expanding gently from the center, premium and calm, leaving clean empty space in the middle for a logo. 4s.
```

---

## 5. Voix off complète (à faire lire / TTS)

> Ton : posé, grave, confiant. Débit lent. (~55 mots, cale sur 24s.)

```
Chaque matin, c'est la même chose. Des dizaines de demandes, et le temps qui file.
Trier à la main vous coûte des heures — et pendant ce temps, un autre courtier a déjà rappelé.
BankKey lit votre boîte avant vous. Vos demandes triées, qualifiées, la réponse déjà rédigée.
Vous vous concentrez sur les rendez-vous. BankKey s'occupe du reste.
```

*(Higgsfield peut générer l'audio via `generate_audio`, ou utilise ElevenLabs / une vraie voix.)*

---

## 6. Comment lancer dans Higgsfield (une fois les crédits achetés)

1. **Images** : pour chaque keyframe, `generate_image` avec `model: nano_banana_pro`, `aspect_ratio: 9:16`, le prompt de la section 3.
2. **Vidéo** : `generate_video` avec `model: marketing_studio_video`, et passe la keyframe en `medias: [{ role: "start_image", value: "<job_id_image>" }]` + le prompt de la section 4.
3. **Capture produit** : enregistre une vraie vidéo d'écran de `/pro` (le dashboard qui se remplit) — c'est plus crédible que de l'IA, et gratuit.
4. **Montage** : assemble les clips + captures + voix off + musique dans CapCut / Premiere / DaVinci (gratuit). Ajoute le wordmark BankKey (SVG) en plan final.
5. **Sous-titres** : ajoute des sous-titres FR brûlés (85% regardent sans le son sur mobile).

---

## 7. Version ultra-économique (si peu de crédits)

Tu n'as **pas besoin de générer toute la pub en IA**. Recette minimale :
- **0 crédit** : 100% captures d'écran réelles de BankKey + texte animé + voix off + musique libre. Monté dans CapCut. Honnêtement, pour du B2B courtage, **c'est souvent plus convaincant** qu'une pub IA léchée.
- **~75 crédits** : ajoute juste 1 plan d'ouverture cinématique généré (le bureau submergé) pour l'accroche, le reste en captures.

---

## 8. Rappel stratégique

Une pub léchée n'a de valeur que si elle atterrit devant des courtiers. Pour démarrer, **ton Loom personnel (LOOM_PREP.md) convertit mieux** qu'une pub : c'est toi, en direct, sur leur problème. Garde cette pub pour quand tu feras de l'acquisition à plus grande échelle (LinkedIn Ads, retargeting).
```
