-- ════════════════════════════════════════════════════════════════════════
-- BankKey — Pré-filtrage pertinence + sources connectées
-- ════════════════════════════════════════════════════════════════════════

-- ── Pertinence par email ──────────────────────────────────────────────
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS relevance JSONB;
  -- { relevant: bool, category: 'financing_request' | 'spam' | ..., confidence: number, reason: string }

-- ── Sources de leads connectées par le courtier ──────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS connected_sources JSONB DEFAULT '{}'::jsonb;
  -- { gmail: { email, connected_at }, outlook: ..., forwarding: { address, used_count } }

-- ── Adresse de forwarding unique par courtier ────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS forwarding_address VARCHAR(80) UNIQUE;
  -- Format : marie-x9k@in.bankkey.ch

-- Génération automatique du forwarding_address à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  generated_address TEXT;
BEGIN
  -- Génère une adresse forwarding aléatoire : x + 8 chars
  generated_address := 'x' || substr(md5(NEW.id::text || NOW()::text), 1, 8) || '@in.bankkey.ch';

  INSERT INTO public.profiles (
    id, email, sector, subscription_plan, trial_ends_at, subscription_status,
    forwarding_address
  )
  VALUES (
    NEW.id,
    NEW.email,
    'credit',
    'trial',
    NOW() + INTERVAL '30 days',
    'trialing',
    generated_address
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Mettre à jour les profils existants sans adresse forwarding
UPDATE profiles
SET forwarding_address = 'x' || substr(md5(id::text || created_at::text), 1, 8) || '@in.bankkey.ch'
WHERE forwarding_address IS NULL;

-- ── Statut 'filtered' pour les emails écartés par le pré-filtre ──────
-- Pas de contrainte sur status (déjà permissif). Juste un nouveau label.

-- Index pour distinguer rapidement filtered des autres
CREATE INDEX IF NOT EXISTS prospects_status_filtered ON prospects(status) WHERE status = 'filtered';
