import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// ════════════════════════════════════════════════════════════════════════
//  Agent de pertinence — filtre STRICT
//
//  Philosophie : par défaut on REJETTE.
//  Un email n'est marqué pertinent que s'il contient des signaux EXPLICITES
//  d'une demande de financement / crédit immobilier.
//
//  Stratégie en 3 niveaux :
//  1. Hard reject : domaines / patterns d'envoi automatiques non-pertinents
//  2. Hard accept : sources crédit reconnues (Empruntis, Meilleurtaux, etc.)
//  3. LLM strict pour les cas ambigus — défaut "false"
// ════════════════════════════════════════════════════════════════════════

export type RelevanceCategory =
  | 'financing_request'
  | 'spam'
  | 'newsletter'
  | 'personal'
  | 'auto_reply'
  | 'transactional'
  | 'tech_notification'
  | 'social_notification'
  | 'subscription_billing'
  | 'internal'
  | 'unclear'

export interface RelevanceResult {
  relevant: boolean
  category: RelevanceCategory
  confidence: number
  reason: string
}

// ── 1. Hard REJECT : domaines de notifications automatiques ────────────

const HARD_REJECT_DOMAINS = [
  // Tech / DevOps
  /@vercel\.com$/i, /@vercel-mail\./i,
  /@github\.com$/i, /@noreply\.github/i,
  /@gitlab\.com$/i,
  /@netlify\.com$/i,
  /@cloudflare\./i, /@cloudflareaccess/i,
  /@aws\.amazon\.com$/i, /@amazonaws\.com$/i,
  /@digitalocean\.com$/i,
  /@heroku\./i,
  /@stripe\.com$/i,
  /@anthropic\.com$/i, /@openai\.com$/i,
  /@supabase\.io$/i, /@supabase\.com$/i,

  // Social / messagerie
  /@linkedin\.com$/i, /@messages-noreply\.linkedin/i,
  /@facebook\.com$/i, /@facebookmail\.com$/i,
  /@instagram\.com$/i,
  /@twitter\.com$/i, /@x\.com$/i,
  /@youtube\.com$/i,
  /@tiktok\./i,
  /@discord\.com$/i,
  /@reddit\.com$/i, /@redditmail\.com$/i,
  /@pinterest\.com$/i,

  // Streaming / divertissement
  /@disney(plus)?\./i, /@dssgmail\.com$/i,
  /@netflix\./i,
  /@spotify\./i,
  /@hbomax\./i,
  /@hulu\./i,
  /@primevideo\./i, /@amazon\.com$/i, /@amazonprime/i,
  /@deezer\./i,

  // SaaS productivité
  /@notion\.so$/i, /@notion\.com$/i,
  /@slack\.com$/i,
  /@zoom\.us$/i, /@zoom\.com$/i,
  /@asana\.com$/i,
  /@trello\.com$/i,
  /@dropbox\.com$/i,
  /@google\.com$/i, /@googleapis\.com$/i,
  /@apple\.com$/i, /@apple-news\./i, /@me\.com$/i,
  /@microsoft\.com$/i, /@office\.com$/i, /@microsoftonline\.com$/i,
  /@adobe\.com$/i,
  /@1password\.com$/i,
  /@calendly\.com$/i,
  /@hubspot\.com$/i, /@hubspotemail\.net$/i,
  /@mailchimp\./i, /@createsend\.com$/i, /@mcsv\.net$/i,

  // E-commerce
  /@uber\./i, /@ubereats\./i,
  /@booking\.com$/i,
  /@airbnb\.com$/i,
  /@deliveroo\./i,
  /@just-eat\./i,
  /@stuart\./i,
  /@etsy\.com$/i,

  // Banques / fintech personnelles (pas leads pro)
  /@n26\.com$/i,
  /@revolut\.com$/i,
  /@wise\.com$/i,
  /@paypal\.com$/i, /@paypalmail\./i,

  // Génériques noreply
  /^(no-?reply|noreply|donotreply|notification|notifications|hello|info)@/i,
]

// ── 2. Hard REJECT : mots-clés explicites de non-pertinence ──────────

const HARD_REJECT_KEYWORDS = [
  // Tech notifications
  /your\s+(deployment|build|repo|repository|app|workflow|action)\s+(is|has|was|succeeded|failed)/i,
  /(deployment|build)\s+(succeeded|failed|completed)/i,
  /votre\s+d[ée]ploiement\s+/i,
  /nouveau\s+commit\s+sur/i,
  /pull\s+request\s+(merged|closed|opened)/i,
  /your\s+(invoice|receipt|payment)\s+from\s+(vercel|github|netlify|aws|stripe)/i,

  // Streaming / abonnements personnels
  /votre\s+facture\s+(disney|netflix|spotify|amazon\s+prime|hbo|hulu)/i,
  /your\s+(disney|netflix|spotify|prime)\s+(subscription|invoice|membership)/i,
  /votre\s+abonnement\s+(disney|netflix|spotify|prime|hbo)/i,
  /merci\s+pour\s+votre\s+abonnement/i,

  // Réseaux sociaux
  /vous\s+avez\s+(une\s+nouvelle\s+)?notification.*linkedin/i,
  /you\s+have\s+\d+\s+new\s+(connection|message|notification|follower)/i,
  /(invitation|connection)\s+request\s+from/i,
  /someone\s+(liked|commented|shared)\s+your/i,
  /votre\s+publication\s+a\s+(re[çc]u|une?)\s+nouvelle/i,

  // Promotions / ventes flash
  /(black\s+friday|cyber\s+monday|soldes|ventes\s+flash)/i,
  /(\-\d+%|jusqu.?[àa]\s+\-\d+%)/i,
  /code\s+promo/i,
  /votre\s+commande\s+(est|a|sera)/i,
  /your\s+order\s+(has|is|was|shipped)/i,

  // Calendrier / RDV automatiques
  /(invitation|invit[ée]e)\s+[àa]\s+une\s+r[ée]union/i,
  /rappel.*rendez-vous\s+(zoom|teams|meet)/i,

  // 2FA / sécurité
  /code\s+(de\s+v[ée]rification|de\s+s[ée]curit[ée]|d.?authentification)/i,
  /verification\s+code/i, /one.?time\s+(password|code)/i,
  /security\s+alert/i, /alerte\s+s[ée]curit[ée]/i,
  /nouveau\s+(appareil|d[ée]vice|connexion)/i,
  /m[ée]morisez\s+votre\s+mot\s+de\s+passe/i,
  /r[ée]initialisation\s+(du\s+)?mot\s+de\s+passe/i,

  // Newsletter génériques
  /se\s+d[ée]sabonner|unsubscribe/i,
  /afficher\s+dans\s+(le|un)\s+navigateur/i,
  /view\s+(in|this\s+email)\s+in\s+browser/i,
]

// ── 3. Hard REJECT : auto-reply ────────────────────────────────────────

const AUTO_REPLY_PATTERNS = [
  /absence\s+du\s+bureau/i, /out\s+of\s+office/i,
  /actuellement\s+absent/i, /currently\s+(away|out)/i,
  /accus[ée]\s+de\s+r[ée]ception/i, /auto.?reply/i,
  /r[ée]ponse\s+automatique/i,
  /votre\s+message\s+a\s+bien\s+[ée]t[ée]\s+re[çc]u/i,
  /merci\s+pour\s+votre\s+message,\s+je\s+vous\s+r[ée]ponds/i,
]

// ── 4. Hard ACCEPT : sources crédit reconnues ──────────────────────────

const HARD_ACCEPT_DOMAINS = [
  /@empruntis\.com$/i, /@empruntis\.fr$/i,
  /@meilleurtaux\.com$/i, /@meilleurtaux\.fr$/i,
  /@partenaires\.meilleurtaux/i,
  /@pretto\.fr$/i, /@pretto-pro\.fr$/i,
  /@hellopret\.fr$/i, /@helloprêt\.fr$/i,
  /@seloger\.com$/i, /@seloger-emails\.com$/i, /@notif\.seloger\.com$/i,
  /@bienici\.com$/i, /@bienici\.fr$/i,
]

const HARD_ACCEPT_KEYWORDS = [
  /Empruntis\s*-\s*Nouvelle?\s+(demande|lead)/i,
  /Meilleurtaux\s*-\s*Lead/i,
  /Pretto\s*-\s*Nouveau\s+(client|lead|prospect)/i,
  /SeLoger\s*-\s*Nouvelle?\s+demande/i,
  /Vous\s+avez\s+re[çc]u\s+un\s+message\s+SeLoger/i,
]

// ── 5. Signaux POSITIFS de demande crédit ────────────────────────────

const STRONG_CREDIT_SIGNALS = [
  // Demande explicite de courtier/financement
  /je\s+(cherche|recherche|souhaite|voudrais)\s+un\s+courtier/i,
  /j[e\'']?aimerais\s+(faire\s+appel|consulter|rencontrer)\s+un\s+courtier/i,
  /demande\s+de\s+(financement|cr[ée]dit|pr[êe]t)\s+immobilier/i,
  /pourriez.?vous\s+(m.?accompagner|m.?aider)\s+(pour|dans)\s+(mon|notre)\s+(financement|cr[ée]dit|achat)/i,
  /nous\s+(cherchons|souhaitons|envisageons)\s+(un|notre)\s+financement/i,

  // Achat immobilier en cours
  /(j.?ai|nous\s+avons)\s+(sign[ée]|trouv[ée]|fait)\s+(un|le)\s+compromis/i,
  /promesse\s+d.?achat/i,
  /offre\s+d.?achat\s+(accept[ée]e|sign[ée]e)/i,

  // Refinancement / renégociation
  /ren[ée]goci(er|ation)\s+(mon|notre|le)\s+(pr[êe]t|cr[ée]dit)/i,
  /rachat\s+de\s+(mon|notre|cr[ée]dit)/i,
  /refinanc/i,

  // Capacité d'emprunt
  /capacit[ée]\s+d.?emprunt/i,
  /simulation\s+de\s+(pr[êe]t|cr[ée]dit)/i,
]

// ── Filtres déterministes ──────────────────────────────────────────────

function quickFilter(fromEmail: string, subject: string, body: string): RelevanceResult | null {
  const sender = fromEmail.toLowerCase()
  const combined = `${subject} ${body.slice(0, 3000)}`

  // PRIORITÉ 1 : Hard accept (sources crédit connues — toujours pertinent)
  if (HARD_ACCEPT_DOMAINS.some(re => re.test(sender))) {
    return { relevant: true, category: 'financing_request', confidence: 98, reason: 'Source crédit reconnue' }
  }
  if (HARD_ACCEPT_KEYWORDS.some(re => re.test(combined))) {
    return { relevant: true, category: 'financing_request', confidence: 92, reason: 'Sujet de lead crédit identifié' }
  }

  // PRIORITÉ 2 : Hard reject (impossible que ce soit pertinent)
  if (HARD_REJECT_DOMAINS.some(re => re.test(sender))) {
    return { relevant: false, category: 'tech_notification', confidence: 99, reason: 'Notification automatique (service tech/SaaS)' }
  }
  if (AUTO_REPLY_PATTERNS.some(re => re.test(combined))) {
    return { relevant: false, category: 'auto_reply', confidence: 98, reason: 'Réponse automatique d\'absence' }
  }
  if (HARD_REJECT_KEYWORDS.some(re => re.test(combined))) {
    return { relevant: false, category: 'transactional', confidence: 95, reason: 'Notification système / promotion / 2FA' }
  }

  // PRIORITÉ 3 : Trop court ou trop long
  if (body.trim().length < 80) {
    return { relevant: false, category: 'unclear', confidence: 70, reason: 'Email trop court pour qualification' }
  }
  if (body.length > 8000) {
    return { relevant: false, category: 'newsletter', confidence: 75, reason: 'Volume newsletter — probablement non personnel' }
  }

  // PRIORITÉ 4 : Signaux crédit forts → on accepte sans LLM
  const creditHits = STRONG_CREDIT_SIGNALS.filter(re => re.test(combined)).length
  if (creditHits >= 2) {
    return { relevant: true, category: 'financing_request', confidence: 92, reason: 'Signaux explicites de demande de crédit' }
  }
  if (creditHits === 1) {
    return { relevant: true, category: 'financing_request', confidence: 78, reason: 'Indice de demande de crédit détecté' }
  }

  return null  // Ambigu → LLM
}

// ── LLM strict ────────────────────────────────────────────────────────

async function llmClassify(fromEmail: string, subject: string, body: string): Promise<RelevanceResult> {
  const prompt = `Tu classifies un email reçu par un courtier en CRÉDIT IMMOBILIER.

DE : ${fromEmail}
OBJET : ${subject}
CORPS :
${body.slice(0, 1800)}

CONTEXTE STRICT :
Le courtier reçoit des emails très variés. Tu dois IDENTIFIER UNIQUEMENT les VRAIES demandes de financement immobilier ou de courtage crédit.

RÈGLE ABSOLUE : par défaut, l'email N'EST PAS pertinent.
Marque-le pertinent UNIQUEMENT s'il contient une demande EXPLICITE de l'une des choses suivantes :
- Recherche d'un courtier crédit immobilier
- Demande de financement / prêt immobilier
- Renégociation / rachat de crédit immobilier en cours
- Compromis signé cherchant un financement
- Capacité d'emprunt / simulation de prêt

EXEMPLES À REJETER (non pertinent) :
- Notifications GitHub/Vercel/AWS/Netlify
- Notifications LinkedIn/Facebook/Twitter
- Factures Disney+/Netflix/Spotify
- Newsletters professionnelles (même de l'immobilier)
- Confirmations de commande
- Codes de vérification 2FA
- Réponses automatiques d'absence
- Messages personnels (famille, amis)
- Échanges internes au cabinet (planning, RH, comptabilité)
- Promotions et publicités
- Invitations à des webinars
- Demandes non-immobilier (assurance vie, placement, etc.)

EXEMPLES À ACCEPTER (pertinent) :
- "Bonjour, je cherche un courtier pour mon achat à Lyon"
- "Demande de financement pour notre résidence principale"
- "Nous avons signé un compromis, pouvez-vous nous accompagner ?"
- "Renégociation de mon prêt en cours"
- Forward d'Empruntis/Meilleurtaux/Pretto/SeLoger

Réponds UNIQUEMENT avec ce JSON (sans markdown) :
{
  "relevant": boolean,
  "category": "financing_request" | "spam" | "newsletter" | "personal" | "auto_reply" | "transactional" | "tech_notification" | "social_notification" | "subscription_billing" | "internal" | "unclear",
  "confidence": number entre 0 et 100,
  "reason": "1 phrase courte expliquant la décision"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    system: 'Tu es un classificateur strict. Par défaut tu rejettes. Tu n\'acceptes que les vraies demandes de crédit immobilier. Réponds UNIQUEMENT en JSON valide.',
    messages: [{ role: 'user', content: prompt }],
  }, { timeout: 20_000 })

  const content = message.content[0]
  if (content.type !== 'text') {
    return { relevant: false, category: 'unclear', confidence: 50, reason: 'Erreur LLM — par défaut écarté' }
  }

  try {
    const clean = content.text.trim()
    const match = clean.match(/(\{[\s\S]*\})/)
    if (!match?.[1]) throw new Error('No JSON')
    return JSON.parse(match[1]) as RelevanceResult
  } catch {
    // En cas d'erreur de parsing : on REJETTE (mieux vaut écarter qu'inclure du bruit)
    return { relevant: false, category: 'unclear', confidence: 50, reason: 'Classification incertaine — écarté par sécurité' }
  }
}

// ── Entry point ───────────────────────────────────────────────────────

export async function classifyRelevance(
  fromEmail: string,
  subject: string,
  body: string,
): Promise<RelevanceResult> {
  const quick = quickFilter(fromEmail, subject, body)
  if (quick) return quick
  return await llmClassify(fromEmail, subject, body)
}
