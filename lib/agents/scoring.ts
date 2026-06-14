import Anthropic from '@anthropic-ai/sdk';
import type { QualificationResult, ScoringResult, BrokerMemory } from '@/types';
import type { SectorId } from '@/lib/sectors';
import { buildScoringWeights } from '@/lib/broker/memory';
import { detectJurisdiction, buildExpertiseContext } from './expertise';

const client = new Anthropic();

const SYSTEM_PROMPT = `Tu es un expert en évaluation de bancabilité crédit immobilier.
Tu connais à la perfection les règles HCSF (France) et FINMA (Suisse).
Applique le barème fourni de manière mécanique et précise.
Tu détectes les drapeaux rouges du métier (endettement > 35%, apport insuffisant, situation pro fragile).
Tu identifies aussi les drapeaux verts (compromis signé, CDI stable, apport solide).
Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown.`;

// ═══════════════════════════════════════════════════════════════════════
//  Barème crédit immobilier — règles bancaires réelles
//  Mis à jour conformément aux décisions HCSF 2024 et FINMA 2025
// ═══════════════════════════════════════════════════════════════════════

const BAREME_CREDIT = `
═══════════════════════════════════════════════════════════
  BARÈME DE BANCABILITÉ — crédit immobilier
═══════════════════════════════════════════════════════════

▌SITUATION PROFESSIONNELLE (35 points max)
  employment_status = "fonctionnaire"                              +30
  employment_status = "cdi"                                        +25
  employment_status = "retraite" (pension fixe)                    +20
  employment_status = "independant" (≥3 ans présumés)              +12
  employment_status = "cdd"                                         +5
  employment_status = "sans_emploi"                                 +0
  employment_status = null (non précisé)                            +3

▌APPORT PERSONNEL (25 points max)
  Calcul : (down_payment / price) × 100
  Apport ≥ 30% du prix                                             +25
  Apport 20-30%                                                    +22
  Apport 10-20%                                                    +15
  Apport 5-10%                                                      +6
  Apport < 5% (très limite HCSF)                                    +0
  Données manquantes (l'un des deux null)                           +5

▌TAUX D'ENDETTEMENT ACTUEL (20 points max)
  Calcul : (existing_debts_monthly / monthly_income) × 100
  Endettement = 0 (aucun crédit en cours)                          +20
  Endettement < 10%                                                +15
  Endettement 10-20%                                                +8
  Endettement 20-30%                                                +3
  Endettement > 30% (très proche limite HCSF 35%)                   +0
  Données manquantes (l'un des deux null)                           +5

▌MATURITÉ DU PROJET (20 points max — non cumulables si redondants)
  urgencySignals contient "compromis signé"                        +20
  financing_status = "obtained" (accord de principe)               +18
  purchase_timeline = "less_3_months"                              +12
  purchase_timeline = "3_to_6_months"                               +6
  financing_status = "in_progress"                                  +5

▌QUALITÉ DU CONTACT (5 points max)
  email ET phone tous deux non null                                 +5
  email OU phone non null (un seul)                                 +3

═══════════════════════════════════════════════════════════
  PLAFONDS DE SCORE
═══════════════════════════════════════════════════════════
  • Score final plafonné à 100
  • Si revenus ET situation pro ET apport tous null → max 35
  • Si situation pro = "sans_emploi" ou "cdd" sans autre force → max 50
  • Si endettement calculé > 30% → ne pas dépasser 65 (warm)

═══════════════════════════════════════════════════════════
  TEMPÉRATURES
═══════════════════════════════════════════════════════════
  0-30  = cold (lead à recontacter manuellement plus tard)
  31-60 = warm (qualification à approfondir avant banque)
  61-100 = hot (dossier prêt pour montage banque immédiat)

═══════════════════════════════════════════════════════════
  DRAPEAUX À DÉTECTER (à mentionner dans explanation)
═══════════════════════════════════════════════════════════

🔴 ROUGES (mentionner si présents) :
  • Apport calculé < 5% du prix
  • Endettement calculé > 30%
  • employment_status = "cdd" ou "sans_emploi"
  • Données critiques manquantes (revenus + apport + situation tous null)

🟢 VERTS (mentionner si présents) :
  • Apport ≥ 20%
  • Compromis signé
  • Accord de principe d'une autre banque
  • Couple CDI + aucun endettement
`;

function buildPrompt(q: QualificationResult, sector: SectorId, jurisdiction: 'FR' | 'CH' | 'unknown'): string {
  if (sector === 'credit') {
    return `Données du contact à scorer :
${JSON.stringify(q, null, 2)}

Juridiction détectée : ${jurisdiction}

${BAREME_CREDIT}

RÈGLES ABSOLUES :
1. Ne jamais attribuer de points pour un champ null (cf. fallbacks dans le barème)
2. Score final plafonné à 100
3. COHÉRENCE : somme des "points" dans keyFactors = score retourné
4. N'inclure dans keyFactors QUE les critères ayant contribué positivement
5. L'explanation doit citer explicitement 1-2 drapeaux (rouge ou vert) détectés
   et lister 1-2 informations critiques manquantes le cas échéant

Retourne ce JSON :
{
  "score": number,
  "temperature": "cold" | "warm" | "hot",
  "explanation": "3-4 phrases factuelles : points forts, informations manquantes, drapeaux détectés. Doit aider le courtier à décider en 5 secondes.",
  "keyFactors": [{ "factor": "libellé court", "impact": "positive", "points": number }]
}`;
  }

  // Fallback immobilier (gardé pour compatibilité, non utilisé en MVP)
  return `Données du prospect :
${JSON.stringify(q)}

═══ VENDEUR ═══════════════════════════════════════════════
Critère                                           Points
─────────────────────────────────────────────────────────
address non null                                    +20
propertyType ET surface tous les deux non null      +10
sell_timeline = "less_3_months"                     +30
sell_timeline = "3_to_6_months"                     +20
sell_timeline = "more_6_months"                      +8
Motivation FORTE                                    +25
email OU phone non null                             +10
price non null                                       +5

═══ ACHETEUR ══════════════════════════════════════════════
price non null                                      +15
financing_status = "obtained"                       +25
financing_status = "in_progress"                    +10
purchase_timeline = "less_3_months"                 +25
purchase_timeline = "3_to_6_months"                 +20
address non null                                    +10
propertyType ET (surface OU rooms) non null         +15
email OU phone non null                             +10

═══ TYPE INCONNU OU LOCATAIRE ═════════════════════════════
Score = 10, temperature = "cold"

RÈGLES :
1. Appliquer UN SEUL barème selon le type
2. Pas de points pour un champ null
3. Somme keyFactors = score
4. Plafond 100

Retourne ce JSON :
{
  "score": number,
  "temperature": "cold" | "warm" | "hot",
  "explanation": "3 phrases factuelles avec drapeaux et infos manquantes",
  "keyFactors": [{ "factor": "libellé court", "impact": "positive", "points": number }]
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

export async function runScoringAgent(
  qualification: QualificationResult,
  sector: SectorId = 'credit',
  brokerMemory?: BrokerMemory | null,
): Promise<ScoringResult> {
  // Détecter juridiction pour injecter l'expertise pays-spécifique
  const allText = `${qualification.address ?? ''} ${qualification.description ?? ''}`;
  const jurisdiction = detectJurisdiction(allText);

  // Pondérations personnalisées du cabinet
  const customWeights = buildScoringWeights(brokerMemory);

  // System prompt enrichi : règles HCSF/FINMA + drapeaux à détecter
  const expertiseContext = buildExpertiseContext(jurisdiction);
  const systemPrompt = SYSTEM_PROMPT + expertiseContext + customWeights;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildPrompt(qualification, sector, jurisdiction) }],
  }, { timeout: 30_000 });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Type de réponse inattendu de l\'IA');

  return parseJSON<ScoringResult>(content.text);
}
