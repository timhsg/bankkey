-- ════════════════════════════════════════════════════════════════════════
-- 010 — Colonnes Outlook / Microsoft 365 sur profiles
-- À appliquer dans Supabase → SQL Editor.
-- Scaffold : la connexion Outlook native nécessite aussi une app Azure
-- (MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET en variables d'env Vercel).
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS outlook_connected_email TEXT,
  ADD COLUMN IF NOT EXISTS outlook_access_token    TEXT,
  ADD COLUMN IF NOT EXISTS outlook_refresh_token   TEXT,
  ADD COLUMN IF NOT EXISTS outlook_token_expiry    TIMESTAMPTZ;
