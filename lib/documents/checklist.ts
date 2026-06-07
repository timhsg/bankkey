import type {
  QualificationResult,
  DocumentChecklistResult,
  DocumentGroup,
  DocumentItem,
} from '@/types'

// ────────────────────────────────────────────────────────────────────────────
//  Documents requis pour un dossier de crédit immobilier
//  Sources : Crédit Agricole, Meilleurtaux, Pretto (FR) ; Milenia, Credial (CH)
//  Logique déterministe — pas d'appel LLM, latence < 1ms
// ────────────────────────────────────────────────────────────────────────────

function detectJurisdiction(q: QualificationResult): 'FR' | 'CH' | 'unknown' {
  const text = [
    q.address ?? '',
    q.description ?? '',
    q.contactInfo ?? '',
    q.phone ?? '',
  ].join(' ').toLowerCase()

  // Indices suisses
  const swissCities = ['genève', 'geneve', 'lausanne', 'zurich', 'berne', 'bâle', 'bale', 'fribourg', 'sion', 'neuchâtel', 'neuchatel', 'lugano']
  if (swissCities.some(c => text.includes(c))) return 'CH'
  if (text.includes('chf')) return 'CH'
  if (text.includes('lamal') || text.includes('lpp') || text.includes('avs')) return 'CH'
  if (text.includes('permis b') || text.includes('permis c')) return 'CH'
  if (/\+?41[\s\d]/.test(q.phone ?? '')) return 'CH'
  if (q.phone?.startsWith('07') && (text.includes('suisse') || text.includes('switzerland'))) return 'CH'

  // Indices français
  const frenchCities = ['paris', 'lyon', 'marseille', 'bordeaux', 'toulouse', 'nantes', 'lille', 'strasbourg', 'nice', 'montpellier', 'rennes']
  if (frenchCities.some(c => text.includes(c))) return 'FR'
  if (text.includes('€') && !text.includes('chf')) return 'FR'
  if (/\+?33[\s\d]/.test(q.phone ?? '')) return 'FR'
  if (q.phone?.startsWith('06') || q.phone?.startsWith('07')) return 'FR'

  return 'unknown'
}

function isIndependant(q: QualificationResult): boolean {
  const text = `${q.description} ${q.motivationSignals.join(' ')}`.toLowerCase()
  return /indép|freelance|auto-?entrepreneur|gérant|profession lib|libéral|entrepreneur/.test(text)
}

function isCouple(q: QualificationResult): boolean {
  const text = `${q.description} ${q.motivationSignals.join(' ')}`.toLowerCase()
  return /couple|conjoint|époux|épouse|conjointe|conjoint|tous les deux|tous deux|nous cherchons|nous avons|notre/.test(text)
}

function hasCompromis(q: QualificationResult): boolean {
  const signals = q.urgencySignals.map(s => s.toLowerCase()).join(' ')
  const text = `${q.description} ${signals}`.toLowerCase()
  return /compromis|promesse de vente|sous seing/.test(text)
}

function isConstruction(q: QualificationResult): boolean {
  const text = `${q.description} ${q.propertyType ?? ''}`.toLowerCase()
  return /construction|terrain|vefa|sur plan|neuf à construire/.test(text)
}

function isRenovation(q: QualificationResult): boolean {
  const text = `${q.description}`.toLowerCase()
  return /rénovation|renovation|travaux|à rénover/.test(text)
}

// ────────────────────────────────────────────────────────────────────────────

export function generateDocumentChecklist(q: QualificationResult): DocumentChecklistResult {
  const jurisdiction = detectJurisdiction(q)
  const independant = isIndependant(q)
  const couple = isCouple(q)
  const compromis = hasCompromis(q)
  const construction = isConstruction(q)
  const renovation = isRenovation(q)

  const groups: DocumentGroup[] = []

  // ── Groupe 1 : Identité & situation ───────────────────────────────────
  const identityItems: DocumentItem[] = [
    {
      name: jurisdiction === 'CH'
        ? 'Pièce d\'identité (CNI/passeport) ou permis de séjour'
        : 'Pièce d\'identité (CNI, passeport ou titre de séjour)',
      required: true,
    },
    {
      name: 'Justificatif de domicile de moins de 3 mois',
      required: true,
      hint: 'Facture électricité/gaz/eau ou quittance de loyer',
    },
  ]
  if (couple) {
    identityItems.push({
      name: 'Livret de famille ou attestation PACS',
      required: true,
      hint: 'Ou jugement de divorce si applicable',
    })
  }
  groups.push({ category: 'Identité & situation', items: identityItems })

  // ── Groupe 2 : Revenus & emploi ───────────────────────────────────────
  const incomeItems: DocumentItem[] = []
  if (independant) {
    incomeItems.push(
      { name: '3 dernières liasses fiscales complètes', required: true, hint: 'Bilans + comptes de résultat' },
      { name: 'Extrait Kbis ou avis SIRENE de moins de 3 mois', required: true },
      { name: '3 derniers avis d\'imposition', required: true },
    )
  } else {
    if (jurisdiction === 'CH') {
      incomeItems.push(
        { name: '3 dernières fiches de salaire', required: true, hint: '6 fiches si salaire à l\'heure' },
        { name: 'Contrat de travail (ou attestation d\'employeur)', required: true },
        { name: 'Certificat de salaire annuel', required: false },
      )
    } else {
      incomeItems.push(
        { name: '3 derniers bulletins de salaire', required: true },
        { name: '2 derniers avis d\'imposition', required: true },
        { name: 'Contrat de travail (si CDD ou < 1 an d\'ancienneté)', required: false },
      )
    }
  }
  if (couple) {
    incomeItems.push({
      name: 'Mêmes documents pour le co-emprunteur',
      required: true,
      hint: 'Les deux profils sont analysés ensemble',
    })
  }
  groups.push({ category: 'Revenus & emploi', items: incomeItems })

  // ── Groupe 3 : Patrimoine & comptes ───────────────────────────────────
  const wealthItems: DocumentItem[] = [
    { name: '3 derniers relevés de TOUS les comptes bancaires', required: true, hint: 'Y compris comptes joints et épargne' },
    { name: 'Justificatif de l\'apport personnel', required: true, hint: 'Relevés d\'épargne, donations, etc.' },
    { name: 'Tableaux d\'amortissement des crédits en cours', required: false, hint: 'Si crédit immobilier/conso en cours' },
  ]
  if (jurisdiction === 'CH') {
    wealthItems.push(
      { name: 'Attestations LPP / 3e pilier', required: true, hint: 'Avoirs de prévoyance' },
      { name: 'Attestations primes assurance maladie (LAMAL)', required: true },
    )
  }
  groups.push({ category: 'Patrimoine & comptes', items: wealthItems })

  // ── Groupe 4 : Projet immobilier ──────────────────────────────────────
  const projectItems: DocumentItem[] = []
  if (compromis) {
    projectItems.push({
      name: '⚡ Compromis de vente signé',
      required: true,
      hint: 'Délai contractuel — à fournir en priorité',
    })
  } else {
    projectItems.push({
      name: 'Compromis de vente (dès signature)',
      required: true,
      hint: 'Document central du dossier',
    })
  }
  if (construction) {
    projectItems.push(
      { name: 'Contrat de construction (CCMI ou marché de travaux)', required: true },
      { name: 'Permis de construire', required: true },
      { name: 'Plan + descriptif technique', required: false },
    )
  }
  if (renovation) {
    projectItems.push(
      { name: 'Devis détaillés des travaux (artisans qualifiés RGE)', required: true },
      { name: 'Diagnostics techniques (DPE, plomb, amiante)', required: true },
    )
  }
  if (!construction && !renovation) {
    projectItems.push({
      name: 'Diagnostics techniques du bien (DPE, etc.)',
      required: false,
      hint: 'Fourni par le vendeur',
    })
  }
  groups.push({ category: 'Projet immobilier', items: projectItems })

  // ── Calcul de la complétude estimée ───────────────────────────────────
  let knownPoints = 0
  let totalPoints = 0
  const checks: [boolean, number][] = [
    [!!q.firstName && !!q.lastName, 10],
    [!!q.email, 10],
    [!!q.phone, 10],
    [!!q.address, 8],
    [!!q.price, 12],
    [!!q.propertyType, 6],
    [!!q.purchase_timeline, 8],
    [!!q.financing_status, 10],
    [q.motivationSignals.length > 0, 8],
    [q.urgencySignals.length > 0, 8],
    [!!q.surface || !!q.rooms, 5],
    [!!q.description, 5],
  ]
  for (const [has, weight] of checks) {
    totalPoints += weight
    if (has) knownPoints += weight
  }
  const estimatedCompleteness = Math.round((knownPoints / totalPoints) * 100)

  return {
    jurisdiction,
    urgency: compromis ? 'urgent' : 'normal',
    groups,
    estimatedCompleteness,
  }
}
