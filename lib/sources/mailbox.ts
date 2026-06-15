// ════════════════════════════════════════════════════════════════════════
//  Catalogue des boîtes mail / canaux d'ingestion disponibles
// ════════════════════════════════════════════════════════════════════════

export type ChannelStatus = 'live' | 'beta' | 'roadmap_q3' | 'roadmap_q4' | 'on_request'

export interface MailChannel {
  id: string
  name: string
  description: string
  status: ChannelStatus
  category: 'oauth' | 'imap' | 'forwarding' | 'api'
  connectUrl?: string  // Si live : URL de connexion
}

export const MAIL_CHANNELS: MailChannel[] = [

  // ─── OAuth (un clic) ─────────────────────────────────────────────
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Google Workspace ou Gmail personnel — connexion sécurisée en 30 secondes',
    status: 'live',
    category: 'oauth',
    connectUrl: '/api/gmail/connect',
  },
  {
    id: 'outlook',
    name: 'Outlook 365',
    description: 'Microsoft 365 / Outlook.com — connexion OAuth Microsoft, comme Gmail',
    status: 'live',
    category: 'oauth',
    connectUrl: '/api/outlook/connect',
  },

  // ─── IMAP (mot de passe d'application) ──────────────────────────
  {
    id: 'imap-yahoo',
    name: 'Yahoo Mail',
    description: 'Connexion par mot de passe d\'application Yahoo',
    status: 'roadmap_q3',
    category: 'imap',
  },
  {
    id: 'imap-icloud',
    name: 'Apple iCloud Mail',
    description: 'Connexion par mot de passe spécifique iCloud',
    status: 'roadmap_q3',
    category: 'imap',
  },
  {
    id: 'imap-ovh',
    name: 'OVHcloud Mail Pro',
    description: 'Boîtes professionnelles OVH — IMAP standard',
    status: 'roadmap_q3',
    category: 'imap',
  },
  {
    id: 'imap-protonmail',
    name: 'ProtonMail',
    description: 'Via Proton Bridge (Plus / Business)',
    status: 'roadmap_q3',
    category: 'imap',
  },
  {
    id: 'imap-generic',
    name: 'IMAP générique',
    description: 'Tout fournisseur IMAP standard (Infomaniak, Free Pro, OneCom, etc.)',
    status: 'roadmap_q3',
    category: 'imap',
  },

  // ─── Forwarding (universel mais manuel) ─────────────────────────
  {
    id: 'forwarding',
    name: 'Transfert email (toute source)',
    description: 'Une adresse BankKey unique. Créez une règle de transfert auto depuis Outlook, Empruntis, SeLoger, Pretto, Meilleurtaux ou n\'importe quelle boîte — les leads arrivent ici. Marche partout, sans connexion.',
    status: 'live',
    category: 'forwarding',
  },

  // ─── API / Webhook ──────────────────────────────────────────────
  {
    id: 'webhook',
    name: 'Webhook API',
    description: 'Push de leads depuis votre CRM, Zapier ou Make — endpoint REST',
    status: 'beta',
    category: 'api',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connectez 5000+ applications à BankKey via Zapier',
    status: 'on_request',
    category: 'api',
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    description: 'Workflows Make pour ingestion personnalisée',
    status: 'on_request',
    category: 'api',
  },
]

export const CATEGORY_INFO: Record<MailChannel['category'], { title: string; subtitle: string }> = {
  oauth:       { title: 'Connexion en un clic',  subtitle: 'OAuth officiel — le plus simple et le plus sûr' },
  imap:        { title: 'IMAP (mot de passe app)', subtitle: 'Pour les fournisseurs sans OAuth' },
  forwarding:  { title: 'Forwarding universel',  subtitle: 'Pour tout ce qui ne rentre pas ailleurs' },
  api:         { title: 'API / Automatisation',  subtitle: 'Pour les utilisateurs avancés et les CRMs' },
}

export const STATUS_INFO: Record<ChannelStatus, { label: string; tone: string }> = {
  live:        { label: 'Disponible',     tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  beta:        { label: 'Bêta privée',    tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  roadmap_q3:  { label: 'Q3 2026',        tone: 'bg-slate-100 text-slate-600 border-slate-200' },
  roadmap_q4:  { label: 'Q4 2026',        tone: 'bg-slate-100 text-slate-600 border-slate-200' },
  on_request:  { label: 'Sur demande',    tone: 'bg-amber-50 text-amber-700 border-amber-200' },
}
