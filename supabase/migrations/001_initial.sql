-- ═══════════════════════════════════════════════════════════════════
-- Qualio — Schéma initial
-- Exécuter dans Supabase : Dashboard → SQL Editor → Coller + Run
-- ═══════════════════════════════════════════════════════════════════

-- ── Profils utilisateurs (liés à auth.users de Supabase) ────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    VARCHAR(255) NOT NULL,
  agency_name              VARCHAR(255),
  sector                   VARCHAR(50) DEFAULT 'immobilier',

  -- Gmail OAuth (tokens chiffrés via Supabase Vault en production)
  gmail_connected_email    VARCHAR(255),
  gmail_access_token       TEXT,
  gmail_refresh_token      TEXT,
  gmail_token_expiry       TIMESTAMPTZ,
  gmail_last_processed_at  TIMESTAMPTZ,   -- Timestamp du dernier traitement (polling)

  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ── Prospects (leads analysés automatiquement ou manuellement) ──────────────

CREATE TABLE IF NOT EXISTS prospects (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Source
  source             VARCHAR(50) DEFAULT 'gmail',  -- gmail | webhook | manual
  gmail_message_id   VARCHAR(255),                 -- ID Gmail (pour déduplication)
  gmail_thread_id    VARCHAR(255),
  email_from_name    VARCHAR(255),
  email_from         VARCHAR(255),
  email_subject      TEXT,
  email_body         TEXT,

  -- Résultats des 3 agents (stockés en JSON pour flexibilité)
  sector             VARCHAR(50) DEFAULT 'immobilier',
  qualification      JSONB,
  scoring            JSONB,
  prospection        JSONB,

  -- Statut du lead dans le workflow
  status             VARCHAR(50) DEFAULT 'new',
  -- new       → non traité
  -- viewed    → vu par l'agent
  -- replied   → réponse envoyée
  -- archived  → archivé

  received_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS prospects_user_id_idx        ON prospects(user_id);
CREATE INDEX IF NOT EXISTS prospects_status_idx         ON prospects(status);
CREATE INDEX IF NOT EXISTS prospects_gmail_message_idx  ON prospects(gmail_message_id);
CREATE INDEX IF NOT EXISTS prospects_created_at_idx     ON prospects(created_at DESC);

-- ── Row Level Security (chaque utilisateur ne voit que ses données) ──────────

ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

-- Profiles : lecture/écriture uniquement sur son propre profil
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prospects : lecture/écriture uniquement sur ses propres prospects
CREATE POLICY "prospects_own" ON prospects
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Trigger : créer le profil automatiquement à l'inscription ────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
