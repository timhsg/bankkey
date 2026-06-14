// ═══════════════════════════════════════════════════════════════════════
//  Base d'expertise crédit immobilier — France & Suisse
//
//  Sources vérifiées (à jour à juin 2026) :
//  - HCSF (Haut Conseil de Stabilité Financière) : décision juin 2024
//    https://www.economie.gouv.fr/hcsf
//  - IOBSP / ORIAS : Code monétaire et financier articles L519-1
//  - FINMA Suisse : Circulaire 2025/2 financements hypothécaires
//  - LAMAL / LPP : Office fédéral des assurances sociales
//
//  Cette base est injectée dans les prompts pour garantir des conseils
//  factuels — l'IA ne fabrique pas de règles, elle cite la base.
// ═══════════════════════════════════════════════════════════════════════

export const EXPERTISE_FRANCE = `
═══════════════════════════════════════════════════════════
  EXPERTISE CRÉDIT IMMOBILIER FRANCE — Règles vérifiées
═══════════════════════════════════════════════════════════

▌RÈGLES HCSF (obligatoires depuis juin 2024)
  • Taux d'endettement MAXIMUM : 35% (assurance comprise)
  • Durée MAXIMUM : 25 ans (résidence principale neuf/ancien)
                   27 ans si VEFA ou ancien avec ≥10% de travaux
  • Marge de flexibilité : 20% des dossiers peuvent dépasser le 35%
    (réservée aux primo-accédants en priorité par les banques)

▌APPORT — Repères marché actuel
  • Apport recommandé : 10% minimum (frais de notaire + garantie)
  • Apport idéal : ≥20% pour meilleure négociation taux
  • Sans apport : possible mais très rare, exige profil exceptionnel
    (haut revenu CDI, jeune cadre, perspective d'évolution)

▌PROFILS PROFESSIONNELS — Position des banques
  • CDI hors période d'essai : standard, dossier classique
  • Fonctionnaire titulaire : profil préféré (sécurité revenu)
  • CDD / Intérim : exclu sauf 2-3 ans d'historique stable
  • Indépendant : 2 années de bilans minimum exigées
  • Profession libérale / auto-entrepreneur : 3 années de bilans
  • Période d'essai CDI : attendre la titularisation

▌DISPOSITIFS PRIMO-ACCÉDANT (résidence principale, sous conditions)
  • PTZ (Prêt à Taux Zéro) : prolongé jusqu'au 31/12/2027
    - Réservé aux primo-accédants
    - Plafonds de revenus selon zone (A bis/A/B1/B2/C)
    - Quotité : 20% à 50% selon zone + revenus
  • Prêt Accession Sociale (PAS) : moins de 38 000€ revenus
  • Prêt 1% Logement (Action Logement) : entreprises ≥10 salariés

▌FISCALITÉ INVESTISSEMENT LOCATIF
  • LMNP (Loueur Meublé Non Professionnel) : amortissement comptable
  • Pinel : terminé fin 2024, remplacé par "Pinel +" puis arrêté
  • Denormandie : centres-villes anciens à rénover
  • Déficit foncier : jusqu'à 21 400€/an déductibles

▌FRAIS ACQUISITION (à anticiper en plus du prix du bien)
  • Ancien : 7-8% du prix (frais de notaire dont droits mutation 5,80%)
  • Neuf / VEFA : 2-3% du prix (TVA récupérable selon dispositif)
  • Garantie : 0,5-1,5% du prêt (caution Crédit Logement ou hypothèque)
  • Frais de dossier banque : 500-1500€ (souvent négociables)

▌CONFORMITÉ IOBSP (obligatoire pour le courtier)
  • Inscription ORIAS obligatoire
  • Devoir de conseil documenté à chaque étape
  • Archivage des dossiers 5 ans minimum
  • Mention obligatoire en fin d'email : "Conseiller IOBSP n° [...]"
  • Information précontractuelle obligatoire avant proposition
`

export const EXPERTISE_SUISSE = `
═══════════════════════════════════════════════════════════
  EXPERTISE FINANCEMENT HYPOTHÉCAIRE SUISSE
═══════════════════════════════════════════════════════════

▌RÈGLES BANCAIRES SUISSES (FINMA)
  • Fonds propres MINIMUM : 20% du prix d'achat
    - dont 10% MINIMUM en fonds propres "durs"
      (épargne hors 2e pilier LPP)
    - jusqu'à 10% peuvent venir du 2e pilier (retrait/nantissement)
  • Charges THÉORIQUES maximum : 33% du revenu brut
    Calcul : (intérêts 5% + amortissement 1% + entretien 1%) ≤ 33% revenu
  • Amortissement : 2e rang doit être amorti en 15 ans MAX

▌2e PILIER (LPP) — Utilisation pour l'achat
  • Retrait anticipé : possible pour résidence principale
    - Plafond 50% de l'avoir LPP jusqu'à 50 ans
    - 100% au-delà
  • Nantissement : préserve la prévoyance (souvent préféré)
  • Conséquence retrait : baisse de la rente future

▌3e PILIER A — Optimisation fiscale
  • Versements déductibles fiscalement (max 7'258 CHF/an salariés)
  • Versements indépendants : 20% revenu, max 36'288 CHF/an
  • Retrait possible pour résidence principale

▌FRONTALIERS FRANCE-SUISSE
  • Banques suisses : exigences spécifiques
    - Revenus en CHF ou conversion à taux conservateur
    - Apport souvent supérieur (25-30%) demandé
    - Conditions de séjour (permis G, B, C)
  • Banques françaises : peuvent prêter en EUR sur bien suisse
    rarement, et exigent garanties renforcées

▌FRAIS ACQUISITION (variable par canton)
  • Droits de mutation : 0% (ex: Zurich) à 3,3% (Genève)
  • Émoluments notaire : 0,1-1% selon canton
  • Frais inscription registre foncier : 0,1-0,3%
  • Cédule hypothécaire : 0,1-0,4%

▌ASSURANCES (souvent demandées)
  • Assurance solde restant dû (équivalent ADI française)
  • Assurance bâtiment cantonale (souvent monopole)
  • LAMAL : assurance maladie obligatoire (indépendante du prêt)
`

export const PROFIL_RISQUE = `
═══════════════════════════════════════════════════════════
  ANALYSE DE RISQUE — Drapeaux à détecter
═══════════════════════════════════════════════════════════

🔴 DRAPEAUX ROUGES (probablement non finançable en l'état)
  • Endettement actuel + futur > 35% (France) / 33% (Suisse)
  • Apport < 5% du prix (France) ou < 20% (Suisse)
  • CDD / intérim sans 2 ans d'historique
  • Période d'essai CDI en cours
  • Profession libérale < 3 ans de bilans
  • Découverts bancaires répétés (à demander)
  • Inscription FICP (à vérifier)

🟡 DRAPEAUX JAUNES (dossier complexe mais réalisable)
  • Endettement 25-35% : marge faible, soigner le dossier
  • Apport entre 5 et 10% : à compenser par revenus solides
  • Couple avec un CDI + un indépendant : focus sur le CDI
  • Mensualité future > 30% revenu : justifier le reste à vivre
  • Bien atypique (loft, maison ossature bois, etc.) : valorisation
  • Primo-accédant jeune (<28 ans) : prévoir explication évolution carrière

🟢 INDICATEURS POSITIFS À METTRE EN AVANT
  • Compromis déjà signé : urgence + sérieux
  • Accord de principe d'une autre banque : argument de négociation
  • Apport ≥ 20% : marge de manœuvre sur le taux
  • Couple CDI sans enfants : capacité d'épargne future
  • Reste à vivre confortable (>1500€/personne après mensualités)
  • Stabilité géographique (>3 ans même logement)
`

export const RAPPELS_COURTIER = `
═══════════════════════════════════════════════════════════
  RAPPELS PRATIQUES POUR LE COURTIER
═══════════════════════════════════════════════════════════

▌AVANT TOUTE PROPOSITION
  Vérifier : situation pro, revenus 3 derniers mois, apport disponible,
  crédits en cours, situation maritale, projet précis.

▌DOCUMENTS À DEMANDER SYSTÉMATIQUEMENT (France)
  1. CNI / passeport
  2. 3 derniers bulletins de salaire
  3. Dernier avis d'imposition
  4. 3 derniers relevés bancaires (tous comptes)
  5. Justificatif de domicile < 3 mois
  6. Compromis ou promesse de vente
  7. Si crédits en cours : tableaux d'amortissement
  8. Si apport : justificatif d'origine des fonds (épargne, donation, héritage)

▌DOCUMENTS COMPLÉMENTAIRES SELON CAS
  • Couple : situation des deux + livret de famille
  • Indépendant : 2-3 bilans + liasses fiscales
  • Investissement locatif : étude locative + bail si existant
  • VEFA : appel de fonds + acte de réservation
  • Travaux : devis détaillés
`

// ═══════════════════════════════════════════════════════════════════════
//  Helpers pour injecter dans les prompts
// ═══════════════════════════════════════════════════════════════════════

/**
 * Détecte la juridiction probable depuis le texte / qualification.
 * Heuristique simple — ne remplace pas une saisie explicite.
 */
export function detectJurisdiction(text: string): 'FR' | 'CH' | 'unknown' {
  const t = text.toLowerCase()
  const swissCues = /\b(genève|geneve|lausanne|zurich|berne|bâle|sion|fribourg|chf|suisse|lpp|lamal|cédule|frontalier|permis [gbcl])\b/
  const frenchCues = /\b(paris|lyon|marseille|toulouse|bordeaux|nantes|lille|strasbourg|rennes|nice|cdi|cdd|orias|iobsp|ptz|pinel|denormandie)\b/

  if (swissCues.test(t)) return 'CH'
  if (frenchCues.test(t)) return 'FR'
  return 'unknown'
}

/**
 * Compactée pour injection dans les system prompts — version condensée
 * de l'expertise pour ne pas exploser les tokens à chaque appel.
 */
export function buildExpertiseContext(jurisdiction: 'FR' | 'CH' | 'unknown' = 'unknown'): string {
  if (jurisdiction === 'FR') {
    return `\n\nCONNAISSANCES MÉTIER À UTILISER (France) :\n${EXPERTISE_FRANCE}\n${PROFIL_RISQUE}`
  }
  if (jurisdiction === 'CH') {
    return `\n\nCONNAISSANCES MÉTIER À UTILISER (Suisse) :\n${EXPERTISE_SUISSE}\n${PROFIL_RISQUE}`
  }
  return `\n\nCONNAISSANCES MÉTIER À UTILISER :\n${EXPERTISE_FRANCE}\n${EXPERTISE_SUISSE}\n${PROFIL_RISQUE}`
}

// ═══════════════════════════════════════════════════════════════════════
//  Évaluation déterministe de la complétude du profil
//  Utilisée par l'agent prospection pour adapter l'email
// ═══════════════════════════════════════════════════════════════════════

export interface CompletenessAnalysis {
  level: 'complete' | 'partial' | 'incomplete'
  score: number              // 0-100
  missing: string[]          // labels des champs manquants critiques
  redFlags: string[]         // signaux d'alerte si détectés
  greenFlags: string[]       // signaux positifs si détectés
}

interface QLite {
  firstName: string | null
  email: string | null
  phone: string | null
  monthly_income: number | null
  down_payment: number | null
  existing_debts_monthly: number | null
  employment_status: string | null
  price: number | null
  propertyType: string | null
  address: string | null
  purchase_timeline: string | null
  financing_status: string | null
  urgencySignals?: string[]
}

export function analyzeCompleteness(q: QLite): CompletenessAnalysis {
  const missing: string[] = []
  const redFlags: string[] = []
  const greenFlags: string[] = []
  let score = 0

  // Champs critiques pour évaluer la bancabilité
  if (q.monthly_income !== null) score += 18; else missing.push('revenus mensuels')
  if (q.down_payment !== null)   score += 18; else missing.push('apport personnel')
  if (q.employment_status)       score += 15; else missing.push('situation professionnelle')
  if (q.price !== null)          score += 12; else missing.push('prix / budget du bien')
  if (q.existing_debts_monthly !== null) score += 10; else missing.push('crédits en cours')
  if (q.address)                 score += 8;  else missing.push('localisation du bien')
  if (q.propertyType)            score += 7;  else missing.push('type de bien')
  if (q.purchase_timeline)       score += 6;  else missing.push('délai d\'achat')
  if (q.email || q.phone)        score += 6
  if (q.firstName)               score += 0   // bonus mais pas critique

  // Drapeaux rouges
  if (q.down_payment !== null && q.price !== null) {
    const apportPct = (q.down_payment / q.price) * 100
    if (apportPct < 5) redFlags.push('apport très insuffisant (< 5% du prix)')
    else if (apportPct < 10) redFlags.push('apport limité (< 10% du prix)')
  }
  if (q.existing_debts_monthly !== null && q.monthly_income !== null && q.monthly_income > 0) {
    const debtRatio = (q.existing_debts_monthly / q.monthly_income) * 100
    if (debtRatio > 25) redFlags.push(`endettement actuel élevé (${Math.round(debtRatio)}%)`)
  }
  if (q.employment_status === 'cdd' || q.employment_status === 'sans_emploi') {
    redFlags.push(`situation professionnelle fragile (${q.employment_status})`)
  }

  // Drapeaux verts
  if (q.employment_status === 'cdi' || q.employment_status === 'fonctionnaire') {
    greenFlags.push('emploi stable')
  }
  if (q.down_payment !== null && q.price !== null) {
    const apportPct = (q.down_payment / q.price) * 100
    if (apportPct >= 20) greenFlags.push('apport solide (≥ 20%)')
  }
  if (q.existing_debts_monthly === 0) {
    greenFlags.push('aucun crédit en cours')
  }
  if (q.urgencySignals?.some(s => /compromis/i.test(s))) {
    greenFlags.push('compromis signé — dossier mature')
  }
  if (q.financing_status === 'obtained') {
    greenFlags.push('accord de principe déjà obtenu')
  }

  const level: CompletenessAnalysis['level'] =
    score >= 75 ? 'complete' :
    score >= 45 ? 'partial' :
    'incomplete'

  return { level, score: Math.min(score, 100), missing, redFlags, greenFlags }
}
