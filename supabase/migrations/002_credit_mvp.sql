-- ═══════════════════════════════════════════════════════════════════
-- BankKey — MVP crédit immobilier (migration 002)
-- Exécuter dans Supabase : Dashboard → SQL Editor → Coller + Run
--
-- Cette migration :
--   1. Met à jour les valeurs par défaut 'immobilier' → 'credit'
--   2. Ajoute une colonne 'documents' pour cacher la checklist
--   3. Ajoute des colonnes utiles pour le métier courtier
-- ═══════════════════════════════════════════════════════════════════

-- ── Mise à jour des valeurs par défaut ──────────────────────────────
ALTER TABLE profiles  ALTER COLUMN sector SET DEFAULT 'credit';
ALTER TABLE prospects ALTER COLUMN sector SET DEFAULT 'credit';

-- ── Mise à jour des lignes existantes ───────────────────────────────
UPDATE profiles  SET sector = 'credit' WHERE sector = 'immobilier';
UPDATE prospects SET sector = 'credit' WHERE sector = 'immobilier';

-- ── Nouvelles colonnes prospects ────────────────────────────────────

-- Documents checklist (cachée pour éviter recompute côté UI)
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS documents JSONB;

-- Champs pratiques pour le métier
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS broker_notes TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS appointment_at TIMESTAMPTZ;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS bank_submitted JSONB DEFAULT '[]'::jsonb;
  -- Array de banques où le dossier a été envoyé :
  -- [{ "name": "BNP", "submitted_at": "2025-11-30", "status": "pending" | "accepted" | "rejected", "rate": 3.85, "notes": "..." }]

-- ── Index utiles ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS prospects_appointment_idx ON prospects(appointment_at) WHERE appointment_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS prospects_status_user_idx ON prospects(user_id, status);

-- ── Contrainte de validité sur sector ───────────────────────────────
-- Pour empêcher de réinsérer 'immobilier' ou 'esthetique'
ALTER TABLE profiles  DROP CONSTRAINT IF EXISTS profiles_sector_check;
ALTER TABLE profiles  ADD  CONSTRAINT profiles_sector_check  CHECK (sector IN ('credit'));

ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_sector_check;
ALTER TABLE prospects ADD  CONSTRAINT prospects_sector_check CHECK (sector IN ('credit'));

-- ── Confirmation visuelle ───────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE 'Migration 002 appliquée — BankKey MVP crédit prêt.';
END $$;
