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
//  Prospect 6 — Thomas Bernard (score 92, prioritaire)
//  Couple cadre, primo Toulouse, gros apport
// ────────────────────────────────────────────────────────────────────────

const thomas: MockProspect = {
  id: 'p-thomas',
  fromName: 'Thomas Bernard',
  fromEmail: 'thomas.bernard@laposte.net',
  subject: 'Premier achat — couple cadre Toulouse',
  body: `Bonjour,

Avec ma femme, nous cherchons à acheter notre première résidence à Toulouse. Tous deux cadres en CDI (moi depuis 6 ans en finance, ma femme depuis 4 ans en marketing). Revenus nets cumulés : 7 200€/mois.

Nous avons identifié un T4 de 105 m² dans le quartier des Carmes, à 425 000€. Nous disposons d'un apport de 110 000€ (26%).

Aucun crédit en cours. Compromis prévu sous 3 semaines.

Pouvez-vous nous accompagner pour obtenir le meilleur taux ?

Merci,
Thomas Bernard
06 65 43 21 09`,
  receivedAt: '2026-06-07T11:05:00Z',
  receivedDisplay: '11:05',
  qualification: {
    type: 'acheteur',
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas.bernard@laposte.net',
    phone: '06 65 43 21 09',
    contactInfo: 'thomas.bernard@laposte.net — 06 65 43 21 09',
    propertyType: 'T4 (105 m²)',
    address: 'Toulouse — Carmes',
    surface: 105,
    rooms: 4,
    price: 425000,
    monthly_income: 7200,
    down_payment: 110000,
    existing_debts_monthly: 0,
    employment_status: 'cdi',
    is_couple: true,
    sell_timeline: null,
    purchase_timeline: 'less_3_months',
    financing_status: 'none',
    description: "Couple cadre Toulouse, T4 Carmes 425k, apport 26%, compromis sous 3 semaines.",
    motivationSignals: ['premier achat', 'résidence principale'],
    urgencySignals: ['compromis sous 3 semaines'],
  },
  scoring: {
    score: 92,
    temperature: 'hot',
    explanation: "Profil de référence : couple cadres CDI, apport supérieur à 25%, aucun endettement, projet bien identifié. Bancabilité excellente, peu de friction attendue.",
    keyFactors: [
      { factor: 'Couple cadres CDI', impact: 'positive', points: 30 },
      { factor: 'Apport 26%', impact: 'positive', points: 27 },
      { factor: 'Aucun endettement', impact: 'positive', points: 20 },
      { factor: 'Compromis imminent', impact: 'positive', points: 15 },
    ],
  },
  prospection: {
    email: {
      subject: 'Votre T4 aux Carmes — préparons le dossier',
      body: `Bonjour Thomas,

Excellent profil pour une première acquisition : couple cadres avec un apport solide, sans dette, et un délai serré qui motive les banques. Sur ce type de dossier, je négocie habituellement entre 3,1% et 3,3% selon les établissements.

Je peux préparer un envoi à 5 banques partenaires dès cette semaine. J'aurais besoin de vos bulletins de salaire (3 derniers chacun), de vos avis d'imposition 2024, et du compromis dès qu'il est signé.

Êtes-vous disponible jeudi en fin de journée pour un point téléphonique ?

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Thomas Bernard, couple cadres Toulouse, T4 Carmes 425k, apport 26%, compromis sous 3 semaines.",
      need: "Verrouiller un excellent taux avant la signature du compromis pour ce premier achat.",
      keyQuestion: "Avez-vous déjà sollicité votre banque actuelle, ou souhaitez-vous une mise en concurrence complète dès le départ ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Prospect 7 — Léa Moreau (score 45, à qualifier)
//  CDD jeune, projet flou
// ────────────────────────────────────────────────────────────────────────

const lea: MockProspect = {
  id: 'p-lea',
  fromName: 'Léa Moreau',
  fromEmail: 'lea.m@protonmail.com',
  subject: 'Possibilités de prêt jeune actif',
  body: `Bonjour,

Je viens vers vous pour savoir si je peux espérer un crédit. J'ai 26 ans, en CDD renouvelé une fois (chargée de communication dans une PME). Salaire net 2 100€. J'épargne environ 250€/mois et j'ai 8 000€ de côté.

Je voudrais acheter un studio à Annecy autour de 175 000€ d'ici un an ou deux.

C'est tôt mais j'ai besoin d'y voir clair.

Merci,
Léa`,
  receivedAt: '2026-06-07T13:42:00Z',
  receivedDisplay: '13:42',
  qualification: {
    type: 'acheteur',
    firstName: 'Léa',
    lastName: 'Moreau',
    email: 'lea.m@protonmail.com',
    phone: null,
    contactInfo: 'lea.m@protonmail.com',
    propertyType: 'Studio',
    address: 'Annecy',
    surface: null,
    rooms: 1,
    price: 175000,
    monthly_income: 2100,
    down_payment: 8000,
    existing_debts_monthly: 0,
    employment_status: 'cdd',
    is_couple: false,
    sell_timeline: null,
    purchase_timeline: 'more_6_months',
    financing_status: 'none',
    description: "CDD 26 ans Annecy, studio 175k, apport 4,5% — projet à 1-2 ans.",
    motivationSignals: ['premier achat'],
    urgencySignals: [],
  },
  scoring: {
    score: 45,
    temperature: 'warm',
    explanation: "Profil jeune CDD, apport très faible, projet à moyen terme. Faisabilité limitée à court terme. Plan d'épargne et passage en CDI à anticiper.",
    keyFactors: [
      { factor: 'CDD renouvelé', impact: 'positive', points: 8 },
      { factor: 'Apport 4,5%', impact: 'positive', points: 5 },
      { factor: 'Capacité d\'épargne', impact: 'positive', points: 12 },
      { factor: 'Délai > 12 mois', impact: 'positive', points: 10 },
      { factor: 'Email seul', impact: 'positive', points: 10 },
    ],
  },
  prospection: {
    email: {
      subject: 'Votre projet d\'achat à Annecy',
      body: `Bonjour Léa,

Merci pour votre message. Votre démarche est saine : anticiper, c'est ce qui fait la différence sur ce type de marché.

Vous serez d'autant plus solide en CDI. Si la conversion est possible dans votre PME, c'est l'élément clé à activer. En attendant, continuer à épargner pour viser 15-20% d'apport vous mettra dans une zone confortable.

Je peux vous proposer un point de 20 minutes en visio pour vous donner un plan d'action concret. C'est gratuit, sans engagement. Quand êtes-vous dispo ?

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Léa Moreau, CDD 26 ans Annecy, projet studio 175k à 1-2 ans, apport faible.",
      need: "Comprendre quels leviers activer pour rendre son projet viable et dans quel délai.",
      keyQuestion: "Est-ce qu'un passage en CDI est envisagé dans votre PME, et à quelle échéance ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Prospect 8 — Pierre Garcia (score 78, prioritaire)
//  Lausanne, cadre, investissement locatif
// ────────────────────────────────────────────────────────────────────────

const pierre: MockProspect = {
  id: 'p-pierre',
  fromName: 'Pierre Garcia',
  fromEmail: 'p.garcia@bluemail.ch',
  subject: 'Financement immeuble de rendement Lausanne',
  body: `Bonjour,

Je m'intéresse à un immeuble de rendement à Lausanne (3 appartements, prix 1 850 000 CHF, rendement brut 4,2%). Je suis cadre supérieur secteur pharma, salaire fixe 12 500 CHF/mois + bonus annuel ~30 000 CHF.

Apport disponible : 555 000 CHF (30%, dont 200 000 CHF de 2ème pilier).

Je détiens déjà ma résidence principale (mensualité 2 800 CHF, valeur du bien 1,2M CHF, capital restant dû 580k).

Pouvez-vous m'aider à structurer le financement ?

Cordialement,
Pierre Garcia
+41 79 234 56 78`,
  receivedAt: '2026-06-07T14:50:00Z',
  receivedDisplay: '14:50',
  qualification: {
    type: 'acheteur',
    firstName: 'Pierre',
    lastName: 'Garcia',
    email: 'p.garcia@bluemail.ch',
    phone: '+41 79 234 56 78',
    contactInfo: 'p.garcia@bluemail.ch — +41 79 234 56 78',
    propertyType: 'Immeuble locatif (3 appartements)',
    address: 'Lausanne',
    surface: null,
    rooms: null,
    price: 1850000,
    monthly_income: 12500,
    down_payment: 555000,
    existing_debts_monthly: 2800,
    employment_status: 'cdi',
    is_couple: false,
    sell_timeline: null,
    purchase_timeline: 'less_3_months',
    financing_status: 'none',
    description: "Cadre pharma Lausanne, immeuble rendement 1,85M CHF, apport 30% dont 2e pilier.",
    motivationSignals: ['investissement locatif', 'patrimoine'],
    urgencySignals: ['délai court'],
  },
  scoring: {
    score: 78,
    temperature: 'hot',
    explanation: "Cadre supérieur avec revenus élevés et apport solide. Investissement locatif avec rendement correct. Le crédit existant et le ratio LTV à surveiller, mais profil très bancable côté FINMA.",
    keyFactors: [
      { factor: 'Revenus élevés stables', impact: 'positive', points: 25 },
      { factor: 'Apport 30%', impact: 'positive', points: 22 },
      { factor: 'Rendement locatif', impact: 'positive', points: 18 },
      { factor: 'Endettement RP existant', impact: 'negative', points: -7 },
      { factor: 'Délai court', impact: 'positive', points: 20 },
    ],
  },
  prospection: {
    email: {
      subject: 'Votre immeuble de rendement à Lausanne',
      body: `Bonjour Pierre,

Votre dossier coche les bonnes cases : revenus stables, apport conséquent et un rendement correct sur le bien visé. Les points d'attention seront le ratio d'endettement global (entre votre RP et le nouveau bien) et la structure du financement entre fonds propres et 2ème pilier.

Je propose une analyse complète avec deux ou trois banques romandes et la BCV pour benchmarker. Pour commencer, j'aurais besoin de votre certificat de salaire, de votre attestation de 2ème pilier, et du tableau d'amortissement de votre RP.

Disponible mercredi matin pour un appel ?

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Pierre Garcia, cadre pharma Lausanne, immeuble locatif 1,85M CHF avec 555k d'apport — RP déjà financée.",
      need: "Structurer optimalement le financement entre fonds propres et 2ème pilier, et négocier le meilleur taux malgré l'endettement existant.",
      keyQuestion: "Privilégiez-vous une mensualité plus basse ou un amortissement plus rapide compte tenu de votre RP en cours ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Prospect 9 — Margaux Lambert (score 68, prioritaire)
//  Couple jeune Strasbourg, primo accession
// ────────────────────────────────────────────────────────────────────────

const margaux: MockProspect = {
  id: 'p-margaux',
  fromName: 'Margaux Lambert',
  fromEmail: 'margaux.lambert@gmail.com',
  subject: 'Premier appartement Strasbourg',
  body: `Bonjour,

Avec mon compagnon, nous cherchons à acheter notre premier T3 à Strasbourg, autour de 250 000€. Lui est ingénieur en CDI (3 ans), moi infirmière à l'hôpital (CDI fonction publique hospitalière depuis 2 ans).

Salaires combinés nets : 4 800€/mois. Apport : 38 000€ (15%). Aucun crédit en cours.

Nous n'avons pas encore choisi de bien précis mais on visite ce week-end.

Pouvez-vous nous indiquer notre capacité d'emprunt et nous accompagner ?

Merci,
Margaux Lambert
06 78 90 12 34`,
  receivedAt: '2026-06-07T08:30:00Z',
  receivedDisplay: '08:30',
  qualification: {
    type: 'acheteur',
    firstName: 'Margaux',
    lastName: 'Lambert',
    email: 'margaux.lambert@gmail.com',
    phone: '06 78 90 12 34',
    contactInfo: 'margaux.lambert@gmail.com — 06 78 90 12 34',
    propertyType: 'T3 (à identifier)',
    address: 'Strasbourg',
    surface: null,
    rooms: 3,
    price: 250000,
    monthly_income: 4800,
    down_payment: 38000,
    existing_debts_monthly: 0,
    employment_status: 'cdi',
    is_couple: true,
    sell_timeline: null,
    purchase_timeline: '3_to_6_months',
    financing_status: 'none',
    description: "Couple CDI Strasbourg, T3 à 250k, apport 15%, recherche en cours.",
    motivationSignals: ['premier achat'],
    urgencySignals: [],
  },
  scoring: {
    score: 68,
    temperature: 'hot',
    explanation: "Couple CDI dont une fonctionnaire hospitalière — profil très apprécié. Apport correct, projet réaliste. À engager rapidement pour préparer un accord de principe avant la signature.",
    keyFactors: [
      { factor: 'Couple CDI + FPH', impact: 'positive', points: 28 },
      { factor: 'Apport 15%', impact: 'positive', points: 13 },
      { factor: 'Aucun endettement', impact: 'positive', points: 20 },
      { factor: 'Projet 3-6 mois', impact: 'positive', points: 7 },
    ],
  },
  prospection: {
    email: {
      subject: 'Votre projet à Strasbourg — capacité d\'emprunt',
      body: `Bonjour Margaux,

Profil très solide : la fonction publique hospitalière est particulièrement bien notée par les banques, et associé à un CDI ingénieur, c'est un combo gagnant. Avec 4 800€ de revenus combinés, vous pouvez viser une capacité d'emprunt autour de 240-260k sur 25 ans, ce qui colle parfaitement à votre budget.

Avant les visites du week-end, je vous propose de calculer votre capacité réelle et de préparer une attestation pré-vendeur. Cela vous donnera un avantage compétitif sur les offres.

20 minutes au téléphone demain matin ?

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Margaux Lambert, couple CDI + FPH Strasbourg, T3 250k, apport 15%, visites ce week-end.",
      need: "Connaître sa capacité d'emprunt exacte et obtenir une attestation pré-vendeur pour rassurer les vendeurs.",
      keyQuestion: "Avez-vous une préférence pour un quartier en particulier ou êtes-vous flexibles ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Prospect 10 — Antoine Rousseau (score 55, à qualifier)
//  Indépendant établi, refinancement
// ────────────────────────────────────────────────────────────────────────

const antoine: MockProspect = {
  id: 'p-antoine',
  fromName: 'Antoine Rousseau',
  fromEmail: 'antoine.rousseau@orange.fr',
  subject: 'Rachat de crédit immobilier — artisan',
  body: `Bonjour,

Je suis artisan plombier-chauffagiste à Lille, en activité depuis 8 ans (entreprise individuelle, CA stable autour de 95 000€ HT/an, bénéfice net moyen 4 200€/mois après cotisations).

J'ai un prêt immobilier souscrit en 2018 sur ma RP à Roubaix : capital restant dû 165 000€, taux 1,9%, durée restante 19 ans. Mensualité 1 050€.

Je sais que les taux ont monté mais on me parle d'un rachat structuré qui inclurait de la trésorerie pour mon entreprise. Est-ce une bonne idée ?

Cordialement,
Antoine Rousseau
06 23 45 67 89`,
  receivedAt: '2026-06-06T16:20:00Z',
  receivedDisplay: 'Hier 16:20',
  qualification: {
    type: 'acheteur',
    firstName: 'Antoine',
    lastName: 'Rousseau',
    email: 'antoine.rousseau@orange.fr',
    phone: '06 23 45 67 89',
    contactInfo: 'antoine.rousseau@orange.fr — 06 23 45 67 89',
    propertyType: 'Refinancement RP + trésorerie',
    address: 'Roubaix',
    surface: null,
    rooms: null,
    price: 165000,
    monthly_income: 4200,
    down_payment: null,
    existing_debts_monthly: 1050,
    employment_status: 'independant',
    is_couple: false,
    sell_timeline: null,
    purchase_timeline: null,
    financing_status: 'obtained',
    description: "Artisan 8 ans Lille, refi RP + trésorerie pro, prêt actuel à 1,9% — opération à analyser finement.",
    motivationSignals: ['optimisation trésorerie'],
    urgencySignals: [],
  },
  scoring: {
    score: 55,
    temperature: 'warm',
    explanation: "Indépendant établi avec une bonne ancienneté. La problématique : son prêt actuel est à 1,9%, racheter aujourd'hui à 3,5% n'a de sens que si le besoin de trésorerie est réel et urgent. Étude au cas par cas indispensable.",
    keyFactors: [
      { factor: 'Indépendant 8 ans', impact: 'positive', points: 22 },
      { factor: 'Endettement actuel limité', impact: 'positive', points: 12 },
      { factor: 'Prêt actuel à 1,9%', impact: 'negative', points: -5 },
      { factor: 'Opération hybride', impact: 'positive', points: 16 },
      { factor: 'Contact complet', impact: 'positive', points: 10 },
    ],
  },
  prospection: {
    email: {
      subject: 'Étude de votre rachat avec trésorerie',
      body: `Bonjour Antoine,

Sur le papier, votre prêt actuel à 1,9% est meilleur que les conditions du marché. Un rachat pur n'aurait donc pas de sens financier. En revanche, si votre besoin de trésorerie pour l'activité est réel, on peut structurer une opération combinée qui peut être pertinente, à condition d'évaluer précisément l'usage de cette trésorerie.

J'aimerais comprendre votre besoin avant de vous proposer une simulation. Pouvons-nous échanger 20 minutes au téléphone cette semaine ? J'aurai aussi besoin de vos deux derniers bilans pour chiffrer précisément.

Cordialement,
[votre prénom] — Agence [nom de votre agence]`,
    },
    callScript: {
      briefing: "Antoine Rousseau, artisan Lille, rachat RP actuel à 1,9% + trésorerie pro — opération à éclaircir.",
      need: "Comprendre s'il a réellement intérêt à racheter à un taux supérieur pour dégager de la trésorerie.",
      keyQuestion: "Quel est précisément l'usage prévu de la trésorerie, et à quelle échéance ?",
    },
  },
};

// ────────────────────────────────────────────────────────────────────────
//  Export
// ────────────────────────────────────────────────────────────────────────

export const MOCK_PROSPECTS: MockProspect[] = [
  thomas, camille, pierre, sophie, marc, margaux, antoine, lisa, lea, alex,
];

export const NEW_PROSPECT_ID = camille.id; // Celui qui arrive pendant l'auto-play
