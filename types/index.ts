export interface QualificationResult {
  type: 'vendeur' | 'acheteur' | 'locataire' | 'inconnu';
  firstName: string | null;
  lastName: string | null;
  // Contact structuré (séparé pour usage en aval)
  email: string | null;
  phone: string | null;
  contactInfo: string | null;  // Gardé pour l'affichage UI existant
  propertyType: string | null;
  address: string | null;
  surface: number | null;
  rooms: number | null;        // Toujours entier — "3.5 pièces" → 4
  price: number | null;        // Toujours entier, tous formats normalisés
  // ─── Champs spécifiques crédit immobilier ───────────────────────────
  monthly_income: number | null;       // Revenu net mensuel combiné (foyer)
  down_payment: number | null;         // Apport personnel disponible
  existing_debts_monthly: number | null; // Mensualités de crédits en cours
  employment_status: 'cdi' | 'fonctionnaire' | 'cdd' | 'independant' | 'retraite' | 'sans_emploi' | null;
  is_couple: boolean | null;
  // ─── Timing ─────────────────────────────────────────────────────────
  sell_timeline: 'less_3_months' | '3_to_6_months' | 'more_6_months' | null;
  purchase_timeline: 'less_3_months' | '3_to_6_months' | 'more_6_months' | null;
  financing_status: 'obtained' | 'in_progress' | 'none' | null;
  // ─── Texte libre ────────────────────────────────────────────────────
  description: string;
  motivationSignals: string[];
  urgencySignals: string[];
}

export interface ScoreFactor {
  factor: string;
  impact: 'positive' | 'negative';
  points: number;
}

export interface ScoringResult {
  score: number;
  temperature: 'cold' | 'warm' | 'hot';
  explanation: string;
  keyFactors: ScoreFactor[];
}

export interface ProspectionResult {
  email: {
    subject: string;
    body: string;
  };
  // Briefing 30 secondes — les agents savent téléphoner, ils ont juste besoin du contexte
  callScript: {
    briefing: string;       // Qui, quoi, niveau d'urgence — 1 phrase max
    need: string;           // Ce que le prospect veut concrètement
    keyQuestion: string;    // La question à poser en priorité absolue
  };
}

// ── Documents à demander au prospect ─────────────────────────────────────
// Généré par règles déterministes (pas de LLM) en fonction du profil

export interface DocumentItem {
  name: string;
  required: boolean;
  hint?: string;
}

export interface DocumentGroup {
  category: string;
  items: DocumentItem[];
}

export interface DocumentChecklistResult {
  jurisdiction: 'FR' | 'CH' | 'unknown';
  urgency: 'urgent' | 'normal';
  groups: DocumentGroup[];
  estimatedCompleteness: number; // 0-100, basé sur les infos déjà connues
}

export interface AnalysisResult {
  qualification: QualificationResult;
  scoring: ScoringResult;
  prospection: ProspectionResult;
  documents: DocumentChecklistResult;
}

// ────────────────────────────────────────────────────────────────────────
//  Mémoire du courtier (broker memory)
//  Stockée dans profiles.broker_memory (JSONB) — injectée dans les prompts
//  pour personnaliser les réponses générées par l'IA.
// ────────────────────────────────────────────────────────────────────────

export interface BrokerMemory {
  // Identité
  fullName?: string;            // "Marie Lefèvre"
  jobTitle?: string;            // "Courtière en crédit immobilier"
  agencyName?: string;          // "Cabinet Lefèvre Courtage"
  agencyAddress?: string;       // "12 rue de la République, 69002 Lyon"
  iobspNumber?: string;         // Numéro registre IOBSP (FR)
  websiteUrl?: string;          // "https://lefevre-courtage.fr"

  // Contact
  signatureEmail?: string;      // Bloc signature complet à coller en fin d'email
  signaturePhone?: string;      // Téléphone affiché dans les emails

  // Spécialités
  zones?: string[];             // ["Lyon centre", "Villeurbanne", "Lyon 6e"]
  specialties?: string[];       // ["Primo-accédants", "Investisseurs locatifs", "Refinancement"]
  bankPartners?: string[];      // ["BNP Paribas", "Crédit Agricole", "Caisse d'Épargne"]

  // Style de communication
  tone?: 'formal' | 'friendly' | 'concise'; // Ton préféré (défaut: formal)
  preferredLanguages?: ('fr' | 'en' | 'de' | 'it')[]; // Langues acceptées
  vouvoiement?: boolean;        // true par défaut

  // Règles métier
  minIncome?: number;           // Revenus minimum pour accepter un dossier (mensuel)
  maxProjectAmount?: number;    // Montant max de dossier accepté
  commissionPct?: number;       // Pourcentage de commission moyen (info interne)

  // Notes libres
  notes?: string;               // Champ libre pour notes / instructions spéciales

  // Pondération scoring personnalisée (0-100, défaut = défini par BankKey)
  scoring_weights?: {
    employment_situation?: number;  // Importance situation pro (défaut 25)
    down_payment?: number;          // Importance apport (défaut 25)
    debt_ratio?: number;            // Importance endettement (défaut 20)
    project_maturity?: number;      // Importance maturité (compromis, financing_status) (défaut 20)
    contact_completeness?: number;  // Importance qualité contact (défaut 10)
  };

  // Méta
  updatedAt?: string;           // ISO date dernière màj
}
