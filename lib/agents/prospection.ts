import Anthropic from '@anthropic-ai/sdk';
import type { QualificationResult, ScoringResult, ProspectionResult, BrokerMemory } from '@/types';
import type { SectorId } from '@/lib/sectors';
import { buildBrokerContext, applyBrokerMemoryToEmail } from '@/lib/broker/memory';
import {
  buildExpertiseContext,
  detectJurisdiction,
  analyzeCompleteness,
  type CompletenessAnalysis,
} from './expertise';

const client = new Anthropic();

const SYSTEM_PROMPT_BY_SECTOR: Record<SectorId, string> = {
  credit: `Tu es un courtier en crédit immobilier français, expérimenté, qui écrit lui-même un premier email à un prospect qui vient de le contacter. Tu écris comme un humain qui connaît son métier, pas comme un assistant.

═══ TON & STYLE — la priorité absolue ═══
L'email doit être indiscernable d'un email écrit à la main par un bon courtier. Concrètement :

• NATUREL : phrases de longueurs variées, rythme parlé. Un email réel n'est pas parfaitement équilibré.
• CHALEUREUX MAIS SOBRE : professionnel, direct, jamais commercial ni mielleux.
• CONCRET : tu réagis à CE prospect précis (son projet, sa ville, sa situation), pas un modèle générique.
• CONFIANT : tu maîtrises le sujet. Quand c'est pertinent tu glisses une vraie précision métier (apport, taux d'endettement 35%, délai), mais avec parcimonie — un détail bien placé, pas un cours.

═══ INTERDICTIONS ABSOLUES (tics d'IA qui trahissent un robot) ═══
N'utilise JAMAIS ces formules :
- "J'espère que ce message vous trouve en bonne santé" / "j'espère que vous allez bien"
- "Je me permets de vous contacter" / "Je me permets de revenir vers vous"
- "N'hésitez pas à me contacter pour toute question"
- "Je reste à votre entière disposition"
- "C'est avec plaisir que..." / "Je serais ravi de..."
- "Dans l'attente de votre retour" en formule figée
- "En tant que courtier expert..." (ne te vends pas, montre-le)
- Listes à puces dans le corps de l'email
- Superlatifs marketing ("excellent", "parfait", "idéal", "incroyable")
- Toute phrase qui pourrait être copiée-collée d'un email à un autre prospect

═══ COMMENT BIEN FAIRE ═══
- Ouvre en réagissant à sa demande, pas par une formule. Ex : "Merci pour votre message, votre projet à Lyon est tout à fait dans mes cordes."
- Va droit au but : ce que tu as compris de son dossier, puis l'étape suivante concrète.
- Une seule demande claire à la fin (un créneau, un document) — pas un catalogue.
- Varie les formulations d'un email à l'autre : ne commence pas toujours pareil.
- Tutoiement/vouvoiement : VOUVOIEMENT toujours (sauf instruction contraire du cabinet).
- Longueur : court. Un courtier occupé écrit court. 90-130 mots selon le mode.

PRINCIPE DE CONTENU CRITIQUE :
Adapte le ton ET la structure selon la complétude du profil (modes COMPLETE / PARTIAL / INCOMPLETE fournis ci-dessous). Respecte la structure du mode mais garde le style humain ci-dessus.

N'invente JAMAIS un montant, une banque, un taux ou un fait absent du profil.

Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown.`,
};

// ═══════════════════════════════════════════════════════════════════════
//  Instructions par mode (3 niveaux d'adaptation)
// ═══════════════════════════════════════════════════════════════════════

function buildModeInstructions(
  mode: CompletenessAnalysis['level'],
  missing: string[],
  redFlags: string[],
  greenFlags: string[],
): string {
  if (mode === 'complete') {
    return `
═══ MODE : COMPLETE (profil suffisamment renseigné) ═══

L'email doit :
1. Saluer (utiliser le prénom si connu)
2. Confirmer la prise en compte de la demande de financement
3. Mettre en avant 1 ou 2 points forts du dossier issus de greenFlags :
   ${greenFlags.length > 0 ? greenFlags.map(g => `   • ${g}`).join('\n') : '   (aucun signal vert détecté)'}
4. Indiquer un délai concret (24-48 h ouvrées) pour un retour
5. Proposer un créneau d'échange téléphonique de 15 min OU
   joindre une checklist des documents à préparer (au choix selon contexte)
6. Signature standard

STRUCTURE OBLIGATOIRE — un mail clair, 90-130 mots, fluide.
PAS de "merci pour votre intérêt", PAS de "j'espère que vous allez bien".

${redFlags.length > 0 ? `
ATTENTION — drapeaux rouges détectés :
${redFlags.map(r => `  • ${r}`).join('\n')}
→ NE PAS les mentionner directement dans l'email. Le courtier les abordera en RDV.
→ Adopter un ton un peu plus prudent ("nous allons étudier ensemble vos possibilités") plutôt qu'enthousiaste.
` : ''}
`
  }

  if (mode === 'partial') {
    return `
═══ MODE : PARTIAL (informations clés manquantes) ═══

L'email doit :
1. Saluer (utiliser le prénom si connu)
2. Confirmer la prise en compte de la demande
3. Mentionner 1 point positif si disponible :
   ${greenFlags.length > 0 ? `   ${greenFlags.slice(0, 1).map(g => `• ${g}`).join('')}` : '   (aucun, rester factuel)'}
4. EXPLIQUER POURQUOI on a besoin de plus d'infos (en 1 phrase courte)
   Exemple : "Pour vous orienter vers les meilleures banques selon votre profil, j'ai besoin de quelques précisions."
5. DEMANDER UNIQUEMENT les éléments manquants suivants, formulés simplement :
${missing.map(m => `   → ${m}`).join('\n')}
   ⚠️ Reformuler en langage naturel (pas une liste froide).
   Exemple : "Pourriez-vous me préciser vos revenus mensuels nets et le montant de votre apport disponible ?"
6. Signature standard

STRUCTURE OBLIGATOIRE — 80-110 mots. Pas plus.
Le ton est celui d'un courtier sympathique qui montre qu'il prend le dossier au sérieux.
`
  }

  // INCOMPLETE
  return `
═══ MODE : INCOMPLETE (très peu d'infos exploitables) ═══

L'email doit :
1. Saluer (utiliser le prénom si connu, sinon "Bonjour,")
2. Confirmer la réception de la demande
3. Expliquer brièvement la démarche (1 phrase) :
   "Pour vous proposer un accompagnement adapté, j'aurais besoin d'en savoir un peu plus sur votre projet."
4. POSER 3 QUESTIONS OUVERTES MAXIMUM qui structurent un premier échange :
   - Sur le projet (achat principal, locatif, refinancement…)
   - Sur la situation pro (CDI / indépendant / etc.)
   - Sur le timing souhaité
   ⚠️ Phrases simples, jamais une liste. Une question par paragraphe court.
5. Proposer un appel de 15 min comme alternative ("ou si vous préférez, un appel de 15 min")
6. Signature standard

STRUCTURE OBLIGATOIRE — 90-120 mots.
Le ton est celui d'un courtier qui rassure et ne juge pas le manque d'infos.
`
}

// ═══════════════════════════════════════════════════════════════════════
//  Prompt principal
// ═══════════════════════════════════════════════════════════════════════

function buildPrompt(
  q: QualificationResult,
  s: ScoringResult,
  completeness: CompletenessAnalysis,
  jurisdiction: 'FR' | 'CH' | 'unknown',
): string {
  const lines: string[] = [
    `Type : ${q.type}`,
    `Score : ${s.score}/100 (${s.temperature})`,
    `Juridiction détectée : ${jurisdiction}`,
    `Complétude profil : ${completeness.level} (${completeness.score}/100)`,
  ];

  if (q.firstName) lines.push(`Prénom : ${q.firstName}`);
  if (q.lastName) lines.push(`Nom : ${q.lastName}`);
  if (q.propertyType) lines.push(`Type de bien : ${q.propertyType}`);
  if (q.address) lines.push(`Localisation : ${q.address}`);
  if (q.surface) lines.push(`Surface : ${q.surface} m²`);
  if (q.rooms) lines.push(`Pièces : ${q.rooms}`);
  if (q.price) lines.push(`Prix : ${q.price.toLocaleString('fr-FR')} ${jurisdiction === 'CH' ? 'CHF' : '€'}`);

  if (q.monthly_income !== null) lines.push(`Revenus mensuels : ${q.monthly_income.toLocaleString('fr-FR')}`);
  if (q.down_payment !== null)   lines.push(`Apport : ${q.down_payment.toLocaleString('fr-FR')}`);
  if (q.existing_debts_monthly !== null) lines.push(`Crédits en cours : ${q.existing_debts_monthly === 0 ? 'aucun' : q.existing_debts_monthly + '/mois'}`);
  if (q.employment_status) lines.push(`Situation pro : ${q.employment_status}`);
  if (q.is_couple !== null) lines.push(`Couple : ${q.is_couple ? 'oui' : 'non'}`);

  if (q.sell_timeline) {
    const labels = { less_3_months: '< 3 mois', '3_to_6_months': '3-6 mois', more_6_months: '> 6 mois' };
    lines.push(`Délai vente : ${labels[q.sell_timeline]}`);
  }
  if (q.purchase_timeline) {
    const labels = { less_3_months: '< 3 mois', '3_to_6_months': '3-6 mois', more_6_months: '> 6 mois' };
    lines.push(`Délai achat : ${labels[q.purchase_timeline]}`);
  }
  if (q.financing_status) {
    const labels = { obtained: 'Financement obtenu', in_progress: 'En cours', none: 'Pas commencé' };
    lines.push(`Financement : ${labels[q.financing_status]}`);
  }

  if (q.motivationSignals.length > 0) lines.push(`Motivation : ${q.motivationSignals.join(', ')}`);
  if (q.urgencySignals.length > 0) lines.push(`Urgence : ${q.urgencySignals.join(', ')}`);
  if (q.description) lines.push(`Description : ${q.description}`);

  const modeInstructions = buildModeInstructions(
    completeness.level,
    completeness.missing,
    completeness.redFlags,
    completeness.greenFlags,
  );

  const hasName = q.firstName
    ? `Utiliser le prénom "${q.firstName}" dans la salutation.`
    : `Aucun prénom connu — commencer par "Bonjour," sans prénom.`;

  return `Génère l'email de réponse et le briefing d'appel pour ce prospect.

PROFIL EXTRAIT :
${lines.join('\n')}

${modeInstructions}

RÈGLES TRANSVERSALES :
- ${hasName}
- Français impeccable et naturel
- Ne JAMAIS inventer un montant, une banque, un délai, une référence légale non présente dans les données
- Pas de "J'espère que ce message vous trouve en bonne santé"
- Pas de "N'hésitez pas à me contacter" en closing
- Signature email : "Cordialement, [votre prénom] — Cabinet [nom de votre agence]"
  (utiliser ces placeholders tels quels)
- Objet du mail : sobre, max 60 caractères, sans point d'exclamation

CALL SCRIPT (briefing pour le courtier qui va appeler) :
- briefing : 1 phrase factuelle dense — prénom, type projet, point clé du profil, niveau d'urgence
- need : ce que le prospect cherche vraiment (1 phrase)
- keyQuestion : LA question qui va débloquer / qualifier le mieux le dossier en premier
  ${completeness.level === 'incomplete' ? 'Pour ce profil incomplet : poser la question qui révèle la SITUATION PROFESSIONNELLE.' : ''}
  ${completeness.level === 'partial' ? `Pour ce profil partiel : poser la question sur le ${completeness.missing[0] ?? 'point clé manquant'}.` : ''}
  ${completeness.level === 'complete' ? 'Pour ce profil complet : poser la question qui valide la motivation profonde ou le timing.' : ''}

Retourne ce JSON :
{
  "email": {
    "subject": "objet sobre, max 60 caractères",
    "body": "corps complet avec salutation, contenu adapté au mode, signature placeholder"
  },
  "callScript": {
    "briefing": "phrase courte et dense",
    "need": "ce que veut le prospect en 1 phrase",
    "keyQuestion": "la question d'ouverture la plus efficace"
  }
}`;
}

function parseJSON<T>(text: string): T {
  const clean = text.trim();
  try { return JSON.parse(clean) as T; }
  catch {
    const codeBlock = clean.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (codeBlock?.[1]) return JSON.parse(codeBlock[1]) as T;
    const rawBlock = clean.match(/(\{[\s\S]*\})/);
    if (rawBlock?.[1]) return JSON.parse(rawBlock[1]) as T;
    throw new Error('Réponse IA non parseable en JSON');
  }
}

export async function runProspectionAgent(
  qualification: QualificationResult,
  scoring: ScoringResult,
  sector: SectorId = 'credit',
  brokerMemory?: BrokerMemory | null,
): Promise<ProspectionResult> {
  // 1. Détecter la juridiction (FR / CH / unknown) depuis les données
  const allText = `${qualification.address ?? ''} ${qualification.description ?? ''}`;
  const jurisdiction = detectJurisdiction(allText);

  // 2. Analyser la complétude → détermine le mode (complete / partial / incomplete)
  const completeness = analyzeCompleteness(qualification);

  // 3. Construire le system prompt avec l'expertise injectée
  const brokerContext = buildBrokerContext(brokerMemory);
  const expertiseContext = buildExpertiseContext(jurisdiction);
  const systemPrompt = SYSTEM_PROMPT_BY_SECTOR[sector] + expertiseContext + brokerContext;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildPrompt(qualification, scoring, completeness, jurisdiction) }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Type de réponse inattendu de l\'IA');

  const result = parseJSON<ProspectionResult>(content.text);

  // 4. Appliquer la signature du cabinet
  if (brokerMemory) {
    result.email.body = applyBrokerMemoryToEmail(result.email.body, brokerMemory);
  }

  return result;
}
