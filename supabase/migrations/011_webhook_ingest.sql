-- ════════════════════════════════════════════════════════════════════════
-- BankKey — Webhook ingestion universelle
-- Chaque courtier a une clé secrète unique pour recevoir des leads depuis
-- n'importe quelle source (CRM, Zapier, Make, formulaire web, etc.)
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ingest_key VARCHAR(48) UNIQUE;

-- Génère une clé d'ingestion à l'inscription (24 chars hex)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  generated_address TEXT;
  generated_ingest_key TEXT;
BEGIN
  generated_address := 'x' || substr(md5(NEW.id::text || NOW()::text), 1, 8) || '@in.bankkey.ch';
  generated_ingest_key := 'ik_' || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.profiles (
    id, email, sector, subscription_plan, trial_ends_at, subscription_status,
    forwarding_address, ingest_key
  )
  VALUES (
    NEW.id,
    NEW.email,
    'credit',
    'trial',
    NOW() + INTERVAL '30 days',
    'trialing',
    generated_address,
    generated_ingest_key
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Backfill : générer une ingest_key pour les profils existants
UPDATE profiles
SET ingest_key = 'ik_' || replace(gen_random_uuid()::text, '-', '')
WHERE ingest_key IS NULL;

-- Index pour lookup rapide
CREATE INDEX IF NOT EXISTS profiles_ingest_key_idx ON profiles(ingest_key);

-- Statistiques par source d'ingestion (pour le tableau de bord admin)
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS ingest_metadata JSONB;
-- { source: 'zapier' | 'make' | 'wordpress' | 'custom' | 'embed-widget' | 'crm-aprico' | ..., headers: {...} }
