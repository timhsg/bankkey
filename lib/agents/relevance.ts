import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// ════════════════════════════════════════════════════════════════════════
//  Agent de pertinence — filtre les emails AVANT la pipeline IA
//
//  Objectif : ne traiter que les demandes pertinentes de financement.
//  Économise des tokens et évite de polluer le tableau de bord avec
//  spams, newsletters, emails personnels, auto-replies.
//
//  Stratégie en 2 niveaux :
//  1. Filtre déterministe rapide (regex / heuristiques)
//  2. LLM si ambigu
// ════════════════════════════════════════════════════════════════════════

export type RelevanceCategory =
  | 'financing_request'  // Demande crédit / financement → TRAITER
  | 'spam'               // Publicité, promotion, casino, etc.
  | 'newsletter'         // Newsletter pro / abonnement
  | 'personal'           // Email perso (famille, amis)
  | 'auto_reply'         // Réponse automatique (absence, accusé réception)
  | 'transactional'      // Notification automatique (banque, livraison, etc.)
  | 'internal'           // Email interne au cabinet
  | 'unclear'            // À examiner manuellement

export interface RelevanceResult {
  relevant: boolean
  category: RelevanceCategory
  confidence: number  // 0-100
  reason: string
}

// ── Filtre déterministe (regex / heuristiques) ────────────────────────────

const SPAM_DOMAINS = [
  /@noreply\./i, /@no-reply\./i, /no-reply@/i, /noreply@/i,
  /@mailchimp\.com/i, /@sendgrid\.net/i, /@mailgun\.org/i,
  /@list\./i, /-newsletter@/i,
]

const SPAM_KEYWORDS = [
  /promotion\s+exclusive/i, /offre\s+limit[ée]e/i,
  /viagra/i, /casino/i, /loterie/i, /vous\s+avez\s+gagn[ée]/i,
  /unsubscribe/i, /d[ée]sabonner/i,
  /webinar.*inscrit/i, /votre.*invit[ée]/i,
]

const AUTO_REPLY_KEYWORDS = [
  /absence\s+du\s+bureau/i, /out\s+of\s+office/i, /actuellement\s+absent/i,
  /accus[ée]\s+de\s+r[ée]ception/i, /auto.?reply/i, /r[ée]ponse\s+automatique/i,
  /votre\s+message\s+a\s+bien\s+[ée]t[ée]\s+re[çc]u/i,
]

const TRANSACTIONAL_KEYWORDS = [
  /votre\s+commande/i, /votre\s+livraison/i, /facture\s+n°/i,
  /votre\s+relev[ée]\s+de\s+compte/i, /votre\s+abonnement/i,
  /code\s+de\s+v[ée]rification/i, /verification\s+code/i, /one.?time\s+password/i,
  /m[ée]morisez\s+votre\s+mot\s+de\s+passe/i, /r[ée]initialisation\s+du\s+mot\s+de\s+passe/i,
]

const FINANCING_KEYWORDS = [
  /pr[êe]t/i, /cr[ée]dit/i, /financement/i, /emprunt/i,
  /hypoth[èe]que/i, /h[éy]poth[ée]caire/i,
  /achat\s+immobilier/i, /r[ée]sidence\s+principale/i, /investissement\s+locatif/i,
  /compromis/i, /signature.*notaire/i, /apport/i, /capacit[ée]\s+d.?emprunt/i,
  /taux\s+d.?int[ée]r[êe]t/i, /taeg/i, /mensualit[ée]/i,
  /renegoci/i, /refinancement/i, /rachat\s+de\s+cr[ée]dit/i,
]

function quickFilter(fromEmail: string, subject: string, body: string): RelevanceResult | null {
  const combined = `${subject} ${body}`.toLowerCase()
  const fromCheck = fromEmail.toLowerCase()

  // Test 1 : domaine d'envoi automatique
  if (SPAM_DOMAINS.some(re => re.test(fromCheck))) {
    return {
      relevant: false, category: 'spam', confidence: 95,
      reason: 'Adresse d\'envoi automatique (noreply, mailchimp, etc.)',
    }
  }

  // Test 2 : keywords spam évidents
  const spamHits = SPAM_KEYWORDS.filter(re => re.test(combined)).length
  if (spamHits >= 2) {
    return {
      relevant: false, category: 'spam', confidence: 90,
      reason: 'Mots-clés promotionnels détectés',
    }
  }

  // Test 3 : auto-reply
  if (AUTO_REPLY_KEYWORDS.some(re => re.test(combined))) {
    return {
      relevant: false, category: 'auto_reply', confidence: 95,
      reason: 'Réponse automatique d\'absence',
    }
  }

  // Test 4 : transactionnel
  if (TRANSACTIONAL_KEYWORDS.some(re => re.test(combined))) {
    return {
      relevant: false, category: 'transactional', confidence: 85,
      reason: 'Email transactionnel automatisé',
    }
  }

  // Test 5 : signaux forts de demande crédit
  const financingHits = FINANCING_KEYWORDS.filter(re => re.test(combined)).length
  if (financingHits >= 2) {
    return {
      relevant: true, category: 'financing_request', confidence: 90,
      reason: 'Mots-clés de financement immobilier détectés',
    }
  }

  // Test 6 : email trop court (< 50 chars de contenu utile)
  if (body.trim().length < 50) {
    return {
      relevant: false, category: 'unclear', confidence: 60,
      reason: 'Contenu trop court pour qualification',
    }
  }

  // Si trop long > 5000 chars : probablement newsletter
  if (body.length > 5000) {
    return {
      relevant: false, category: 'newsletter', confidence: 70,
      reason: 'Email volumineux — probable newsletter',
    }
  }

  return null  // Ambigu → passer au LLM
}

// ── LLM fallback pour cas ambigus ─────────────────────────────────────────

async function llmClassify(fromEmail: string, subject: string, body: string): Promise<RelevanceResult> {
  const prompt = `Classifie cet email reçu par un courtier en crédit immobilier.

DE : ${fromEmail}
OBJET : ${subject}
CORPS :
${body.slice(0, 1500)}

L'email est-il une demande pertinente de financement / crédit immobilier que le courtier doit traiter ?

Réponds UNIQUEMENT avec ce JSON (sans markdown) :
{
  "relevant": boolean,
  "category": "financing_request" | "spam" | "newsletter" | "personal" | "auto_reply" | "transactional" | "internal" | "unclear",
  "confidence": number entre 0 et 100,
  "reason": "explication 1 phrase courte"
}

Règles :
- "financing_request" UNIQUEMENT si la personne demande explicitement ou implicitement un crédit immobilier / un financement / un refinancement / des informations sur un prêt
- "internal" si email entre membres du cabinet (planning, RH, comptabilité)
- "personal" si conversation privée (famille, amis, sujets non-pro)
- "unclear" si vraiment impossible à juger`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    system: 'Tu es un classificateur d\'emails. Réponds UNIQUEMENT en JSON valide.',
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return { relevant: true, category: 'unclear', confidence: 30, reason: 'Erreur LLM, par défaut on traite' }
  }

  try {
    const clean = content.text.trim()
    const match = clean.match(/(\{[\s\S]*\})/)
    if (!match?.[1]) throw new Error('No JSON')
    const parsed = JSON.parse(match[1]) as RelevanceResult
    return parsed
  } catch {
    // Si parsing échoue, on traite par défaut (mieux vaut un faux positif qu'un raté)
    return { relevant: true, category: 'unclear', confidence: 30, reason: 'Classification incertaine — traitement par défaut' }
  }
}

// ── Entry point ───────────────────────────────────────────────────────────

export async function classifyRelevance(
  fromEmail: string,
  subject: string,
  body: string,
): Promise<RelevanceResult> {
  // 1. Filtre déterministe (rapide, gratuit)
  const quick = quickFilter(fromEmail, subject, body)
  if (quick) return quick

  // 2. LLM pour cas ambigus
  return await llmClassify(fromEmail, subject, body)
}
