import Anthropic from '@anthropic-ai/sdk';
import type { QualificationResult, ScoringResult } from '@/types';
import type { SectorId } from '@/lib/sectors';

const client = new Anthropic();

const SYSTEM_PROMPT = `Tu es un expert en lead scoring.
Applique le barème fourni de manière mécanique et précise.
Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown.`;

// Barèmes additionnels pour secteurs non-immobilier
const BAREME_CREDIT = `
═══ EMPRUNTEUR (crédit immobilier) ═══════════════════════════════════
Critère                                                          Points
─────────────────────────────────────────────────────────────────────
description ou motivationSignals mentionne CDI/fonctionnaire       +25
description mentionne indépendant > 3 ans d'ancienneté             +15
description mentionne CDD/intérim/sans emploi                       +5
Apport > 20% du prix du bien (calculer depuis les données)         +25
Apport 10-20%                                                       +15
Apport < 10% ou non précisé                                         +5
urgencySignals contient "compromis signé"                          +20
purchase_timeline = "less_3_months" (ou compromis)                  +10
financing_status = "obtained" (accord bancaire existant)           +15
financing_status = "in_progress"                                     +8
Aucun crédit en cours mentionné (pas de charge existante)          +10
email OU phone non null                                              +5
─────────────────────────────────────────────────────────────────────
Maximum possible                                                    100

Rappel températures : 0-30 = cold | 31-60 = warm | 61-100 = hot`;

function buildPrompt(q: QualificationResult, sector: SectorId = 'credit'): string {
  // Secteur 'credit' uniquement pour le MVP
  if (sector === 'credit') {
    const bareme = BAREME_CREDIT;
    return `Données du contact :
${JSON.stringify(q)}

BARÈME DE SCORING :
${bareme}

RÈGLES ABSOLUES :
1. Ne jamais attribuer de points pour un champ null
2. Score final plafonné à 100
3. COHÉRENCE : somme des "points" dans keyFactors = score retourné
4. N'inclure que les critères qui ont contribué positivement

Retourne ce JSON :
{
  "score": number,
  "temperature": "cold" | "warm" | "hot",
  "explanation": "2-3 phrases claires mentionnant les points forts ET les informations manquantes",
  "keyFactors": [{ "factor": "libellé court", "impact": "positive", "points": number }]
}`;
  }

  // Secteur immobilier : barème complet existant
  return `Données du prospect :
${JSON.stringify(q)}

BARÈME DE SCORING — appliquer UNIQUEMENT le barème du type détecté :

═══ VENDEUR ═══════════════════════════════════════════════
Critère                                           Points
─────────────────────────────────────────────────────────
address non null (adresse précise)                  +20
propertyType ET surface tous les deux non null      +10
sell_timeline = "less_3_months"                     +30
sell_timeline = "3_to_6_months"                     +20
sell_timeline = "more_6_months"                      +8
sell_timeline = null                                  +0  ← ne pas inventer
Motivation FORTE dans motivationSignals             +25
  (divorce, mutation, succession, difficultés fin.)
Motivation MODÉRÉE dans motivationSignals           +10
  (déménagement, upgrade, nouveau projet)
  NB : si motivation forte → +25, pas +25+10
email OU phone non null (contact disponible)        +10
price non null (prix de vente défini)                +5
─────────────────────────────────────────────────────────
Maximum possible                                    100

═══ ACHETEUR ══════════════════════════════════════════════
Critère                                           Points
─────────────────────────────────────────────────────────
price non null (budget défini)                      +15
financing_status = "obtained"                       +25
financing_status = "in_progress"                    +10
financing_status = "none" ou null                    +0
purchase_timeline = "less_3_months"                 +25
purchase_timeline = "3_to_6_months"                 +20
purchase_timeline = "more_6_months"                  +8
purchase_timeline = null                              +0  ← ne pas inventer
address non null (zone géographique définie)        +10
propertyType ET (surface OU rooms) non null         +15
email OU phone non null (contact disponible)        +10
─────────────────────────────────────────────────────────
Maximum possible                                    100

═══ TYPE INCONNU ══════════════════════════════════════════
Si type = "inconnu" ou "locataire" :
Attribuer un score de 10 avec temperature "cold".
Explication : "Type de prospect non déterminé — qualification manuelle requise."
keyFactors : tableau vide []

RÈGLES ABSOLUES :
1. Appliquer UN SEUL barème selon le type du prospect
2. Ne jamais attribuer de points pour un champ null
3. Ne pas inventer de timeline ni de motivation non présents dans les données
4. Score final = somme des points positifs, plafonné à 100 (jamais > 100)
5. COHÉRENCE OBLIGATOIRE : la somme des "points" dans keyFactors doit être EXACTEMENT égale au score retourné
6. N'inclure dans keyFactors que les critères qui ont contribué positivement au score
7. impact = "positive" pour tous les facteurs retenus (ne pas mettre "negative")

Retourne ce JSON :
{
  "score": number,
  "temperature": "cold" | "warm" | "hot",
  "explanation": "2-3 phrases claires pour un agent immobilier — mentionner les points forts ET les informations manquantes importantes",
  "keyFactors": [
    { "factor": "libellé court du critère", "impact": "positive", "points": number }
  ]
}

Rappel températures : 0-30 = cold | 31-60 = warm | 61-100 = hot`;
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
): Promise<ScoringResult> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt(qualification, sector) }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Type de réponse inattendu de l\'IA');

  return parseJSON<ScoringResult>(content.text);
}
