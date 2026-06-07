import type { BrokerMemory } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  Utilitaires pour la mémoire courtier
//  - Construction du bloc contexte injecté dans les prompts IA
//  - Génération de la signature email à partir des champs
// ════════════════════════════════════════════════════════════════════════

/**
 * Construit un bloc de contexte texte à injecter dans les prompts des agents
 * (qualification, scoring, prospection). Permet à l'IA d'adapter le ton, la
 * signature, et de connaître les contraintes du cabinet.
 */
export function buildBrokerContext(memory: BrokerMemory | null | undefined): string {
  if (!memory) return ''

  const lines: string[] = []

  // Identité
  if (memory.fullName) lines.push(`Courtier : ${memory.fullName}${memory.jobTitle ? ` (${memory.jobTitle})` : ''}`)
  if (memory.agencyName) lines.push(`Cabinet : ${memory.agencyName}`)
  if (memory.agencyAddress) lines.push(`Adresse : ${memory.agencyAddress}`)
  if (memory.websiteUrl) lines.push(`Site web : ${memory.websiteUrl}`)

  // Spécialisation
  if (memory.zones?.length) lines.push(`Zones d'intervention : ${memory.zones.join(', ')}`)
  if (memory.specialties?.length) lines.push(`Spécialités : ${memory.specialties.join(', ')}`)
  if (memory.bankPartners?.length) lines.push(`Banques partenaires : ${memory.bankPartners.join(', ')}`)

  // Style
  const toneLabel = memory.tone === 'friendly' ? 'chaleureux et personnel'
                  : memory.tone === 'concise'  ? 'direct et concis'
                  : 'professionnel et institutionnel'
  lines.push(`Ton à utiliser : ${toneLabel}`)

  if (memory.vouvoiement === false) {
    lines.push('Forme : tutoiement')
  } else {
    lines.push('Forme : vouvoiement (par défaut)')
  }

  // Règles
  if (memory.minIncome) lines.push(`Seuil de revenus accepté : à partir de ${memory.minIncome.toLocaleString('fr-FR')} €/mois`)
  if (memory.maxProjectAmount) lines.push(`Montant max de dossier : ${memory.maxProjectAmount.toLocaleString('fr-FR')} €`)

  // Notes libres
  if (memory.notes) {
    lines.push('')
    lines.push('Instructions spéciales du courtier :')
    lines.push(memory.notes)
  }

  if (lines.length === 0) return ''

  return `\n═══ CONTEXTE DU CABINET DE COURTAGE ═══\n${lines.join('\n')}\n═══════════════════════════════════════\n`
}

/**
 * Construit le bloc de signature email à insérer en fin de message rédigé.
 * Si l'IA voit [SIGNATURE] dans son output, on remplace par ce bloc.
 */
export function buildEmailSignature(memory: BrokerMemory | null | undefined): string {
  if (!memory) return 'Cordialement,\n[votre prénom] — [nom de votre cabinet]'

  // Si une signature personnalisée existe, l'utiliser telle quelle
  if (memory.signatureEmail) return memory.signatureEmail

  // Sinon, en construire une à partir des champs
  const lines: string[] = []
  lines.push('Cordialement,')

  if (memory.fullName) lines.push(memory.fullName)
  if (memory.jobTitle) lines.push(memory.jobTitle)
  if (memory.agencyName) lines.push(memory.agencyName)
  if (memory.signaturePhone) lines.push(`Tél. : ${memory.signaturePhone}`)
  if (memory.websiteUrl) lines.push(memory.websiteUrl)
  if (memory.iobspNumber) lines.push(`IOBSP n° ${memory.iobspNumber}`)

  return lines.join('\n')
}

/**
 * Applique la signature et autres remplacements sur un email rédigé par l'IA.
 * L'IA est instruite d'utiliser des placeholders : [SIGNATURE], [PRENOM_COURTIER]
 */
export function applyBrokerMemoryToEmail(
  emailBody: string,
  memory: BrokerMemory | null | undefined,
): string {
  let result = emailBody

  // Remplacement de la signature
  const signature = buildEmailSignature(memory)
  result = result.replace(/\[SIGNATURE\]/g, signature)

  // Remplacement du prénom courtier (legacy)
  if (memory?.fullName) {
    const firstName = memory.fullName.split(' ')[0]
    result = result.replace(/\[votre prénom\]/gi, firstName)
    result = result.replace(/\[PRENOM_COURTIER\]/g, firstName)
  }

  // Remplacement du nom du cabinet (legacy)
  if (memory?.agencyName) {
    result = result.replace(/\[nom de votre agence\]/gi, memory.agencyName)
    result = result.replace(/\[CABINET\]/g, memory.agencyName)
  }

  return result
}

/**
 * Construit la grille de scoring personnalisée pour injection dans le prompt
 */
export function buildScoringWeights(memory: BrokerMemory | null | undefined): string {
  const w = memory?.scoring_weights
  if (!w) return ''

  const defaults = {
    employment_situation: 25,
    down_payment: 25,
    debt_ratio: 20,
    project_maturity: 20,
    contact_completeness: 10,
  }

  const final = { ...defaults, ...w }
  const total = Object.values(final).reduce((s, v) => s + v, 0)

  return `\n═══ PONDÉRATION PERSONNALISÉE DU CABINET ═══
Le courtier a paramétré ses propres priorités. Adapte le score sur 100 selon ces poids :
- Situation pro (CDI, fonctionnaire, indépendant) : ${final.employment_situation} pts max
- Apport personnel (en % du prix) : ${final.down_payment} pts max
- Taux d'endettement (charges/revenus) : ${final.debt_ratio} pts max
- Maturité du projet (compromis signé, financing) : ${final.project_maturity} pts max
- Complétude du contact (email + tél) : ${final.contact_completeness} pts max

Total maximum : ${total} pts (normalise à 100 si différent)
══════════════════════════════════════════\n`
}

/**
 * Vérifie si la mémoire courtier est suffisamment remplie pour personnaliser.
 * Sert à afficher un onboarding "complétez votre profil" dans le dashboard.
 */
export function isBrokerMemoryComplete(memory: BrokerMemory | null | undefined): boolean {
  if (!memory) return false
  return !!(memory.fullName && memory.agencyName && memory.signaturePhone)
}

/**
 * Score de complétude 0-100 — pour afficher une jauge "Votre profil à 60% complet"
 */
export function brokerMemoryCompleteness(memory: BrokerMemory | null | undefined): number {
  if (!memory) return 0

  const checks: [boolean, number][] = [
    [!!memory.fullName,        15],
    [!!memory.jobTitle,         5],
    [!!memory.agencyName,      15],
    [!!memory.agencyAddress,   10],
    [!!memory.signaturePhone,  10],
    [!!memory.websiteUrl,       5],
    [!!memory.iobspNumber,      5],
    [(memory.zones?.length ?? 0) > 0,        10],
    [(memory.specialties?.length ?? 0) > 0,  10],
    [(memory.bankPartners?.length ?? 0) > 0, 10],
    [!!memory.tone,             5],
  ]

  let earned = 0
  let total  = 0
  for (const [has, weight] of checks) {
    total += weight
    if (has) earned += weight
  }
  return Math.round((earned / total) * 100)
}
