export type SectorId = 'credit'

export interface SectorConfig {
  id: SectorId
  label: string
  emoji: string
  placeholder: string
  example: string
  /** Injected into the qualification system prompt */
  context: string
}

export const SECTORS: Record<SectorId, SectorConfig> = {
  credit: {
    id: 'credit',
    label: 'Crédit Immobilier',
    emoji: '🏦',
    placeholder: 'Demande de financement, email prospect emprunteur…',
    example: `Bonjour, nous cherchons un courtier pour financer notre résidence principale. En couple, tous les deux en CDI. Revenus nets combinés : 5 800€/mois. Bien ciblé à Genève pour 850 000 CHF, apport disponible 170 000 CHF. Compromis signé la semaine dernière, délai 45 jours. Aucun crédit en cours, endettement quasi nul. Joignable : Camille Martin — camille.martin@email.fr — 078 98 76 54 32`,
    context: `Courtage crédit immobilier. Évalue UNIQUEMENT la bancabilité : revenus nets (ceux en CDI/fonctionnaire sont forts), apport (idéal > 20%), endettement actuel (max 35%), situation professionnelle (CDI > indépendant > CDD), maturité du projet (compromis signé = URGENT). Extraction stricte : pas d'interprétation. Pour le type, TOUJOURS "acheteur" (emprunteur = acheteur immobilier).`,
  },
}
