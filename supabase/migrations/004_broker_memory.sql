-- ═══════════════════════════════════════════════════════════════════
-- BankKey — Mémoire courtier
-- Stocke le contexte de chaque cabinet pour personnaliser les réponses IA
-- ═══════════════════════════════════════════════════════════════════

-- Ajoute une colonne JSONB pour la mémoire complète du courtier
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS broker_memory JSONB DEFAULT '{}'::jsonb;

-- Index GIN pour requêtes JSONB rapides
CREATE INDEX IF NOT EXISTS profiles_broker_memory_gin ON profiles USING GIN (broker_memory);

-- Commentaire pour documentation
COMMENT ON COLUMN profiles.broker_memory IS
  'Mémoire complète du courtier (cabinet, signature, spécialités, banques, ton). Injectée dans les prompts IA pour personnaliser les réponses.';
