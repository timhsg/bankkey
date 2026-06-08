import type { QualificationResult } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  Parser flexible de payload d'ingestion webhook
//
//  Reçoit un JSON arbitraire (Zapier, Make, formulaire web, CRM custom),
//  détecte les champs habituels et construit un objet normalisé.
//  Pour les cas vraiment custom, on garde le texte libre pour que le LLM
//  qualification s'en occupe en aval.
// ════════════════════════════════════════════════════════════════════════

// Mappings de noms de champs courants → champ canonique BankKey
const FIELD_ALIASES: Record<string, string[]> = {
  firstName: ['firstname', 'first_name', 'prenom', 'prénom', 'given_name', 'first', 'fname'],
  lastName:  ['lastname', 'last_name', 'nom', 'family_name', 'surname', 'last', 'lname'],
  fullName:  ['fullname', 'full_name', 'name', 'nom_complet', 'contact_name', 'lead_name'],
  email:     ['email', 'e-mail', 'mail', 'email_address', 'contact_email', 'lead_email', 'courriel'],
  phone:     ['phone', 'telephone', 'téléphone', 'mobile', 'cellphone', 'tel', 'phone_number', 'contact_phone'],
  address:   ['address', 'adresse', 'location', 'city', 'ville', 'lieu', 'zone'],
  price:     ['price', 'prix', 'budget', 'amount', 'montant', 'loan_amount', 'project_amount', 'projet_montant'],
  income:    ['income', 'revenus', 'revenu', 'monthly_income', 'salaire', 'salary'],
  downPayment: ['down_payment', 'apport', 'deposit', 'cash', 'apport_personnel'],
  employment: ['employment', 'profession', 'employment_status', 'situation_pro', 'job_status', 'statut_pro'],
  propertyType: ['property_type', 'type_bien', 'bien_type', 'asset_type'],
  message:   ['message', 'description', 'notes', 'comments', 'details', 'commentaire', 'demande'],
}

// Mapping des valeurs employment courantes
const EMPLOYMENT_VALUES: Record<string, QualificationResult['employment_status']> = {
  'cdi': 'cdi',
  'permanent': 'cdi',
  'fonctionnaire': 'fonctionnaire',
  'civil_servant': 'fonctionnaire',
  'public': 'fonctionnaire',
  'cdd': 'cdd',
  'temporary': 'cdd',
  'interim': 'cdd',
  'independant': 'independant',
  'independent': 'independant',
  'self_employed': 'independant',
  'freelance': 'independant',
  'tns': 'independant',
  'retraite': 'retraite',
  'retired': 'retraite',
  'pension': 'retraite',
  'sans_emploi': 'sans_emploi',
  'unemployed': 'sans_emploi',
  'jobseeker': 'sans_emploi',
}

interface ExtractResult {
  qualification: Partial<QualificationResult>
  rawTextForLLM: string  // Texte concaténé pour le LLM si besoin de re-qualifier
}

/**
 * Cherche une clé dans le payload, insensible à la casse et au snake_case
 */
function findField(payload: Record<string, unknown>, aliases: string[]): unknown {
  for (const key of Object.keys(payload)) {
    const normalized = key.toLowerCase().replace(/[-_\s]/g, '')
    for (const alias of aliases) {
      const aliasNorm = alias.toLowerCase().replace(/[-_\s]/g, '')
      if (normalized === aliasNorm) return payload[key]
    }
  }
  return undefined
}

function asString(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v.trim() || null
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return null
}

function asNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    // Nettoyer "350 000 €", "350.000 EUR", "350k", etc.
    const cleaned = v
      .replace(/[€$£CHF\s ]/g, '')
      .replace(/\.(?=\d{3})/g, '')  // supprime les séparateurs de milliers .
      .replace(/,(?=\d{3})/g, '')   // idem ,
      .replace(/,/, '.')             // virgule décimale → point
      .replace(/k$/i, '000')         // 350k → 350000
      .replace(/m$/i, '000000')      // 1.5m → 1500000
    const n = parseFloat(cleaned)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function flattenPayload(obj: unknown, depth = 0): Record<string, unknown> {
  if (depth > 3 || obj === null || typeof obj !== 'object') return {}
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const nested = flattenPayload(val, depth + 1)
      for (const [nk, nv] of Object.entries(nested)) {
        out[nk] = nv
      }
      // Aussi accepter la version aplatie : prospect.email → email
      out[key] = val
    } else {
      out[key] = val
    }
  }
  return out
}

/**
 * Extrait les champs canoniques d'un payload arbitraire
 */
export function extractFromPayload(rawPayload: unknown): ExtractResult {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return {
      qualification: { description: typeof rawPayload === 'string' ? rawPayload : '' },
      rawTextForLLM: typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload ?? {}),
    }
  }

  const flat = flattenPayload(rawPayload)

  // Extraction des champs simples
  let firstName = asString(findField(flat, FIELD_ALIASES.firstName))
  let lastName  = asString(findField(flat, FIELD_ALIASES.lastName))
  const fullName = asString(findField(flat, FIELD_ALIASES.fullName))

  // Si seul fullName est présent, split sur le premier espace
  if (!firstName && !lastName && fullName) {
    const parts = fullName.trim().split(/\s+/)
    firstName = parts[0] ?? null
    lastName  = parts.slice(1).join(' ') || null
  }

  const email = asString(findField(flat, FIELD_ALIASES.email))
  const phone = asString(findField(flat, FIELD_ALIASES.phone))
  const address = asString(findField(flat, FIELD_ALIASES.address))
  const price = asNumber(findField(flat, FIELD_ALIASES.price))
  const monthlyIncome = asNumber(findField(flat, FIELD_ALIASES.income))
  const downPayment = asNumber(findField(flat, FIELD_ALIASES.downPayment))
  const propertyType = asString(findField(flat, FIELD_ALIASES.propertyType))
  const message = asString(findField(flat, FIELD_ALIASES.message))

  // Employment status — normalisation
  const rawEmployment = asString(findField(flat, FIELD_ALIASES.employment))
  let employment_status: QualificationResult['employment_status'] = null
  if (rawEmployment) {
    const normalized = rawEmployment.toLowerCase().replace(/[\s_-]/g, '_')
    employment_status = EMPLOYMENT_VALUES[normalized]
      ?? EMPLOYMENT_VALUES[normalized.replace(/_/g, '')]
      ?? null
  }

  // Description : message direct si dispo, sinon concat de tous les champs textuels
  let description = message ?? ''
  if (!description) {
    const allText = Object.values(flat)
      .filter(v => typeof v === 'string' && (v as string).length > 5)
      .join(' · ')
    description = allText.slice(0, 500)
  }

  // Construction de l'objet qualification partiel
  const qualification: Partial<QualificationResult> = {
    type: 'acheteur',
    firstName, lastName,
    email, phone,
    contactInfo: null,
    propertyType, address,
    surface: null, rooms: null,
    price,
    monthly_income: monthlyIncome,
    down_payment: downPayment,
    existing_debts_monthly: null,
    employment_status,
    is_couple: null,
    sell_timeline: null,
    purchase_timeline: null,
    financing_status: null,
    description: description || 'Lead reçu via intégration externe',
    motivationSignals: [],
    urgencySignals: [],
  }

  // Texte brut pour le LLM (au cas où on doive re-qualifier)
  const rawTextForLLM = `
Lead externe reçu :
${fullName || (firstName + ' ' + (lastName ?? '')).trim() || '(sans nom)'}
${email ?? ''} ${phone ?? ''}
${address ?? ''}
${propertyType ?? ''}
${price ? `Budget : ${price}` : ''}
${monthlyIncome ? `Revenus : ${monthlyIncome}` : ''}
${downPayment ? `Apport : ${downPayment}` : ''}
${message ?? ''}
`.trim().replace(/\n\n+/g, '\n')

  return { qualification, rawTextForLLM }
}

/**
 * Détecte le type de source (Zapier, Make, etc.) selon les headers/body
 */
export function detectIngestSource(headers: Headers, payload: unknown): string {
  const ua = headers.get('user-agent') ?? ''
  if (/Zapier/i.test(ua)) return 'zapier'
  if (/Make/i.test(ua) || /Integromat/i.test(ua)) return 'make'

  // Pattern dans le payload
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>
    if ('zapier_trigger' in p || 'zap_id' in p) return 'zapier'
    if ('hubspot_owner_id' in p) return 'hubspot'
    if ((headers.get('referer') ?? '').includes('Salesforce')) return 'salesforce'
    if ('embed_widget' in p || p._source === 'embed-widget') return 'embed-widget'
    if ('wpforms_entry' in p || 'cf7_id' in p) return 'wordpress'
  }

  return 'custom'
}
