-- ════════════════════════════════════════════════════════════════════════
-- BankKey — Détection automatique de la source d'un prospect
-- Plus besoin de forwarding manuel : on lit Gmail et on détecte la source
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE prospects ADD COLUMN IF NOT EXISTS detected_source JSONB;
  -- { sourceId, sourceName, confidence, method }

CREATE INDEX IF NOT EXISTS prospects_detected_source_idx
  ON prospects((detected_source->>'sourceId'));
