import Anthropic from '@anthropic-ai/sdk';
import type { QualificationResult, ScoringResult, ProspectionResult, BrokerMemory } from '@/types';
import type { SectorId } from '@/lib/sectors';
import { buildBrokerContext, applyBrokerMemoryToEmail } from '@/lib/broker/memory';

const client = new Anthropic();

const SYSTEM_PROMPT_BY_SECTOR: Record<SectorId, string> = {
  credit: `Tu es un expert en prospection pour un cabinet de courtage en crédit immobilier.
Ton ton est rassurant, précis et orienté solution. Tu mets en avant l'expertise bancaire et le gain de temps.
Tu n'inventes jamais d'informations absentes du profil fourni.
Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown.`,
};

function buildPrompt(q: QualificationResult, s: ScoringResult): string {
  // Construire le profil uniquement avec les données disponibles
  const lines: string[] = [`Type : ${q.type}`, `Score : ${s.score}/100 (${s.temperature})`];

  if (q.firstName) lines.push(`Prénom : ${q.firstName}`);
  if (q.lastName) lines.push(`Nom : ${q.lastName}`);
  if (q.propertyType) lines.push(`Type de bien : ${q.propertyType}`);
  if (q.address) lines.push(`Localisation : ${q.address}`);
  if (q.surface) lines.push(`Surface : ${q.surface} m²`);
  if (q.rooms) lines.push(`Pièces : ${q.rooms}`);
  if (q.price) lines.push(`Prix : ${q.price.toLocaleString('fr-FR')} €`);

  if (q.sell_timeline) {
    const labels = { less_3_months: '< 3 mois', '3_to_6_months': '3-6 mois', more_6_months: '> 6 mois' };
    lines.push(`Délai de vente : ${labels[q.sell_timeline]}`);
  }
  if (q.purchase_timeline) {
    const labels = { less_3_months: '< 3 mois', '3_to_6_months': '3-6 mois', more_6_months: '> 6 mois' };
    lines.push(`Délai d'achat : ${labels[q.purchase_timeline]}`);
  }
  if (q.financing_status) {
    const labels = { obtained: 'Financement obtenu', in_progress: 'Financement en cours', none: 'Sans financement' };
    lines.push(`Financement : ${labels[q.financing_status]}`);
  }

  if (q.motivationSignals.length > 0) lines.push(`Motivation : ${q.motivationSignals.join(', ')}`);
  if (q.urgencySignals.length > 0) lines.push(`Urgence : ${q.urgencySignals.join(', ')}`);
  if (q.description) lines.push(`Description : ${q.description}`);
  lines.push(`Analyse : ${s.explanation}`);

  // Adapter les instructions selon le type et la disponibilité des données
  const typeInstructions = {
    vendeur: `CONTEXTE VENDEUR : mettre en avant l'estimation gratuite, la connaissance du marché local, et la capacité à vendre rapidement au meilleur prix.`,
    acheteur: `CONTEXTE ACHETEUR : mettre en avant les biens disponibles correspondant au projet, la réactivité et l'accompagnement personnalisé.`,
    locataire: `CONTEXTE LOCATAIRE : mettre en avant les biens disponibles à la location, le suivi de la demande, et la réactivité.`,
    inconnu: `CONTEXTE INCONNU : rester général, proposer une prise de contact pour clarifier le projet. Ne pas présumer du type de projet.`,
  };

  const hasName = q.firstName ? `Utiliser le prénom "${q.firstName}" dans la salutation.` : `Pas de prénom connu — commencer par "Bonjour," sans prénom.`;

  const dataRichness = lines.length > 8 ? 'riche' : 'limité';
  const dataNote = dataRichness === 'limité'
    ? `DONNÉES LIMITÉES : le profil est incomplet. Rester dans ce qui est connu, ne rien inventer. Proposer un rendez-vous pour en apprendre plus.`
    : `Personnaliser avec les informations disponibles dans le profil.`;

  return `Génère les outils de prospection pour ce prospect.

PROFIL :
${lines.join('\n')}

${typeInstructions[q.type]}

RÈGLES ABSOLUES :
- Ton professionnel, chaleureux, humain — jamais robotique ni générique
- ${hasName}
- ${dataNote}
- Ne jamais inventer de détails absents du profil (prix, adresse, surface...)
- Français impeccable et naturel
- Email : entre 80 et 120 mots exactement (compter avant de répondre)
- Pas de bullet points dans l'email
- Script : phrases naturelles comme une vraie conversation téléphonique
- Pas de "J'espère que ce message vous trouve en bonne santé"
- Pas de "N'hésitez pas à me contacter" en closing
- Signature email : "Cordialement, [votre prénom] — Agence [nom de votre agence]"
  (utiliser ces placeholders tels quels — ils seront remplacés par l'agence)

Retourne ce JSON :
{
  "email": {
    "subject": "objet percutant et personnalisé (max 60 caractères, sans point d'exclamation)",
    "body": "corps complet avec salutation, corps, proposition concrète, signature placeholder"
  },
  "callScript": {
    "briefing": "1 phrase max : prénom + type + situation clé + urgence. Ex: 'Marc Durand, vendeur T3 Lyon 6ème, mutation pro — départ fin juillet, vente urgente.'",
    "need": "Ce que le prospect veut concrètement obtenir de cet appel (1 phrase)",
    "keyQuestion": "La question la plus importante à poser en PREMIER, celle qui qualifie ou débloquerait la situation"
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
  // Injecter le contexte du cabinet dans le system prompt
  const brokerContext = buildBrokerContext(brokerMemory);
  const systemPrompt = SYSTEM_PROMPT_BY_SECTOR[sector] + brokerContext;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildPrompt(qualification, scoring) }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Type de réponse inattendu de l\'IA');

  const result = parseJSON<ProspectionResult>(content.text);

  // Appliquer la signature et placeholders sur l'email rédigé
  if (brokerMemory) {
    result.email.body = applyBrokerMemoryToEmail(result.email.body, brokerMemory);
  }

  return result;
}
