-- ════════════════════════════════════════════════════════════════════════
-- SETUP-CRON — Reset automatique du compte démo chaque nuit à 3h
--
-- Pré-requis :
--  1. Avoir activé l'extension pg_cron sur Supabase
--     (Dashboard → Database → Extensions → chercher "pg_cron" → toggle ON)
--  2. Avoir créé la fonction reset_demo_account()
--     (en exécutant seed-demo-reset.sql une fois)
--
-- À exécuter UNE SEULE FOIS dans le SQL Editor.
-- ════════════════════════════════════════════════════════════════════════

-- Schedule : tous les jours à 03:00 UTC (= 04:00 Paris l'hiver, 05:00 l'été)
-- Si tu veux 03:00 heure de Paris fixe → mets '0 1 * * *' (1h UTC)
SELECT cron.schedule(
  'reset-demo-account',          -- nom unique du job
  '0 3 * * *',                   -- syntaxe cron : minute heure jour mois jour_semaine
  $$ SELECT reset_demo_account(); $$
);

-- Pour vérifier que le job est bien programmé :
-- SELECT * FROM cron.job;

-- Pour voir les dernières exécutions :
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Pour supprimer le job (si besoin) :
-- SELECT cron.unschedule('reset-demo-account');
