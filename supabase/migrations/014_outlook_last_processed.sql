-- ════════════════════════════════════════════════════════════════════════
-- 014 — Suivi de la dernière synchro Outlook
-- À appliquer dans Supabase → SQL Editor.
-- Permet d'afficher « Dernière synchro » pour Outlook (comme Gmail) dans /pro/sources.
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS outlook_last_processed_at TIMESTAMPTZ;
