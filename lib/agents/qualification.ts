import Anthropic from '@anthropic-ai/sdk';
import type { QualificationResult } from '@/types';
import { SECTORS, type SectorId } from '@/lib/sectors';

const client = new Anthropic();

function buildSystemPrompt(sector: SectorId): string {
  return `Tu es un expert en qualification de demandes de financement immobilier (France et Suisse).

Tu connais à la perfection :
- Les profils types : primo-accédant, investisseur locatif, refinancement, frontalier France/Suisse
- Les situations professionnelles bancables (CDI, fonctionnaire, indépendant ≥ 3 ans)
- Les indicateurs d'urgence (compromis signé, délai notaire, vente en cascade)
- Les spécificités CH (LPP, LAMAL, fonds propres durs) et FR (HCSF 35%, PTZ, IOBSP)

${SECTORS[sector].context}

Ta mission : extraire un profil structuré du texte fourni, en restant strictement fidèle.

RÈGLES :
- Extraire UNIQUEMENT les informations EXPLICITEMENT présentes (mots, chiffres, indices clairs)
- NE PAS inférer, compléter ou inventer
- Détecter aussi les indices implicites quand ils sont sans ambiguïté
  (ex : "Genève" → juridiction CH ; "compromis signé" → urgence + maturité)
- Reformuler les montants dans une unité cohérente
- Distinguer revenu individuel vs revenu de foyer si couple détecté

Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises markdown.`;
}

function buildPrompt(listing: string): string {
  return `Annonce ou demande à analyser :
${listing}

RÈGLES D'EXTRACTION STRICTES :

1. "type" — qui est le prospect que l'agence doit contacter ?
   - "vendeur" : quelqu'un qui vend ou veut vendre un bien (particulier OU bien en mandat d'agence)
   - "acheteur" : quelqu'un qui cherche à acheter
   - "locataire" : quelqu'un qui cherche à louer (pas le propriétaire-bailleur)
   - "inconnu" : impossible à déterminer avec certitude
   Si une agence publie un bien à vendre → type = "vendeur" (le vendeur est le prospect à rappeler)

2. "price" — toujours un entier, FORMAT :
   - "395'000 CHF" (suisse)   → 395000
   - "395.000 €" (européen)   → 395000  ← le point EST un séparateur de milliers
   - "395 000 €"              → 395000
   - Si c'est un budget acheteur → stocker dans price aussi
   - Retourner null si absent ou si prix = "nous consulter"

3. "rooms" — toujours un entier
   - "T3" ou "F3" ou "3 pièces" → 3
   - "3.5 pièces" (notation suisse) → 4  ← arrondir au supérieur
   - "3 chambres" → null  ← chambres ≠ pièces, ne pas confondre

4. "firstName" et "lastName" — extraire SEULEMENT si un prénom/nom est explicitement écrit
   - NE PAS déduire un prénom depuis une adresse email comme "marc.durand@..."
   - Si absent du texte → null

5. "email" et "phone" — extraire séparément
   - email : adresse email complète ou null
   - phone : numéro de téléphone ou null
   - contactInfo : si les deux existent → "email — téléphone", sinon celui qui est disponible

6. "sell_timeline" (pour vendeurs) — uniquement si mentionné explicitement :
   - Mots-clés "urgent", "rapidement", "dans X semaines/mois < 3", date dans < 3 mois → "less_3_months"
   - "d'ici 6 mois", "avant l'été" si cohérent avec la date → "3_to_6_months"
   - "pas pressé", "à terme", "quand occasion se présente" → "more_6_months"
   - Non mentionné → null

7. "purchase_timeline" (pour acheteurs) — même logique que sell_timeline

8. "financing_status" (pour acheteurs uniquement) :
   - "accord de principe", "prêt validé", "financement obtenu", "achat comptant", "cash" → "obtained"
   - "en cours avec banque", "dossier en cours", "courtier en train de" → "in_progress"
   - "sans financement encore", "pas encore commencé" → "none"
   - Non mentionné → null

9. CHAMPS CRÉDIT IMMOBILIER (critiques pour le scoring de bancabilité) :

   "monthly_income" — revenu net mensuel TOTAL du foyer (en euros ou CHF, entier) :
   - "Revenus combinés 5 800€/mois", "salaire net 4500 CHF" → 5800 ou 4500
   - Si annuel précisé : diviser par 12 (mais arrondir à l'entier)
   - Si plusieurs personnes : SOMMER les revenus
   - Non mentionné → null

   "down_payment" — apport personnel disponible (entier, dans la devise du dossier) :
   - "apport 50 000€", "apport de 170 000 CHF", "épargne disponible 80k" → entier
   - Non mentionné → null

   "existing_debts_monthly" — mensualités totales des crédits en cours :
   - "crédit auto 300€/mois", "déjà un prêt conso à 250€" → somme
   - "aucun crédit en cours", "endettement nul/quasi nul" → 0
   - Non mentionné → null

   "employment_status" — situation professionnelle dominante :
   - "CDI", "intérim CDI" → "cdi"
   - "fonctionnaire", "agent territorial", "enseignant titulaire" → "fonctionnaire"
   - "CDD", "intérim" → "cdd"
   - "indépendant", "freelance", "auto-entrepreneur", "libéral", "gérant" → "independant"
   - "retraité" → "retraite"
   - "sans emploi", "chômage" → "sans_emploi"
   - Non mentionné → null
   - Si couple mixte : retourner le statut le PLUS solide (cdi > fonctionnaire > cdd > independant > retraite > sans_emploi)

   "is_couple" — true si demande explicitement en couple/à deux :
   - "nous cherchons", "en couple", "tous les deux en CDI", "mon conjoint et moi" → true
   - "je cherche", "mon projet" sans mention couple → false
   - Ambigu → null

10. "description" — résumé FACTUEL de 1-2 phrases, UNIQUEMENT avec les infos présentes dans le texte

11. "motivationSignals" et "urgencySignals" — UNIQUEMENT les éléments présents dans le texte
    motivationSignals = POURQUOI le projet (résidence principale, locatif, secondaire, etc.)
    urgencySignals = QUAND / avec quelle pression temporelle (compromis signé, délai, etc.)

Retourne ce JSON (null si information absente, ne jamais inventer) :
{
  "type": "vendeur" | "acheteur" | "locataire" | "inconnu",
  "firstName": string | null,
  "lastName": string | null,
  "email": string | null,
  "phone": string | null,
  "contactInfo": string | null,
  "propertyType": string | null,
  "address": string | null,
  "surface": number | null,
  "rooms": number | null,
  "price": number | null,
  "monthly_income": number | null,
  "down_payment": number | null,
  "existing_debts_monthly": number | null,
  "employment_status": "cdi" | "fonctionnaire" | "cdd" | "independant" | "retraite" | "sans_emploi" | null,
  "is_couple": boolean | null,
  "sell_timeline": "less_3_months" | "3_to_6_months" | "more_6_months" | null,
  "purchase_timeline": "less_3_months" | "3_to_6_months" | "more_6_months" | null,
  "financing_status": "obtained" | "in_progress" | "none" | null,
  "description": string,
  "motivationSignals": string[],
  "urgencySignals": string[]
}`;
}

function parseJSON<T>(text: string): T {
  const clean = text.trim();
  try {
    return JSON.parse(clean) as T;
  } catch {
    const codeBlock = clean.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (codeBlock?.[1]) return JSON.parse(codeBlock[1]) as T;
    const rawBlock = clean.match(/(\{[\s\S]*\})/);
    if (rawBlock?.[1]) return JSON.parse(rawBlock[1]) as T;
    throw new Error('Réponse IA non parseable en JSON');
  }
}

export async function runQualificationAgent(
  listing: string,
  sector: SectorId = 'credit',
): Promise<QualificationResult> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2048,
    system: buildSystemPrompt(sector),
    messages: [{ role: 'user', content: buildPrompt(listing) }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Type de réponse inattendu de l\'IA');

  return parseJSON<QualificationResult>(content.text);
}
