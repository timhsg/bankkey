// ════════════════════════════════════════════════════════════════════════
//  Détection automatique de la source d'un email
//
//  Le courtier connecte Gmail (ou Outlook), BankKey lit ses emails
//  et détecte automatiquement la provenance — sans aucune configuration
//  ni règle de forwarding.
//
//  Détection en 2 niveaux :
//  1. Domaine d'envoi (rapide, 95% des cas) — Empruntis envoie depuis
//     @empruntis.com, SeLoger depuis @seloger-emails.com, etc.
//  2. Mots-clés dans le sujet/corps si domaine inconnu
// ════════════════════════════════════════════════════════════════════════

export interface SourceMatch {
  sourceId: string        // Identifiant de la source (ex: 'empruntis')
  sourceName: string      // Nom affiché (ex: 'Empruntis')
  confidence: 'high' | 'medium' | 'low'
  method: 'domain' | 'keyword' | 'forwarded' | 'unknown'
}

// ── Patterns par source ───────────────────────────────────────────────

interface SourcePattern {
  id: string
  name: string
  /** Regex sur l'email d'envoi complet */
  emailPatterns: RegExp[]
  /** Mots-clés à chercher dans subject + body (cumulés) */
  keywordPatterns?: RegExp[]
  /** Si l'email a été forwardé, regarder le contenu */
  forwardedFromPatterns?: RegExp[]
}

const SOURCE_PATTERNS: SourcePattern[] = [

  // ─── Agrégateurs leads crédit ───
  {
    id: 'empruntis',
    name: 'Empruntis',
    emailPatterns: [
      /@empruntis\.com$/i,
      /@empruntis\.fr$/i,
      /noreply.*empruntis/i,
      /leads.*empruntis/i,
    ],
    keywordPatterns: [
      /Empruntis\s*-\s*Nouvelle\s+demande/i,
      /votre\s+nouveau\s+lead.*Empruntis/i,
    ],
  },
  {
    id: 'meilleurtaux',
    name: 'Meilleurtaux',
    emailPatterns: [
      /@meilleurtaux\.com$/i,
      /@meilleurtaux\.fr$/i,
      /@partenaires\.meilleurtaux/i,
    ],
    keywordPatterns: [/Meilleurtaux\s*-\s*Lead/i],
  },
  {
    id: 'pretto',
    name: 'Pretto',
    emailPatterns: [
      /@pretto\.fr$/i,
      /@pretto-pro\.fr$/i,
    ],
  },
  {
    id: 'helloprêt',
    name: 'Helloprêt',
    emailPatterns: [
      /@hellopret\.fr$/i,
      /@helloprêt\.fr$/i,
      /@hello-pret\.fr$/i,
    ],
  },

  // ─── Portails immobiliers ───
  {
    id: 'seloger',
    name: 'SeLoger',
    emailPatterns: [
      /@seloger\.com$/i,
      /@seloger-emails\.com$/i,
      /@notif\.seloger\.com$/i,
      /noreply.*seloger/i,
    ],
    keywordPatterns: [
      /SeLoger\s*-\s*Nouvelle\s+demande/i,
      /Vous\s+avez\s+re[çc]u\s+un\s+message\s+SeLoger/i,
    ],
  },
  {
    id: 'leboncoin',
    name: 'Leboncoin',
    emailPatterns: [
      /@leboncoin\.fr$/i,
      /@notif\.leboncoin\.fr$/i,
      /messagerie\.leboncoin/i,
    ],
    keywordPatterns: [
      /votre\s+message\s+Leboncoin/i,
      /nouveau\s+message.*leboncoin/i,
    ],
  },
  {
    id: 'bienici',
    name: 'BienIci',
    emailPatterns: [
      /@bienici\.com$/i,
      /@bienici\.fr$/i,
    ],
  },

  // ─── Réseaux / enseignes de courtage FR (envoient des leads aux agences) ───
  {
    id: 'cafpi',
    name: 'CAFPI',
    emailPatterns: [/@cafpi\.fr$/i, /@cafpi\.com$/i, /noreply.*cafpi/i, /lead.*cafpi/i],
    keywordPatterns: [/CAFPI\s*[-–]\s*Nouvelle\s+demande/i, /votre\s+lead\s+CAFPI/i],
  },
  {
    id: 'vousfinancer',
    name: 'Vousfinancer',
    emailPatterns: [/@vousfinancer\.com$/i, /@vousfinancer\.fr$/i],
  },
  {
    id: 'lacentrale_financement',
    name: 'La Centrale de Financement',
    emailPatterns: [/@lacentraledefinancement\.fr$/i, /@lcf\.fr$/i],
    keywordPatterns: [/Centrale\s+de\s+Financement/i],
  },
  {
    id: 'ymanci',
    name: 'Ymanci',
    emailPatterns: [/@ymanci\.fr$/i, /@ymanci\.com$/i, /@solutis\.fr$/i],
  },
  {
    id: 'cyberpret',
    name: 'Cyberprêt',
    emailPatterns: [/@cyberpret\.com$/i, /@cyberpret\.fr$/i],
  },
  {
    id: 'acecredit',
    name: 'ACE Crédit',
    emailPatterns: [/@ace-credit\.fr$/i, /@acecredit\.fr$/i],
  },

  // ─── Portails immobiliers FR additionnels ───
  {
    id: 'logicimmo',
    name: 'Logic-Immo',
    emailPatterns: [/@logic-immo\.com$/i, /@logicimmo\.com$/i, /noreply.*logic-immo/i],
  },
  {
    id: 'pap',
    name: 'PAP',
    emailPatterns: [/@pap\.fr$/i, /@notif\.pap\.fr$/i],
  },

  // ─── Suisse — portails & courtiers hypothécaires ───
  {
    id: 'homegate',
    name: 'Homegate',
    emailPatterns: [/@homegate\.ch$/i, /noreply.*homegate/i, /@email\.homegate\.ch$/i],
    keywordPatterns: [/Homegate\s*[-–]\s*Nouvelle\s+demande/i, /votre\s+message\s+Homegate/i],
  },
  {
    id: 'immoscout24ch',
    name: 'ImmoScout24',
    emailPatterns: [/@immoscout24\.ch$/i, /noreply.*immoscout24\.ch/i],
    keywordPatterns: [/ImmoScout24/i],
  },
  {
    id: 'comparis',
    name: 'Comparis',
    emailPatterns: [/@comparis\.ch$/i, /noreply.*comparis/i],
  },
  {
    id: 'moneypark',
    name: 'MoneyPark',
    emailPatterns: [/@moneypark\.ch$/i, /noreply.*moneypark/i],
  },
  {
    id: 'hypotheke',
    name: 'Hypotheke.ch',
    emailPatterns: [/@hypotheke\.ch$/i],
  },
  {
    id: 'newhome',
    name: 'Newhome',
    emailPatterns: [/@newhome\.ch$/i],
  },
  {
    id: 'realadvisor',
    name: 'RealAdvisor',
    emailPatterns: [/@realadvisor\.ch$/i, /@realadvisor\.com$/i],
  },

  // ─── CRM courtage ───
  {
    id: 'aprico',
    name: 'Aprico',
    emailPatterns: [/@aprico\.io$/i, /@aprico\.fr$/i],
  },
  {
    id: 'marketis',
    name: 'Marketis',
    emailPatterns: [/@marketis\.fr$/i, /@marketis\.com$/i],
  },

  // ─── Réseaux sociaux ───
  {
    id: 'linkedin',
    name: 'LinkedIn',
    emailPatterns: [
      /@linkedin\.com$/i,
      /messages-noreply.*linkedin/i,
    ],
    keywordPatterns: [/vous\s+avez\s+un\s+message\s+sur\s+LinkedIn/i],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    emailPatterns: [
      /@facebookmail\.com$/i,
      /@facebook\.com$/i,
    ],
  },
]

// ── Détection des emails forwardés ─────────────────────────────────────
// Un email forwardé contient typiquement "Fwd:" dans le sujet et l'email
// original dans le corps (souvent précédé de "From:" ou "De :")

const FORWARDED_PATTERNS = [
  /^(?:Fwd|Tr|TR|Fw):/i,
  /^---------- Forwarded message ----------/m,
  /De\s*:\s*[^\n]+\nEnvoy[ée]\s*:/im,
]

function isForwardedEmail(subject: string, body: string): boolean {
  if (FORWARDED_PATTERNS[0].test(subject)) return true
  return FORWARDED_PATTERNS.slice(1).some(re => re.test(body))
}

function extractOriginalSenderFromForwarded(body: string): string | null {
  // Cherche "From: <email>" ou "De : <email>" dans le corps
  const match = body.match(/(?:From|De)\s*:[^\n]*<([^>]+)>/i)
                ?? body.match(/(?:From|De)\s*:\s*([^\s\n]+@[^\s\n]+)/i)
  return match?.[1] ?? null
}

// ── Détection principale ───────────────────────────────────────────────

/**
 * Détecte la source d'un email reçu
 * @param fromEmail Adresse email de l'expéditeur (ex: "noreply@empruntis.com")
 * @param subject Objet de l'email
 * @param body Corps de l'email
 */
export function detectSource(fromEmail: string, subject: string, body: string): SourceMatch {
  const senderToCheck = fromEmail.toLowerCase()

  // 1. Si l'email est forwardé, regarder l'expéditeur original
  if (isForwardedEmail(subject, body)) {
    const originalSender = extractOriginalSenderFromForwarded(body)
    if (originalSender) {
      const match = matchPatterns(originalSender, subject, body)
      if (match) return { ...match, method: 'forwarded' }
    }
  }

  // 2. Détection par domaine d'envoi (le plus rapide et fiable)
  const match = matchPatterns(senderToCheck, subject, body)
  if (match) return match

  // 3. Aucun match — source directe inconnue
  return {
    sourceId: 'direct',
    sourceName: 'Direct',
    confidence: 'low',
    method: 'unknown',
  }
}

function matchPatterns(senderEmail: string, subject: string, body: string): SourceMatch | null {
  // Domaine d'envoi — haute confiance
  for (const pattern of SOURCE_PATTERNS) {
    if (pattern.emailPatterns.some(re => re.test(senderEmail))) {
      return {
        sourceId: pattern.id,
        sourceName: pattern.name,
        confidence: 'high',
        method: 'domain',
      }
    }
  }

  // Mots-clés — confiance moyenne
  const combined = `${subject} ${body.slice(0, 2000)}`
  for (const pattern of SOURCE_PATTERNS) {
    if (pattern.keywordPatterns?.some(re => re.test(combined))) {
      return {
        sourceId: pattern.id,
        sourceName: pattern.name,
        confidence: 'medium',
        method: 'keyword',
      }
    }
  }

  return null
}

// ── Helper pour stats agrégées ────────────────────────────────────────

export interface SourceStats {
  sourceId: string
  sourceName: string
  count: number
  hotCount: number  // Score >= 60
  lastReceivedAt: string | null
}

/**
 * Agrège les stats de sources depuis une liste de prospects
 */
export function aggregateSourceStats(
  prospects: Array<{
    detected_source?: { sourceId: string; sourceName: string } | null
    scoring?: { score: number; temperature: string } | null
    received_at?: string | null
    created_at: string
  }>
): SourceStats[] {
  const map = new Map<string, SourceStats>()

  for (const p of prospects) {
    const id = p.detected_source?.sourceId ?? 'direct'
    const name = p.detected_source?.sourceName ?? 'Direct'
    const date = p.received_at ?? p.created_at

    if (!map.has(id)) {
      map.set(id, {
        sourceId: id,
        sourceName: name,
        count: 0,
        hotCount: 0,
        lastReceivedAt: date,
      })
    }
    const stat = map.get(id)!
    stat.count += 1
    if (p.scoring && p.scoring.score >= 60) stat.hotCount += 1
    if (!stat.lastReceivedAt || date > stat.lastReceivedAt) {
      stat.lastReceivedAt = date
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}
