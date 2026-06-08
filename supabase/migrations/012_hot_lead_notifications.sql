-- ════════════════════════════════════════════════════════════════════════
-- BankKey — Notifications email pour leads chauds (score ≥ 70)
--
-- Quand un prospect est créé (via Gmail ou webhook) avec un score ≥ 70,
-- BankKey envoie immédiatement une notification email au courtier pour
-- l'inciter à ouvrir la fiche et rappeler vite.
--
-- Le courtier peut désactiver ces notifications depuis /pro/settings.
-- ════════════════════════════════════════════════════════════════════════

-- 1. Toggle par courtier (activé par défaut)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_hot_notifications BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Suivi des notifications envoyées par prospect
-- Format : {"hot_lead": "2026-06-08T14:32:00Z", ...}
-- JSONB pour extensibilité (futurs types : reminder, follow_up, etc.)
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS notifications_sent JSONB NOT NULL DEFAULT '{}'::jsonb;
