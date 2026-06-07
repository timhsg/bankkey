-- ════════════════════════════════════════════════════════════════════════
-- BankKey — Activity log + admin user flag
-- ════════════════════════════════════════════════════════════════════════

-- Log d'activité par prospect (array d'événements JSONB)
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS activity JSONB DEFAULT '[]'::jsonb;
  -- Schema item : { type, at: ISO, label, metadata?: {...} }

-- Flag admin sur profiles — qui peut accéder à /admin
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Sandra est admin (à adapter selon l'email réel utilisé pour son compte)
-- L'UI /admin fait sa propre vérification, ce flag est une sécurité supplémentaire
UPDATE profiles SET is_admin = TRUE
WHERE email IN ('sandra@bankkey.ch', 'sandra2@bankkey.ch');
