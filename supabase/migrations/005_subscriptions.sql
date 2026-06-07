-- ════════════════════════════════════════════════════════════════════════
-- BankKey — Suivi des abonnements Stripe
-- ════════════════════════════════════════════════════════════════════════

-- Colonnes Stripe sur profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id      VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id  VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status     VARCHAR(40);
  -- States : trialing | active | past_due | canceled | incomplete | unpaid | null (jamais souscrit)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan       VARCHAR(40) DEFAULT 'trial';
  -- Plans : trial | pro
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at           TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end      TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cancel_at_period_end    BOOLEAN DEFAULT FALSE;

-- Index pour lookup webhook
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx     ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS profiles_stripe_subscription_idx ON profiles(stripe_subscription_id);

-- Démarrer automatiquement l'essai à l'inscription : +30 jours
-- (Mise à jour du trigger handle_new_user pour fixer trial_ends_at)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, sector, subscription_plan, trial_ends_at, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    'credit',
    'trial',
    NOW() + INTERVAL '30 days',
    'trialing'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Si vous avez déjà des profils sans trial_ends_at, leur donner 30 jours
UPDATE profiles
SET trial_ends_at = COALESCE(trial_ends_at, created_at + INTERVAL '30 days'),
    subscription_status = COALESCE(subscription_status, 'trialing')
WHERE trial_ends_at IS NULL;
