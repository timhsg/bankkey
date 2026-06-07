import type { QualificationResult, ScoringResult, ProspectionResult } from '@/types';

// ════════════════════════════════════════════════════════════════════════
//  Données mockées pour le Product Theater
//  5 prospects réalistes — chacun avec email entrant + analyse BankKey
// ════════════════════════════════════════════════════════════════════════

export interface MockProspect {
  id: string;
  // Email entrant brut
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO date
  receivedDisplay: string; // "À l'instant", "10:21", "Hier", etc.
  // Résultats BankKey (déjà analysés)
  qualification: QualificationResult;
  scoring: ScoringResult;
  prospection: ProspectionResult;
}

// ────────────────────────────────────────────────────────────────────────
//  Prospect 1 — Camille Martin (nouveau, score 87, prioritaire)
//  Couple CDI à Genève, compromis signé, dossier urgent
// ────────────────────────────────────────────────────────────────────────

const camille: MockProspect = {
  id: 'p-camille',
  fromName: 'Camille Martin',
  fromEmail: 'camille.martin@email.fr',
  subject: 'Recherche financement résidence principale — délai 45 jours',
  body: `Bonjour,

Nous cherchons un courtier pour financer notre résidence principale à Genève. Nous sommes en couple, tous les deux en CDI depuis plus de 5 ans (un cadre dans le tertiaire, une fonctionnaire). Revenus nets combinés : 5 800 CHF/mois.

Le bien : un 4 pièces de 95 m² en centre-ville de Genève, prix 850 000 CHF. Nous avons un apport disponible de 170 000 CHF (épargne + 3ème pilier débloqué pour fonds propres).

Nous avons signé le compromis la semaine dernière, le notaire nous demande une attestation bancaire d'ici 45 jours. Aucun crédit en cours, endettement quasi nul.

Pouvez-vous nous accompagner ? Disponible pour un appel en fin de journée.

Cordialement,
Camille Martin
07 89 87 65 43`,
  receivedAt: '2026-06-07T10:00:00Z',
  receivedDisplay: "À l'instant",
  qualification: {
    type: 'acheteur',
    firstName: 'Camille',
    lastName: 'Martin',
    email: 'camille.martin@email.fr',
    phone: '07 89 87 65 43',
    contactInfo: 'camille.martin@email.fr — 07 89 87 65 43',
    propertyType: '4 pièces (95 m²)',
    address: 'Genève centre-ville',
    surface: 95,
    rooms: 4,
    price: 850000,
    monthly_income: 5800,
    down_payment: 170000,
    existing_debts_monthly: 0,
    employment_status: 'cdi',
    is_couple: true,
    sell_timeline: null,
    purchase_timeline: 'less_3_months',
    financing_status: 'none',
    description: "Couple CDI cherche financement résidence principale 850k CHF à Genève. Compromis signé, délai 45 jours.",
    motivationSignals: ['résidence principale', 'projet de vie'],
    urgencySignals: ['compromis signé', 'délai 45 jours', 'attestation bancaire urgente'],
  },
  scoring: {
    score: 87,
    temperature: 'hot',
    explanation: "Profil bancaire excellent : couple en CDI, apport de 20%, aucun endettement et compromis déjà signé. Dossier prioritaire à traiter dans la journée pour respecter le délai notarial.",
    keyFactors: [
      { factor: 'Situation CDI', impact: 'positive', points: 25 },
      { factor: 'Apport 20%', impact: 'positive', points: 25 },
      { factor: 'Aucun endettement', impact: 'positive', points: 20 },
      { factor: 'Compromis signé', impact: 'positive', points: 20 },
      { factor: 'Contact complet', impact: 'positive', points: 5 },
    ],
  },
  prospection: {
    email: {
      subject: 'Votre projet de financement à Genève',
      body: `Bonjour Camille,

Merci pour votre message. Votre projet correspond exactement aux dossiers que nous traitons quotidiennement : couple en CDI, apport solide à 20%, compromis signé — c'est un profil très bancable.

Compte tenu de votre délai notarial de 45 jours, je peux dès cette semaine présenter votre dossier à 4-5 établissements partenaires et obtenir des conditions précises sous 10 jours ouvrés.

Pour préparer cet envoi, j'aurais besoin de quelques pièces : vos 3 dernières fiches de salaire, le compromis, et les attestations de votre 3ème pilier. Pouvons-nous échanger 15 minutes en fin d'après-midi pour cadrer la suite ?

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Camille Martin, couple CDI Genève, achat 850k CHF avec 170k d'apport — compromis signé, attestation bancaire requise sous 45 jours.",
      need: "Obtenir rapidement une attestation de financement crédible pour rassurer le notaire et confirmer la transaction, avec le meilleur taux possible.",
      keyQuestion: "Avez-vous déjà sollicité votre banque principale ou souhaitez-vous que je vous mette directement en concurrence avec 4-5 établissements ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Prospect 2 — Sophie Lefèvre (score 72, prioritaire)
//  CDI Lyon, apport 18%, compromis en préparation
// ────────────────────────────────────────────────────────────────────────

const sophie: MockProspect = {
  id: 'p-sophie',
  fromName: 'Sophie Lefèvre',
  fromEmail: 'sophie.lefevre@gmail.com',
  subject: 'Demande de financement — premier achat à Lyon',
  body: `Bonjour,

Je vous contacte car je souhaite acheter mon premier appartement à Lyon (T3, environ 280 000€). Je suis en CDI depuis 4 ans en tant qu'ingénieure logicielle, mon salaire net est de 4 200€/mois.

J'ai pu épargner 50 000€ pour l'apport (environ 18% du prix). Pas de crédit en cours.

L'offre est intéressante et je vais signer le compromis dans 2-3 semaines. Pouvez-vous m'aider à trouver les meilleures conditions ?

Merci d'avance,
Sophie Lefèvre
06 12 34 56 78`,
  receivedAt: '2026-06-07T09:15:00Z',
  receivedDisplay: '09:15',
  qualification: {
    type: 'acheteur',
    firstName: 'Sophie',
    lastName: 'Lefèvre',
    email: 'sophie.lefevre@gmail.com',
    phone: '06 12 34 56 78',
    contactInfo: 'sophie.lefevre@gmail.com — 06 12 34 56 78',
    propertyType: 'T3',
    address: 'Lyon',
    surface: null,
    rooms: 3,
    price: 280000,
    monthly_income: 4200,
    down_payment: 50000,
    existing_debts_monthly: 0,
    employment_status: 'cdi',
    is_couple: false,
    sell_timeline: null,
    purchase_timeline: 'less_3_months',
    financing_status: 'none',
    description: "Primo-accédante CDI ingénieure Lyon, T3 à 280k, apport 18%.",
    motivationSignals: ['premier achat', 'résidence principale'],
    urgencySignals: ['compromis dans 2-3 semaines'],
  },
  scoring: {
    score: 72,
    temperature: 'hot',
    explanation: "Profil solide : CDI dans la tech, apport correct à 18%, aucune charge existante. Délai court avant compromis — à traiter rapidement pour préparer le dossier bancaire.",
    keyFactors: [
      { factor: 'CDI tech 4 ans', impact: 'positive', points: 25 },
      { factor: 'Apport 18%', impact: 'positive', points: 15 },
      { factor: 'Aucun crédit', impact: 'positive', points: 20 },
      { factor: 'Délai < 3 mois', impact: 'positive', points: 12 },
    ],
  },
  prospection: {
    email: {
      subject: 'Votre premier achat à Lyon — prochaines étapes',
      body: `Bonjour Sophie,

Merci de votre prise de contact. Votre profil — CDI tech, primo-accédante avec 18% d'apport — est typiquement bien accueilli par les banques en ce moment, notamment les établissements régionaux lyonnais.

Pour anticiper la signature du compromis, je vous propose d'amorcer dès maintenant la simulation et le pré-dossier. Cela vous permettra d'arriver chez le notaire avec un accord de principe en main.

Avez-vous 20 minutes cette semaine pour un échange téléphonique ? Je vous expliquerai la suite et la liste des documents à préparer.

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Sophie Lefèvre, primo-accédante CDI tech Lyon, T3 à 280k, apport 18% — compromis dans 2-3 semaines.",
      need: "Obtenir un accord de principe avant la signature du compromis pour sécuriser sa proposition.",
      keyQuestion: "Avez-vous déjà identifié des banques en particulier, ou souhaitez-vous que je vous propose une short-list adaptée aux primo-accédants tech ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Prospect 3 — Marc Dubois (score 65, prioritaire)
//  Refinancement crédit en cours
// ────────────────────────────────────────────────────────────────────────

const marc: MockProspect = {
  id: 'p-marc',
  fromName: 'Marc Dubois',
  fromEmail: 'm.dubois@orange.fr',
  subject: 'Renégociation de mon prêt immobilier',
  body: `Bonjour,

J'ai un prêt immobilier en cours depuis 2020 à Bordeaux : capital restant dû 220 000€, taux 2,8%, durée restante 17 ans. Mensualité actuelle 1 380€.

Avec la baisse des taux récente, je me demande s'il est possible de renégocier ou de refaire un rachat de crédit ailleurs. Je suis fonctionnaire (enseignant) titulaire depuis 12 ans, salaire net 3 200€/mois. Pas d'autre crédit.

Pouvez-vous m'indiquer si cela vaut le coup ?

Merci,
Marc Dubois
05 56 78 90 12`,
  receivedAt: '2026-06-07T08:42:00Z',
  receivedDisplay: '08:42',
  qualification: {
    type: 'acheteur',
    firstName: 'Marc',
    lastName: 'Dubois',
    email: 'm.dubois@orange.fr',
    phone: '05 56 78 90 12',
    contactInfo: 'm.dubois@orange.fr — 05 56 78 90 12',
    propertyType: 'Refinancement (prêt existant)',
    address: 'Bordeaux',
    surface: null,
    rooms: null,
    price: 220000,
    monthly_income: 3200,
    down_payment: null,
    existing_debts_monthly: 1380,
    employment_status: 'fonctionnaire',
    is_couple: false,
    sell_timeline: null,
    purchase_timeline: null,
    financing_status: 'obtained',
    description: "Fonctionnaire Bordeaux souhaite renégocier prêt en cours (capital 220k, taux 2,8%).",
    motivationSignals: ['baisse des taux', 'optimisation'],
    urgencySignals: [],
  },
  scoring: {
    score: 65,
    temperature: 'hot',
    explanation: "Fonctionnaire titulaire, opération de refinancement classique. Le rachat est probablement intéressant si différence de taux ≥ 0,7 point. À chiffrer rapidement.",
    keyFactors: [
      { factor: 'Fonctionnaire titulaire', impact: 'positive', points: 30 },
      { factor: 'Prêt existant à racheter', impact: 'positive', points: 15 },
      { factor: 'Aucun autre crédit', impact: 'positive', points: 15 },
      { factor: 'Contact complet', impact: 'positive', points: 5 },
    ],
  },
  prospection: {
    email: {
      subject: 'Étude de votre renégociation — Bordeaux',
      body: `Bonjour Marc,

Merci pour les éléments précis. Sur la base de votre prêt actuel (220k restants, 17 ans, 2,8%), une renégociation ou un rachat peut effectivement être intéressant — les meilleurs taux sur 17 ans tournent aujourd'hui autour de 3,3-3,6% mais avec votre profil de fonctionnaire titulaire, vous êtes éligible à des conditions préférentielles.

Je vous propose de faire une simulation chiffrée précise. J'aurai besoin de votre tableau d'amortissement actuel et de vos 2 derniers avis d'imposition. Je peux vous rappeler en début d'après-midi pour vérifier la rentabilité réelle de l'opération.

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Marc Dubois, fonctionnaire Bordeaux, refinancement prêt 220k existant à 2,8% — chercher mieux.",
      need: "Réduire sa mensualité ou raccourcir la durée du prêt grâce à un meilleur taux.",
      keyQuestion: "Quel est votre objectif principal : baisser la mensualité, réduire la durée, ou les deux ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Prospect 4 — Lisa Moreau (score 48, à qualifier)
//  Apport limité, situation à clarifier
// ────────────────────────────────────────────────────────────────────────

const lisa: MockProspect = {
  id: 'p-lisa',
  fromName: 'Lisa Moreau',
  fromEmail: 'lisa.m1992@yahoo.fr',
  subject: 'Question sur l\'apport pour un crédit',
  body: `Bonjour,

J'aimerais savoir si je peux obtenir un crédit immobilier dans ma situation. J'habite Paris, je suis en CDI (commerciale, salaire net 2 800€), depuis 2 ans. J'ai 12 000€ d'épargne.

Je n'ai pas encore de bien précis en tête, mais je vise quelque chose autour de 250 000€ en banlieue (94 ou 93).

Est-ce réaliste ? Faut-il que j'épargne plus d'abord ?

Merci,
Lisa`,
  receivedAt: '2026-06-07T10:21:00Z',
  receivedDisplay: '10:21',
  qualification: {
    type: 'acheteur',
    firstName: 'Lisa',
    lastName: 'Moreau',
    email: 'lisa.m1992@yahoo.fr',
    phone: null,
    contactInfo: 'lisa.m1992@yahoo.fr',
    propertyType: 'Indéterminé (250k)',
    address: 'Paris / 94 / 93',
    surface: null,
    rooms: null,
    price: 250000,
    monthly_income: 2800,
    down_payment: 12000,
    existing_debts_monthly: null,
    employment_status: 'cdi',
    is_couple: false,
    sell_timeline: null,
    purchase_timeline: 'more_6_months',
    financing_status: 'none',
    description: "CDI 2 ans Paris, vise 250k en banlieue, apport limité à 12k (4,8%).",
    motivationSignals: ['primo-accession'],
    urgencySignals: [],
  },
  scoring: {
    score: 48,
    temperature: 'warm',
    explanation: "Profil CDI mais apport très limité (5% du prix visé) et durée d'ancienneté courte. À qualifier pour évaluer la faisabilité — possiblement à conseiller d'épargner 6-12 mois supplémentaires.",
    keyFactors: [
      { factor: 'CDI 2 ans', impact: 'positive', points: 25 },
      { factor: 'Apport < 5%', impact: 'positive', points: 3 },
      { factor: 'Endettement non précisé', impact: 'positive', points: 5 },
      { factor: 'Email uniquement', impact: 'positive', points: 3 },
      { factor: 'Délai > 6 mois', impact: 'positive', points: 0 },
    ],
  },
  prospection: {
    email: {
      subject: 'Votre projet d\'achat à Paris — analyse rapide',
      body: `Bonjour Lisa,

Merci pour votre message. Votre situation est viable mais demande une analyse précise. Avec 2 800€ de revenus et 12 000€ d'apport, vous êtes plus proche d'un budget réaliste de 180-210k que de 250k — sauf à viser un bien hors marché tendu ou à compléter votre apport.

Je peux vous proposer un échange de 20 minutes pour vous donner une fourchette précise et un plan d'épargne adapté si nécessaire. C'est gratuit et sans engagement.

Quel est le meilleur moment pour vous cette semaine ?

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Lisa Moreau, CDI 2 ans Paris, projet 250k banlieue avec seulement 12k d'apport — à recadrer.",
      need: "Comprendre si son projet est viable et quelle stratégie adopter (acheter maintenant, épargner, viser plus modeste).",
      keyQuestion: "Êtes-vous flexible sur le budget cible ou la zone géographique, et quelle est votre capacité d'épargne mensuelle actuelle ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Prospect 5 — Alex Bernard (score 32, non prioritaire)
//  Phase exploratoire, pas de bien
// ────────────────────────────────────────────────────────────────────────

const alex: MockProspect = {
  id: 'p-alex',
  fromName: 'Alex Bernard',
  fromEmail: 'alex.bernard@protonmail.com',
  subject: 'Renseignements sur les crédits immobiliers',
  body: `Bonjour,

Je commence à réfléchir à un achat immobilier mais je suis encore loin de signer. Je voudrais savoir comment ça marche, les taux actuels, et combien je peux emprunter.

Je suis freelance graphiste à Nantes depuis 1 an et demi, mon CA varie entre 2 500€ et 3 800€/mois (TTC). Pas d'apport pour l'instant, mais je commence à épargner.

Je sais que c'est tôt mais je préfère anticiper.

Merci,
Alex`,
  receivedAt: '2026-06-06T15:30:00Z',
  receivedDisplay: 'Hier 15:30',
  qualification: {
    type: 'acheteur',
    firstName: 'Alex',
    lastName: 'Bernard',
    email: 'alex.bernard@protonmail.com',
    phone: null,
    contactInfo: 'alex.bernard@protonmail.com',
    propertyType: null,
    address: 'Nantes',
    surface: null,
    rooms: null,
    price: null,
    monthly_income: 3000,
    down_payment: 0,
    existing_debts_monthly: null,
    employment_status: 'independant',
    is_couple: false,
    sell_timeline: null,
    purchase_timeline: 'more_6_months',
    financing_status: 'none',
    description: "Freelance Nantes 1,5 an, revenus variables, sans apport — phase exploratoire.",
    motivationSignals: ['premier achat à terme'],
    urgencySignals: [],
  },
  scoring: {
    score: 32,
    temperature: 'cold',
    explanation: "Profil indépendant jeune (< 2 ans), sans apport et sans projet précis. À ce stade, prioriser une réponse pédagogique courte et garder le contact dans 6-12 mois.",
    keyFactors: [
      { factor: 'Indépendant', impact: 'positive', points: 15 },
      { factor: 'Aucun apport', impact: 'positive', points: 3 },
      { factor: 'Endettement non précisé', impact: 'positive', points: 5 },
      { factor: 'Email uniquement', impact: 'positive', points: 3 },
      { factor: 'Délai > 6 mois', impact: 'positive', points: 6 },
    ],
  },
  prospection: {
    email: {
      subject: 'Vos questions sur le crédit immobilier',
      body: `Bonjour Alex,

Merci pour votre message. Bonne nouvelle : vous anticipez, c'est la meilleure façon d'aborder un achat sereinement.

Quelques repères : avec 3 ans d'activité indépendante (bientôt 2 pour vous), les banques deviennent plus ouvertes. D'ici là, je vous conseille de constituer un apport de 10-15% minimum et de structurer votre comptabilité.

Je vous envoie en pièce jointe un guide d'achat pour indépendants. Je vous propose un point d'étape dans 6 mois pour ajuster votre projet, ou plus tôt si vos revenus se stabilisent.

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Alex Bernard, freelance Nantes 1,5 an, sans apport, phase exploratoire — pas de dossier immédiat.",
      need: "Comprendre la faisabilité future de son projet et savoir quoi préparer.",
      keyQuestion: "Avez-vous une idée du budget cible et de la zone géographique, ou êtes-vous totalement ouvert ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Export
// ────────────────────────────────────────────────────────────────────────

export const MOCK_PROSPECTS: MockProspect[] = [camille, sophie, marc, lisa, alex];

export const NEW_PROSPECT_ID = camille.id; // Celui qui arrive pendant l'auto-play
