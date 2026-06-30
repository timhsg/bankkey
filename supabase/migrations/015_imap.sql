-- ════════════════════════════════════════════════════════════════════════
-- 015 — Source IMAP (Yahoo, iCloud, OVH, ProtonMail Bridge, boîte custom…)
-- À appliquer dans Supabase → SQL Editor.
--
-- Permet de connecter n'importe quelle boîte mail standard via IMAP, pour les
-- courtiers qui ne sont ni Google ni Microsoft.
--
-- ⚠️ SÉCURITÉ : imap_password est ici stocké en clair (comme les tokens Gmail
--    aujourd'hui), protégé par RLS. À chiffrer (pgsodium / Supabase Vault) dans
--    une itération ultérieure — c'est un mot de passe de boîte mail.
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS imap_host              TEXT,
  ADD COLUMN IF NOT EXISTS imap_port              INTEGER DEFAULT 993,
  ADD COLUMN IF NOT EXISTS imap_secure            BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS imap_user              TEXT,
  ADD COLUMN IF NOT EXISTS imap_password          TEXT,
  ADD COLUMN IF NOT EXISTS imap_connected_email   TEXT,
  ADD COLUMN IF NOT EXISTS imap_last_processed_at TIMESTAMPTZ;
