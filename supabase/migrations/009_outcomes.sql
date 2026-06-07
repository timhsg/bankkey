-- ════════════════════════════════════════════════════════════════════════
-- BankKey — Outcomes des dossiers crédit
-- LA donnée qui crée le moat : qui accepte quoi, à quel taux, dans quelle région
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS deal_outcomes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id           UUID REFERENCES prospects(id) ON DELETE CASCADE,
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Banque et terms
  bank_name             VARCHAR(120) NOT NULL,
  status                VARCHAR(20) NOT NULL,
    -- 'accepted' | 'rejected' | 'counter' | 'withdrawn'

  -- Termes financiers (si accepté ou contre-offre)
  rate_pct              NUMERIC(5, 3),       -- 3.250
  loan_amount           NUMERIC(12, 2),      -- 320000.00
  duration_years        INTEGER,             -- 25
  required_down_payment NUMERIC(12, 2),      -- Apport finalement exigé
  insurance_rate_pct    NUMERIC(5, 3),

  -- Conditions / restrictions
  conditions            TEXT,                -- "Exige domiciliation revenus"
  rejection_reason      VARCHAR(60),         -- 'income_too_low' | 'debt_ratio' | 'profile' | 'other'

  -- Snapshot du profil au moment de la décision (pour agrégations)
  -- Permet d'analyser quelle banque accepte quel profil
  snapshot              JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- { city, jurisdiction, monthly_income, down_payment_pct, employment, debt_ratio, project_amount }

  decided_at            TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deal_outcomes_user_idx     ON deal_outcomes(user_id);
CREATE INDEX IF NOT EXISTS deal_outcomes_bank_idx     ON deal_outcomes(bank_name);
CREATE INDEX IF NOT EXISTS deal_outcomes_status_idx   ON deal_outcomes(status);
CREATE INDEX IF NOT EXISTS deal_outcomes_decided_idx  ON deal_outcomes(decided_at DESC);
CREATE INDEX IF NOT EXISTS deal_outcomes_prospect_idx ON deal_outcomes(prospect_id);

-- RLS : chaque courtier voit ses propres outcomes
ALTER TABLE deal_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY deal_outcomes_owner ON deal_outcomes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permission service_role pour agrégations admin (data analytics)
COMMENT ON TABLE deal_outcomes IS
  'Outcomes finaux des dossiers crédit. Base de données du data moat BankKey.';
