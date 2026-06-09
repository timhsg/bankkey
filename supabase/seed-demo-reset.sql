-- ════════════════════════════════════════════════════════════════════════
-- SEED-RESET — Version autonome du compte démo BankKey
--
-- Différence avec seed-demo.sql :
--  • Trouve automatiquement le user_id à partir de l'email demo@bankkey.ch
--  • Pas besoin de remplacer l'UUID à la main
--  • Conçu pour être appelé par pg_cron chaque nuit (voir setup-cron.sql)
--
-- À exécuter UNE SEULE FOIS dans le SQL Editor pour créer la fonction.
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION reset_demo_account()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER  -- s'exécute avec les droits du créateur (postgres) → bypass RLS
AS $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Récupère l'ID du compte démo à partir de son email
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'demo@bankkey.ch'
  LIMIT 1;

  IF demo_user_id IS NULL THEN
    RETURN 'Erreur : aucun utilisateur demo@bankkey.ch trouvé. Créez-le d''abord dans Auth.';
  END IF;

  -- 1) Met à jour le profil
  UPDATE profiles SET
    email = 'demo@bankkey.ch',
    agency_name = 'Cabinet Lefèvre Courtage',
    broker_memory = jsonb_build_object(
      'fullName', 'Marie Lefèvre',
      'jobTitle', 'Courtière en crédit immobilier',
      'agencyName', 'Cabinet Lefèvre Courtage',
      'agencyAddress', '12 rue de la République, 69002 Lyon',
      'iobspNumber', '22000456',
      'websiteUrl', 'https://lefevre-courtage.fr',
      'signaturePhone', '04 78 12 34 56',
      'signatureEmail', 'marie@lefevre-courtage.fr',
      'zones', ARRAY['Lyon', 'Villeurbanne', 'Caluire'],
      'specialties', ARRAY['Primo-accédants', 'Refinancement', 'Investissement locatif'],
      'bankPartners', ARRAY['CIC', 'Crédit Mutuel', 'BNP', 'Crédit Agricole', 'Société Générale'],
      'tone', 'formal',
      'vouvoiement', true
    ),
    subscription_plan = 'pro',
    subscription_status = 'active',
    trial_ends_at = NULL,
    current_period_end = (NOW() + INTERVAL '30 days')::timestamptz
  WHERE id = demo_user_id;

  -- 2) Vide les prospects et outcomes existants
  DELETE FROM deal_outcomes WHERE user_id = demo_user_id;
  DELETE FROM prospects     WHERE user_id = demo_user_id;

  -- 3) Réinsère les 10 prospects
  INSERT INTO prospects (user_id, source, sector, email_from_name, email_from, email_subject, email_body,
                         qualification, scoring, prospection, status, received_at)
  VALUES
    (demo_user_id, 'gmail', 'credit', 'Thomas Bernard', 'thomas.bernard@laposte.net',
     'Premier achat — couple cadre Toulouse',
     'Bonjour, avec ma femme nous cherchons à acheter notre première résidence à Toulouse (T4, 425k€). Cadres CDI, revenus combinés 7200€, apport 110k.',
     '{"type":"acheteur","firstName":"Thomas","lastName":"Bernard","email":"thomas.bernard@laposte.net","phone":"06 65 43 21 09","propertyType":"T4 105m²","address":"Toulouse — Carmes","price":425000,"monthly_income":7200,"down_payment":110000,"existing_debts_monthly":0,"employment_status":"cdi","is_couple":true,"purchase_timeline":"less_3_months","description":"Couple cadre Toulouse"}'::jsonb,
     '{"score":92,"temperature":"hot","explanation":"Profil de référence : couple cadres CDI, apport 26%, aucun endettement"}'::jsonb,
     '{"email":{"subject":"Votre T4 aux Carmes","body":"Bonjour Thomas, excellent profil..."}}'::jsonb,
     'new', NOW() - INTERVAL '2 hours'),

    (demo_user_id, 'gmail', 'credit', 'Camille Martin', 'camille.martin@email.fr',
     'Recherche financement résidence principale — délai 45 jours',
     'Bonjour, nous cherchons un courtier pour financer notre résidence principale à Genève. CDI tous les deux, revenus 5800 CHF, apport 170k CHF.',
     '{"type":"acheteur","firstName":"Camille","lastName":"Martin","email":"camille.martin@email.fr","phone":"07 89 87 65 43","propertyType":"4 pièces 95m²","address":"Genève centre","price":850000,"monthly_income":5800,"down_payment":170000,"existing_debts_monthly":0,"employment_status":"cdi","is_couple":true,"purchase_timeline":"less_3_months","description":"Couple CDI Genève"}'::jsonb,
     '{"score":87,"temperature":"hot","explanation":"Couple CDI, apport 20%, compromis signé"}'::jsonb,
     '{"email":{"subject":"Votre projet de financement à Genève","body":"Bonjour Camille, merci pour votre message..."}}'::jsonb,
     'viewed', NOW() - INTERVAL '4 hours'),

    (demo_user_id, 'gmail', 'credit', 'Pierre Garcia', 'p.garcia@bluemail.ch',
     'Financement immeuble de rendement Lausanne',
     'Bonjour, je m''intéresse à un immeuble de rendement à Lausanne (1,85M CHF, rendement brut 4,2%). Cadre supérieur pharma.',
     '{"type":"acheteur","firstName":"Pierre","lastName":"Garcia","email":"p.garcia@bluemail.ch","phone":"+41 79 234 56 78","propertyType":"Immeuble 3 appartements","address":"Lausanne","price":1850000,"monthly_income":12500,"down_payment":555000,"existing_debts_monthly":2800,"employment_status":"cdi","is_couple":false,"purchase_timeline":"less_3_months","description":"Cadre pharma Lausanne"}'::jsonb,
     '{"score":78,"temperature":"hot","explanation":"Revenus élevés, apport 30%, endettement RP à surveiller"}'::jsonb,
     '{"email":{"subject":"Votre immeuble Lausanne","body":"Bonjour Pierre..."}}'::jsonb,
     'replied', NOW() - INTERVAL '6 hours'),

    (demo_user_id, 'gmail', 'credit', 'Sophie Lefèvre', 'sophie.lefevre@gmail.com',
     'Demande de financement — premier achat à Lyon',
     'Bonjour, je souhaite acheter mon premier T3 à Lyon (280k). Ingénieure CDI, 4200€ net, apport 50k (18%).',
     '{"type":"acheteur","firstName":"Sophie","lastName":"Lefèvre","email":"sophie.lefevre@gmail.com","phone":"06 12 34 56 78","propertyType":"T3","address":"Lyon","price":280000,"monthly_income":4200,"down_payment":50000,"existing_debts_monthly":0,"employment_status":"cdi","is_couple":false,"purchase_timeline":"less_3_months","description":"Primo CDI tech Lyon"}'::jsonb,
     '{"score":72,"temperature":"hot","explanation":"CDI tech 4 ans, apport 18%, aucun crédit"}'::jsonb,
     '{"email":{"subject":"Votre premier achat à Lyon","body":"Bonjour Sophie..."}}'::jsonb,
     'viewed', NOW() - INTERVAL '8 hours'),

    (demo_user_id, 'gmail', 'credit', 'Margaux Lambert', 'margaux.lambert@gmail.com',
     'Premier appartement Strasbourg',
     'Bonjour, couple ingé + infirmière FPH, primo accession Strasbourg T3 250k, apport 38k (15%).',
     '{"type":"acheteur","firstName":"Margaux","lastName":"Lambert","email":"margaux.lambert@gmail.com","phone":"06 78 90 12 34","propertyType":"T3","address":"Strasbourg","price":250000,"monthly_income":4800,"down_payment":38000,"existing_debts_monthly":0,"employment_status":"cdi","is_couple":true,"purchase_timeline":"3_to_6_months","description":"Couple CDI+FPH Strasbourg"}'::jsonb,
     '{"score":68,"temperature":"hot","explanation":"Couple CDI dont FPH, apport correct"}'::jsonb,
     '{"email":{"subject":"Votre projet Strasbourg","body":"Bonjour Margaux..."}}'::jsonb,
     'replied', NOW() - INTERVAL '1 day'),

    (demo_user_id, 'gmail', 'credit', 'Marc Dubois', 'm.dubois@orange.fr',
     'Renégociation de mon prêt immobilier',
     'Bonjour, prêt 2020 à 2,8% sur 220k, je veux renégocier. Fonctionnaire enseignant 12 ans, 3200€ net.',
     '{"type":"acheteur","firstName":"Marc","lastName":"Dubois","email":"m.dubois@orange.fr","phone":"05 56 78 90 12","propertyType":"Refinancement","address":"Bordeaux","price":220000,"monthly_income":3200,"down_payment":null,"existing_debts_monthly":1380,"employment_status":"fonctionnaire","is_couple":false,"description":"Fonctionnaire refi"}'::jsonb,
     '{"score":65,"temperature":"hot","explanation":"Fonctionnaire titulaire, refinancement classique"}'::jsonb,
     '{"email":{"subject":"Étude renégociation","body":"Bonjour Marc..."}}'::jsonb,
     'replied', NOW() - INTERVAL '2 days'),

    (demo_user_id, 'gmail', 'credit', 'Antoine Rousseau', 'antoine.rousseau@orange.fr',
     'Rachat de crédit immobilier — artisan',
     'Artisan plombier 8 ans Lille, refinancement RP + trésorerie pro. Prêt actuel 1,9% sur 165k.',
     '{"type":"acheteur","firstName":"Antoine","lastName":"Rousseau","email":"antoine.rousseau@orange.fr","phone":"06 23 45 67 89","propertyType":"Refi + trésorerie","address":"Roubaix","price":165000,"monthly_income":4200,"existing_debts_monthly":1050,"employment_status":"independant","is_couple":false,"description":"Artisan refi"}'::jsonb,
     '{"score":55,"temperature":"warm","explanation":"Indépendant solide mais prêt actuel à très bon taux"}'::jsonb,
     '{"email":{"subject":"Étude de votre rachat","body":"Bonjour Antoine..."}}'::jsonb,
     'viewed', NOW() - INTERVAL '3 days'),

    (demo_user_id, 'gmail', 'credit', 'Lisa Moreau', 'lisa.m1992@yahoo.fr',
     'Question sur l''apport pour un crédit',
     'CDI 2 ans Paris, 2800€ net, 12k d''épargne, projet 250k banlieue.',
     '{"type":"acheteur","firstName":"Lisa","lastName":"Moreau","email":"lisa.m1992@yahoo.fr","propertyType":"Indéterminé","address":"Paris/94/93","price":250000,"monthly_income":2800,"down_payment":12000,"employment_status":"cdi","is_couple":false,"purchase_timeline":"more_6_months","description":"CDI 2 ans Paris apport limité"}'::jsonb,
     '{"score":48,"temperature":"warm","explanation":"CDI mais apport très limité (5%)"}'::jsonb,
     '{"email":{"subject":"Votre projet à Paris","body":"Bonjour Lisa..."}}'::jsonb,
     'new', NOW() - INTERVAL '4 days'),

    (demo_user_id, 'gmail', 'credit', 'Léa Moreau', 'lea.m@protonmail.com',
     'Possibilités de prêt jeune actif',
     '26 ans CDD Annecy, 2100€ net, 8k d''épargne, projet studio 175k à 1-2 ans.',
     '{"type":"acheteur","firstName":"Léa","lastName":"Moreau","email":"lea.m@protonmail.com","propertyType":"Studio","address":"Annecy","price":175000,"monthly_income":2100,"down_payment":8000,"employment_status":"cdd","is_couple":false,"purchase_timeline":"more_6_months","description":"CDD jeune Annecy"}'::jsonb,
     '{"score":45,"temperature":"warm","explanation":"Jeune CDD, apport limité"}'::jsonb,
     '{"email":{"subject":"Votre projet Annecy","body":"Bonjour Léa..."}}'::jsonb,
     'new', NOW() - INTERVAL '5 days'),

    (demo_user_id, 'gmail', 'credit', 'Alex Bernard', 'alex.bernard@protonmail.com',
     'Renseignements sur les crédits immobiliers',
     'Freelance graphiste Nantes 1,5 an, CA variable, sans apport, phase exploratoire.',
     '{"type":"acheteur","firstName":"Alex","lastName":"Bernard","email":"alex.bernard@protonmail.com","propertyType":null,"address":"Nantes","monthly_income":3000,"down_payment":0,"employment_status":"independant","is_couple":false,"purchase_timeline":"more_6_months","description":"Freelance jeune sans apport"}'::jsonb,
     '{"score":32,"temperature":"cold","explanation":"Indépendant jeune, sans apport"}'::jsonb,
     '{"email":{"subject":"Vos questions","body":"Bonjour Alex..."}}'::jsonb,
     'archived', NOW() - INTERVAL '7 days');

  -- 4) Décisions bancaires
  --    Statuts valides : 'accepted' | 'rejected' | 'counter' | 'withdrawn'
  INSERT INTO deal_outcomes
    (user_id, bank_name, status, rate_pct, loan_amount, duration_years,
     conditions, decided_at, snapshot)
  VALUES
    (demo_user_id, 'CIC',              'accepted', 3.28, 212500, 25,
     'Édition d''offre la semaine prochaine. Domiciliation revenus requise.',
     NOW() - INTERVAL '10 days',
     '{"city":"Strasbourg","prospect":"Margaux Lambert","commission":2520}'::jsonb),
    (demo_user_id, 'Crédit du Nord',   'accepted', 3.45, 170000, 19,
     'Validé · acceptation client OK',
     NOW() - INTERVAL '12 days',
     '{"city":"Roubaix","prospect":"Antoine Rousseau","commission":1980}'::jsonb),
    (demo_user_id, 'BNP',              'accepted', 3.18, 230000, 25,
     'Taux préférentiel jeune actif tech',
     NOW() - INTERVAL '15 days',
     '{"city":"Lyon","prospect":"Sophie Lefèvre","commission":2750}'::jsonb),
    (demo_user_id, 'Société Générale', 'rejected', NULL, NULL, NULL,
     'Taux d''effort > 35%',
     NOW() - INTERVAL '18 days',
     '{"city":"Paris","prospect":"Lisa Moreau","rejection_reason":"debt_ratio"}'::jsonb),
    (demo_user_id, 'BCV',              'counter',  2.10, 1295000, 25,
     'Conditions à finaliser sur LTV',
     NOW() - INTERVAL '4 days',
     '{"city":"Lausanne","prospect":"Pierre Garcia","commission_estimate":12950}'::jsonb),
    (demo_user_id, 'Crédit Mutuel',    'counter',  3.35, 230000, 25,
     'Analyste demande compromis signé',
     NOW() - INTERVAL '2 days',
     '{"city":"Lyon","prospect":"Sophie Lefèvre","commission_estimate":2300}'::jsonb);

  RETURN 'Compte démo réinitialisé à ' || NOW()::TEXT;
END;
$$;

-- Test : exécuter manuellement la fonction
-- SELECT reset_demo_account();
