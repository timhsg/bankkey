# REDESIGN_NOTES — passage au design "Instrument"

> Notes de migration pour Tim. Ce qui a changé, ce qui reste à porter,
> et la recette pour redessiner les pages internes sans tout casser.

---

## 1. Ce qui a changé

| Fichier | Statut | Notes |
|---|---|---|
| `app/globals.css` | ✅ refait | Nouveau design system (variables CSS, eyebrow, hairline, btn-ink, stat-display, ticker) |
| `tailwind.config.ts` | ✅ refait | Couleurs `paper / ink / rule / brand / signal`, fonts `display / mono`, maxWidth `prose / edit` |
| `app/layout.tsx` | ✅ refait | Fonts : Inter Tight (sans) + Instrument Serif (display) + JetBrains Mono. Bg `paper` |
| `app/page.tsx` | ✅ refait | Landing éditoriale en 11 sections numérotées, sans grilles de cards ni gradients |

## 2. Composants devenus inutiles sur la landing

Ces composants sont **toujours dans le repo** mais ne sont plus importés par `page.tsx` :

- `app/_components/HeroPreview.tsx`
- `app/_components/IntegrationsBar.tsx`
- `app/_components/WorkflowSteps.tsx`
- `app/_components/ForWhoSection.tsx`
- `app/_components/PricingSection.tsx`
- `app/_components/ROICalculator.tsx`

**Recommandation :** ne les supprime pas tout de suite. Ils peuvent être :
- **portés au nouveau langage** plus tard (notamment `ROICalculator` qui a une vraie valeur en démo) ;
- **réutilisés sur des pages dédiées** (`/roi`, `/integrations`).

À supprimer seulement quand tu es certain de ne plus les vouloir.

## 3. Le langage visuel en 90 secondes

| Élément | Token / classe | Quand l'utiliser |
|---|---|---|
| Fond principal | `bg-paper` (`#F4EFE6`) | Toujours, partout, sauf alternance |
| Fond secondaire | `bg-paper-deep` (`#EBE5D7`) | Sections d'alternance, pour rythmer (jamais de blanc pur) |
| Texte | `text-ink` | Titres et corps primaires |
| Texte secondaire | `text-ink-2` | Paragraphes |
| Texte meta | `text-ink-muted` | Captions, eyebrows, ticker |
| Filet horizontal | `border-t hairline` | Séparation de section. Remplace les changements de fond |
| Accent unique | `text-signal` (ocre `#B05421`) | UN mot par section, max. Réservé à l'emphase éditoriale |

### Typo, règle simple

- **Tout titre** : `className="display"` → Instrument Serif 400
- **Un mot en italique** dans le titre : `<span className="display-it">mot</span>` (la signature visuelle de BankKey)
- **Étiquette de section** : `className="eyebrow"` → mono, small caps
- **Chiffre, code, ID** : `className="ticker"` ou `className="tabular"`

### Boutons

- Primaire : `className="btn-ink"` (encre sur paper)
- Secondaire : `className="btn-link"` (soulignement éditorial)
- **Pas de bouton "outline rounded-lg" Tailwind par défaut.** Les boutons sont anguleux (`rounded-[2px]`), sans ombre.

### Layout

- Section "prose" (lecture longue) : `container-prose` (max 38rem)
- Section "edit" (structurelle) : `container-edit` (max 68rem)
- Pas de `mx-auto max-w-6xl` génériques.

### Animation

- Une seule classe : `reveal` (fade + translate 6px) sur l'entrée des sections clés.
- **Aucun hover-lift, scale, gradient-shift.** Le mouvement est austère.

## 4. Dépendances à installer

Aucune nouvelle dépendance n'est strictement requise — les trois fonts (`Inter_Tight`, `Instrument_Serif`, `JetBrains_Mono`) viennent de `next/font/google` qui est déjà présent.

**Vérification après pull :**

```bash
cd "/Users/sandra/Claude Code/immopilot-demo"
npx tsc --noEmit      # doit passer sans erreur
npm run dev           # localhost:3000 → la nouvelle landing doit s'afficher
```

Si une erreur "Module not found: 'next/font/google'", c'est que ton Next est trop ancien. Vérifie `package.json` → `"next": "^14.2.5"` ou plus.

## 5. Pages restantes à passer au nouveau langage

Par ordre de priorité (les premières sont vues par les prospects, les dernières par les clients déjà signés) :

### Priorité 1 — visible en outbound

- [ ] `app/demo/page.tsx` — la démo interactive : même bg `paper`, même eyebrow numéroté, même hairline entre étapes
- [ ] `app/book/page.tsx` — formulaire réservation : single column, `display` sur le titre, champs avec border `hairline` sans rounded
- [ ] `app/security/page.tsx` — passe en mode "manifeste de page" (single prose, eyebrow "Manifeste sécurité")
- [ ] `app/demo/access/page.tsx` — credentials démo : minimaliste, gros `ticker` pour le login

### Priorité 2 — vue dès le premier login

- [ ] `app/pro/login/page.tsx` — supprimer le panneau navy + form blanc à 2 colonnes ; faire une page single-column éditoriale, paper + fenêtre form au centre
- [ ] `app/pro/page.tsx` (Aujourd'hui) — c'est le tableau de bord. Le langage éditorial s'applique sur les **titres** et **éléments de meta**, mais les widgets gardent une densité d'app. Garde `font-sans`, applique `display` uniquement aux titres de carte.

### Priorité 3 — pages connexes, peuvent attendre

- `app/pro/leads/[id]/page.tsx`, `app/pro/banks/page.tsx`, `app/pro/bilan/page.tsx`, etc.
- `app/privacy/page.tsx`, `app/terms/page.tsx` — prose pure, parfait pour `container-prose`

### Recette générique pour une page interne

```tsx
// Squelette type
<main className="min-h-screen bg-paper text-ink">
  <header className="border-b hairline">
    <div className="container-edit h-16 flex items-center justify-between">…</div>
  </header>

  <section className="container-edit pt-20 pb-12">
    <p className="eyebrow mb-6">— TITRE DE LA PAGE</p>
    <h1 className="display text-4xl md:text-6xl tracking-editorial">
      Une phrase, <span className="display-it">un italique</span>.
    </h1>
  </section>

  <section className="border-t hairline">
    <div className="container-prose py-16">
      {/* contenu */}
    </div>
  </section>
</main>
```

## 6. Repos GitHub utiles si tu veux pousser plus loin

| Repo | Utilité pour BankKey | Note |
|---|---|---|
| [vercel/geist-font](https://github.com/vercel/geist-font) | Alternative premium à Inter Tight | Si tu veux un look encore plus "Vercel-grade" |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | Composants headless propres | Pour `/pro` (modales, dropdowns, command). À skinner avec les tokens `paper/ink` |
| [pacocoursey/cmdk](https://github.com/pacocoursey/cmdk) | Command palette `Cmd+K` | Très bon ajout sur `/pro` : "Aller à prospect", "Ouvrir bilan" |
| [emilkowalski/vaul](https://github.com/emilkowalski/vaul) | Drawer mobile-first | Pour la fiche prospect sur mobile |
| [emilkowalski/sonner](https://github.com/emilkowalski/sonner) | Toasts | Remplace tes toasts actuels par un truc minimaliste typo `mono` |
| [tinacms/tina](https://github.com/tinacms/tina) ou [contentlayer/contentlayer](https://github.com/contentlayer/contentlayer) | Blog "instrument" | Si tu lances un blog éditorial pour SEO ("Notes du fondateur") |
| [steven-tey/dub](https://github.com/dub-team/dub) | Référence design SaaS sérieux | À lire pour t'inspirer côté `/pro`. Stack proche de la tienne |
| [calcom/cal.com](https://github.com/calcom/cal.com) | Référence design pour `/book` | Booking flow refondu plusieurs fois, beaucoup à piquer |
| [openstatusHQ/openstatus](https://github.com/openstatusHQ/openstatus) | Page status sobre | Idée : `status.bankkey.ch` à l'identité éditoriale, ça rassure les comptables des cabinets |
| [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | Composants animés | À utiliser **avec parcimonie** — sinon tu retombes dans le piège vibe-coded |

⚠️ Le piège : installer 5 libs en une semaine. Choisis-en **une** (probablement `shadcn-ui` pour `/pro`), porte-la au langage Instrument, et passe à la suite.

## 7. Sanity checks après refresh

- [ ] `npx tsc --noEmit` passe
- [ ] `npm run dev` → landing visuellement cohérente, lecture confortable sur 13" et 27"
- [ ] Test rapide mobile (iPhone SE viewport via Chrome DevTools) — le clamp() des titres devrait gérer
- [ ] Test mode reduced-motion : Mac → Réglages → Accessibilité → Réduire les animations → page toujours lisible
- [ ] Imprimer la page (Ctrl+P preview) — c'est un bon test de qualité éditoriale. Si l'impression est lisible, ton design est honnête.

## 8. Ce que tu peux supprimer plus tard, sans regret

- L'ancien token `--font-display: Bricolage Grotesque` (déjà remplacé)
- La classe `.hover-lift` (plus utilisée)
- La classe `.animate-soft-pulse` (plus utilisée)
- Les couleurs `bg-blue-900`, `bg-emerald-50`, `bg-amber-50` éparpillées dans les autres pages — à remplacer par `bg-paper-deep` ou `text-signal` selon contexte

Garde-les tant qu'une page non encore migrée les utilise. Supprime quand grep retourne 0 résultat.
