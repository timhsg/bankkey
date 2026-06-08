// ════════════════════════════════════════════════════════════════════════
//  Parser CSV minimal (sans dépendance)
//  Gère : virgule, point-virgule (Excel français), tabulation
//  Gère : valeurs entre guillemets, sauts de ligne dans les valeurs
// ════════════════════════════════════════════════════════════════════════

/**
 * Détecte le séparateur le plus probable en analysant la première ligne
 */
function detectSeparator(firstLine: string): string {
  const candidates = [';', ',', '\t']
  let bestSep = ','
  let maxCount = 0
  for (const sep of candidates) {
    // Count separators outside quotes
    let inQuote = false
    let count = 0
    for (const ch of firstLine) {
      if (ch === '"') inQuote = !inQuote
      else if (ch === sep && !inQuote) count++
    }
    if (count > maxCount) { maxCount = count; bestSep = sep }
  }
  return bestSep
}

/**
 * Parse une ligne CSV en gérant les guillemets
 */
function parseLine(line: string, sep: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuote = false
  let i = 0
  while (i < line.length) {
    const ch = line[i]
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'  // Guillemet échappé
          i += 2
          continue
        }
        inQuote = false
        i++
        continue
      }
      current += ch
      i++
    } else {
      if (ch === '"') { inQuote = true; i++; continue }
      if (ch === sep) {
        fields.push(current.trim())
        current = ''
        i++
        continue
      }
      current += ch
      i++
    }
  }
  fields.push(current.trim())
  return fields
}

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
  separator: string
}

export function parseCsv(text: string): ParsedCsv {
  // Normaliser les retours à la ligne et retirer le BOM Excel
  const cleanText = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n')

  // Split en lignes en respectant les guillemets
  const lines: string[] = []
  let buffer = ''
  let inQuote = false
  for (const ch of cleanText) {
    if (ch === '"') inQuote = !inQuote
    if (ch === '\n' && !inQuote) {
      lines.push(buffer)
      buffer = ''
      continue
    }
    buffer += ch
  }
  if (buffer) lines.push(buffer)

  const nonEmpty = lines.filter(l => l.trim().length > 0)
  if (nonEmpty.length === 0) return { headers: [], rows: [], separator: ',' }

  const separator = detectSeparator(nonEmpty[0])
  const headers = parseLine(nonEmpty[0], separator)

  const rows: Record<string, string>[] = []
  for (let i = 1; i < nonEmpty.length; i++) {
    const fields = parseLine(nonEmpty[i], separator)
    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (fields[j] ?? '').trim()
    }
    rows.push(row)
  }

  return { headers, rows, separator }
}

/**
 * Suggère un mapping automatique colonne CSV → champ BankKey
 */
export function suggestMapping(headers: string[]): Record<string, string> {
  const aliasMap: Record<string, string[]> = {
    firstName: ['firstname', 'prenom', 'prénom', 'first_name', 'given_name', 'first', 'fname'],
    lastName:  ['lastname', 'nom', 'last_name', 'family_name', 'surname', 'last', 'lname'],
    fullName:  ['fullname', 'name', 'full_name', 'nom_complet', 'contact_name'],
    email:     ['email', 'e-mail', 'mail', 'courriel'],
    phone:     ['phone', 'telephone', 'téléphone', 'tel', 'mobile', 'cellulaire'],
    address:   ['address', 'adresse', 'ville', 'city', 'lieu', 'localite', 'localité'],
    price:     ['price', 'prix', 'budget', 'montant', 'amount', 'loan_amount', 'projet'],
    monthly_income: ['income', 'revenus', 'revenu', 'salaire', 'salary'],
    down_payment: ['apport', 'down_payment', 'deposit', 'cash'],
    employment_status: ['employment', 'profession', 'situation', 'job', 'statut'],
    message: ['message', 'description', 'notes', 'commentaire', 'commentaires', 'details', 'remarque'],
  }

  const mapping: Record<string, string> = {}
  for (const header of headers) {
    const normalized = header.toLowerCase().replace(/[\s_-]+/g, '')
    for (const [bankKeyField, aliases] of Object.entries(aliasMap)) {
      if (aliases.some(a => a.replace(/[\s_-]+/g, '') === normalized)) {
        mapping[header] = bankKeyField
        break
      }
    }
  }
  return mapping
}
