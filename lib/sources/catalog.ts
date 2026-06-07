// ════════════════════════════════════════════════════════════════════════
//  Catalogue des sources de leads disponibles dans BankKey
// ════════════════════════════════════════════════════════════════════════

export type SourceStatus = 'available' | 'forwarding' | 'coming_soon' | 'beta'

export interface SourceDefinition {
  id: string
  name: string
  category: SourceCategory
  description: string
  status: SourceStatus
  /** URL d'icône publique ou null (on affichera initiales sinon) */
  logoEmoji?: string
  /** Si "forwarding", instructions à montrer */
  forwardingInstructions?: string
}

export type SourceCategory =
  | 'email'
  | 'aggregator'
  | 'portal'
  | 'crm'
  | 'direct'

export const CATEGORY_LABELS: Record<SourceCategory, string> = {
  email:      'Boîtes mail',
  aggregator: 'Agrégateurs de leads',
  portal:     'Portails immobiliers',
  crm:        'CRM courtage',
  direct:     'Sources directes',
}

export const CATEGORY_DESCRIPTIONS: Record<SourceCategory, string> = {
  email:      'Connectez vos boîtes mail pour ingestion automatique',
  aggregator: 'Empruntis, Meilleurtaux, Pretto — leads payants',
  portal:     'SeLoger, Leboncoin, BienIci — demandes prospects',
  crm:        'Synchronisez avec votre CRM courtage existant',
  direct:     'Formulaires site web, WhatsApp, LinkedIn, apporteurs',
}

// ── Catalogue ────────────────────────────────────────────────────────

export const SOURCE_CATALOG: SourceDefinition[] = [

  // ─── EMAIL ────────────────────────────────────────────────────────
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'email',
    description: 'Google Workspace ou Gmail personnel',
    status: 'available',
  },
  {
    id: 'outlook',
    name: 'Outlook 365',
    category: 'email',
    description: 'Microsoft 365 / Outlook.com',
    status: 'coming_soon',
  },
  {
    id: 'imap',
    name: 'IMAP générique',
    category: 'email',
    description: 'Tout fournisseur compatible IMAP (Yahoo, OVH, etc.)',
    status: 'coming_soon',
  },

  // ─── AGRÉGATEURS ──────────────────────────────────────────────────
  {
    id: 'empruntis',
    name: 'Empruntis',
    category: 'aggregator',
    description: 'Leads achetés sur la plateforme Empruntis',
    status: 'forwarding',
    forwardingInstructions: 'Configurez l\'envoi automatique des notifications Empruntis vers votre adresse BankKey ci-dessus.',
  },
  {
    id: 'meilleurtaux',
    name: 'Meilleurtaux',
    category: 'aggregator',
    description: 'Leads issus de Meilleurtaux',
    status: 'forwarding',
    forwardingInstructions: 'Forwarding des emails de leads Meilleurtaux vers votre adresse BankKey.',
  },
  {
    id: 'pretto',
    name: 'Pretto',
    category: 'aggregator',
    description: 'Leads issus de Pretto',
    status: 'forwarding',
    forwardingInstructions: 'Forwarding des notifications Pretto vers votre adresse BankKey.',
  },
  {
    id: 'helloprêt',
    name: 'Helloprêt',
    category: 'aggregator',
    description: 'Leads issus de Helloprêt',
    status: 'forwarding',
  },

  // ─── PORTAILS IMMO ────────────────────────────────────────────────
  {
    id: 'seloger',
    name: 'SeLoger',
    category: 'portal',
    description: 'Demandes prospects via SeLoger',
    status: 'forwarding',
    forwardingInstructions: 'Configurez votre boîte SeLoger pour forwarder les messages vers BankKey.',
  },
  {
    id: 'leboncoin',
    name: 'Leboncoin Immobilier',
    category: 'portal',
    description: 'Demandes via annonces Leboncoin',
    status: 'forwarding',
  },
  {
    id: 'bienici',
    name: 'BienIci',
    category: 'portal',
    description: 'Plateforme immobilière BienIci',
    status: 'forwarding',
  },

  // ─── CRM ─────────────────────────────────────────────────────────
  {
    id: 'aprico',
    name: 'Aprico',
    category: 'crm',
    description: 'CRM courtage Aprico — synchronisation bidirectionnelle',
    status: 'coming_soon',
  },
  {
    id: 'marketis',
    name: 'Marketis',
    category: 'crm',
    description: 'CRM courtage Marketis',
    status: 'coming_soon',
  },
  {
    id: 'logiciel_courtier',
    name: 'Logiciel-courtier.fr',
    category: 'crm',
    description: 'Solution Logiciel-courtier.fr (IOBSP)',
    status: 'coming_soon',
  },

  // ─── DIRECT ──────────────────────────────────────────────────────
  {
    id: 'web_form',
    name: 'Formulaire site web',
    category: 'direct',
    description: 'Embed un formulaire de contact sur votre site',
    status: 'coming_soon',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'direct',
    description: 'Conversion automatique des messages WhatsApp Business',
    status: 'coming_soon',
  },
  {
    id: 'webhook',
    name: 'Webhook personnalisé',
    category: 'direct',
    description: 'Intégration sur mesure via API REST',
    status: 'beta',
  },
  {
    id: 'forwarding',
    name: 'Email forwarding',
    category: 'direct',
    description: 'Faites suivre n\'importe quel email à votre adresse BankKey',
    status: 'available',
  },
]

export function getSourcesByCategory(category: SourceCategory): SourceDefinition[] {
  return SOURCE_CATALOG.filter(s => s.category === category)
}

export function getSourceById(id: string): SourceDefinition | undefined {
  return SOURCE_CATALOG.find(s => s.id === id)
}
