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
  // Champs structurés pour le scoring — critères clés du barème
  sell_timeline: 'less_3_months' | '3_to_6_months' | 'more_6_months' | null;
  purchase_timeline: 'less_3_months' | '3_to_6_months' | 'more_6_months' | null;
  financing_status: 'obtained' | 'in_progress' | 'none' | null;
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

export interface AnalysisResult {
  qualification: QualificationResult;
  scoring: ScoringResult;
  prospection: ProspectionResult;
}
