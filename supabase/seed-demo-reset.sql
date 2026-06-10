-- ════════════════════════════════════════════════════════════════════════
-- SEED-RESET v2 — Compte démo BankKey avec 6 mois d'activité complète
--
-- Crée :
--  • Profil cabinet enrichi (Marie Lefèvre, 7 mois d'activité, 9 banques)
--  • 90 prospects total (10 récents détaillés + 80 historiques)
--  • 25 emails filtrés (spam, perso, promo, notifications)
--  • 50 décisions bancaires (mix accepted/rejected/counter/withdrawn)
--  • Sources variées (Empruntis, Pretto, SeLoger, site web, forwarding…)
--  • bank_submitted JSONB sur ~35 prospects (alimente /pro/banks kanban)
--
-- Trouve automatiquement le user_id par email.
-- Conçu pour être appelé par pg_cron chaque nuit.
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION reset_demo_account()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_user_id UUID;
  i INT;
  rec_date TIMESTAMPTZ;
  prenom TEXT;
  nom TEXT;
  ville TEXT;
  banque TEXT;
  score_val INT;
  temp_val TEXT;
  status_val TEXT;
  revenus INT;
  apport INT;
  prix INT;
  taux NUMERIC;
  commission INT;
  outcome_status TEXT;
  source_id TEXT;
  source_name TEXT;
  banks_jsonb JSONB;

  prenoms TEXT[] := ARRAY['Marie','Julien','Sophie','Antoine','Léa','Pierre','Camille','Maxime',
    'Pauline','Thomas','Sarah','Lucas','Margaux','Hugo','Emma','Nicolas','Charlotte','Quentin',
    'Audrey','Benjamin','Élodie','Romain','Mathilde','Fabien','Chloé','Vincent','Isabelle',
    'Olivier','Caroline','Sébastien','Damien','Sandrine','Nathalie','Laurent','Stéphanie',
    'Christophe','Aurélie','Jérôme','Mélanie','Cédric','Nadia','Frédéric','Anne','Bertrand',
    'Sylvie','Patrick','Karine','Jean-Luc','Catherine','Henri'];

  noms TEXT[] := ARRAY['Dupont','Martin','Bernard','Dubois','Lefèvre','Moreau','Petit','Simon',
    'Robert','Laurent','Michel','Garcia','Roux','David','Bertrand','Morel','Fournier','Girard',
    'Bonnet','Lambert','Lopez','Garnier','Fontaine','Rousseau','Vincent','Mercier','Boyer',
    'Hubert','Marchand','Gauthier','Brun','Henry','Roussel','Lemaire','Sanchez','Renault',
    'Tessier','Charpentier','Royer','Faure','Picard','Carpentier','Léon','Vidal','Caron'];

  villes_fr TEXT[] := ARRAY['Lyon','Bordeaux','Nantes','Toulouse','Lille','Strasbourg','Rennes',
    'Reims','Grenoble','Dijon','Angers','Nîmes','Aix-en-Provence','Tours','Metz','Besançon',
    'Orléans','Rouen','Caen','Nancy','Avignon','Poitiers','Annecy','Le Mans','Clermont-Ferrand',
    'Pau','Mulhouse','Saint-Étienne','Toulon','Brest'];

  villes_ch TEXT[] := ARRAY['Genève','Lausanne','Vevey','Sion','Fribourg','Yverdon','Neuchâtel','Morges'];

  banques_fr TEXT[] := ARRAY['CIC','Crédit Mutuel','BNP Paribas','Crédit Agricole',
    'Société Générale','LCL','La Banque Postale','HSBC France','Banque Populaire',
    'Caisse d''Épargne','Crédit du Nord'];

  banques_ch TEXT[] := ARRAY['BCV','UBS','Raiffeisen','Banque Migros','PostFinance','BCGE'];

  professions TEXT[] := ARRAY['cdi','cdi','cdi','cdi','fonctionnaire','fonctionnaire',
    'independant','cdd','cdi','cdi'];

  -- 7 sources de leads varieés pour montrer la diversité
  source_ids   TEXT[] := ARRAY['gmail','empruntis','pretto','seloger','meilleurtaux','web_form','forwarding','whatsapp'];
  source_names TEXT[] := ARRAY['Gmail direct','Empruntis','Pretto','SeLoger','Meilleurtaux','Site web','Email transféré','WhatsApp'];

BEGIN
  -- Lookup user_id
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@bankkey.ch' LIMIT 1;
  IF demo_user_id IS NULL THEN
    RETURN 'Erreur : aucun utilisateur demo@bankkey.ch trouvé.';
  END IF;

  -- ════════════════════════════════════════════════════════════════
  --  0. Profil cabinet (7 mois d'activité)
  -- ════════════════════════════════════════════════════════════════

  INSERT INTO profiles (id, email, sector)
  VALUES (demo_user_id, 'demo@bankkey.ch', 'credit')
  ON CONFLICT (id) DO NOTHING;

  UPDATE profiles SET
    email = 'demo@bankkey.ch',
    agency_name = 'Cabinet Lefèvre Courtage',
    broker_memory = jsonb_build_object(
      'fullName', 'Marie Lefèvre',
      'jobTitle', 'Courtière en crédit immobilier · IOBSP',
      'agencyName', 'Cabinet Lefèvre Courtage',
      'agencyAddress', '12 rue de la République, 69002 Lyon',
      'iobspNumber', '22000456',
      'websiteUrl', 'https://lefevre-courtage.fr',
      'signaturePhone', '04 78 12 34 56',
      'signatureEmail', 'marie@lefevre-courtage.fr',
      'zones', ARRAY['Lyon','Villeurbanne','Caluire','Bron','Vénissieux','Tassin'],
      'specialties', ARRAY['Primo-accédants','Refinancement','Investissement locatif','Cadres sup','Frontaliers'],
      'bankPartners', ARRAY['CIC','Crédit Mutuel','BNP Paribas','Crédit Agricole','Société Générale','LCL','La Banque Postale','BCV','UBS'],
      'tone', 'formal',
      'vouvoiement', true,
      'minIncome', 1800,
      'maxProjectAmount', 2000000,
      'notes', 'Cabinet fondé en 2019. Spécialisation forte sur frontaliers Genève. Refuser dossiers TNS < 2 ans sauf bilan exceptionnel.'
    ),
    subscription_plan = 'pro',
    subscription_status = 'active',
    trial_ends_at = NULL,
    current_period_end = (NOW() + INTERVAL '20 days')::timestamptz,
    -- Faux Gmail connecté pour que la page Sources affiche les stats détectées
    gmail_connected_email = 'marie@lefevre-courtage.fr',
    gmail_last_processed_at = (NOW() - INTERVAL '15 minutes')::timestamptz,
    forwarding_address = 'dossiers-lefevre@inbound.bankkey.ch'
  WHERE id = demo_user_id;

  DELETE FROM deal_outcomes WHERE user_id = demo_user_id;
  DELETE FROM prospects     WHERE user_id = demo_user_id;

  -- ════════════════════════════════════════════════════════════════
  --  1. 80 prospects historiques sur 6 mois
  -- ════════════════════════════════════════════════════════════════

  FOR i IN 1..80 LOOP
    prenom := prenoms[1 + (i * 7) % array_length(prenoms, 1)];
    nom    := noms[1 + (i * 11) % array_length(noms, 1)];

    IF i % 10 < 7 THEN
      ville := villes_fr[1 + (i * 13) % array_length(villes_fr, 1)];
    ELSE
      ville := villes_ch[1 + (i * 5) % array_length(villes_ch, 1)];
    END IF;

    score_val := 25 + (i * 29) % 70;
    temp_val := CASE WHEN score_val >= 65 THEN 'hot' WHEN score_val >= 45 THEN 'warm' ELSE 'cold' END;

    rec_date := NOW() - (INTERVAL '1 day' * (i * 2.4)::INT);

    status_val := CASE
      WHEN i <= 6 THEN 'new'
      WHEN i <= 14 THEN 'viewed'
      WHEN i <= 65 THEN 'replied'
      ELSE 'archived'
    END;

    revenus := 2200 + (i * 173) % 8500;
    apport  := 8000 + (i * 1900) % 280000;
    prix    := 165000 + (i * 4700) % 850000;

    -- Source variée
    source_id   := source_ids[1 + (i % array_length(source_ids, 1))];
    source_name := source_names[1 + (i % array_length(source_names, 1))];

    -- bank_submitted : seulement sur les prospects "replied" (~30 d'entre eux)
    IF status_val = 'replied' AND i % 2 = 0 THEN
      banks_jsonb := jsonb_build_array(
        jsonb_build_object(
          'name', banques_fr[1 + (i * 3) % array_length(banques_fr, 1)],
          'submitted_at', (rec_date + INTERVAL '2 days')::TEXT,
          'status', CASE i % 5 WHEN 0 THEN 'accepted' WHEN 1 THEN 'accepted' WHEN 2 THEN 'counter' WHEN 3 THEN 'pending' ELSE 'rejected' END,
          'rate', CASE WHEN i % 5 < 2 THEN 2.95 + ((i * 17) % 130) / 100.0 ELSE NULL END,
          'notes', 'Dossier envoyé · suivi en cours'
        ),
        jsonb_build_object(
          'name', banques_fr[1 + (i * 7) % array_length(banques_fr, 1)],
          'submitted_at', (rec_date + INTERVAL '3 days')::TEXT,
          'status', CASE i % 4 WHEN 0 THEN 'accepted' WHEN 1 THEN 'rejected' WHEN 2 THEN 'pending' ELSE 'counter' END,
          'rate', CASE WHEN i % 4 = 0 THEN 3.10 + ((i * 23) % 90) / 100.0 ELSE NULL END,
          'notes', NULL
        )
      );
    ELSE
      banks_jsonb := NULL;
    END IF;

    INSERT INTO prospects
      (user_id, source, sector, email_from_name, email_from, email_subject, email_body,
       qualification, scoring, prospection, status, received_at, created_at,
       detected_source, bank_submitted)
    VALUES
      (demo_user_id, source_id, 'credit',
       prenom || ' ' || nom,
       lower(prenom) || '.' || lower(nom) || '@email.fr',
       'Demande financement ' || ville,
       'Bonjour, je souhaite étudier un financement pour un bien à ' || ville || '. Revenus ' || revenus || '€, apport ' || apport || '€, projet ' || prix || '€.',
       jsonb_build_object(
         'type','acheteur','firstName',prenom,'lastName',nom,
         'email', lower(prenom) || '.' || lower(nom) || '@email.fr',
         'phone', '06 ' || lpad(((i*41) % 100)::text, 2, '0') || ' ' || lpad(((i*53) % 100)::text, 2, '0') || ' ' || lpad(((i*67) % 100)::text, 2, '0') || ' ' || lpad(((i*79) % 100)::text, 2, '0'),
         'propertyType', CASE i % 5 WHEN 0 THEN 'T2' WHEN 1 THEN 'T3' WHEN 2 THEN 'T4' WHEN 3 THEN 'Maison' ELSE 'Studio' END,
         'address', ville,'price',prix,'monthly_income',revenus,'down_payment',apport,
         'existing_debts_monthly', CASE WHEN i % 4 = 0 THEN (i * 17) % 800 ELSE 0 END,
         'employment_status', professions[1 + (i % array_length(professions, 1))],
         'is_couple', (i % 3 = 0),
         'purchase_timeline', CASE i % 3 WHEN 0 THEN 'less_3_months' WHEN 1 THEN '3_to_6_months' ELSE 'more_6_months' END,
         'description', 'Profil ' || prenom || ' ' || nom || ' · ' || ville
       ),
       jsonb_build_object('score',score_val,'temperature',temp_val,'explanation','Profil analysé automatiquement'),
       jsonb_build_object('email', jsonb_build_object('subject','Votre projet ' || ville,'body','Bonjour ' || prenom || '...')),
       status_val, rec_date, rec_date,
       jsonb_build_object('sourceId',source_id,'sourceName',source_name,'confidence','high','method','auto'),
       banks_jsonb);
  END LOOP;

  -- ════════════════════════════════════════════════════════════════
  --  2. Top 10 prospects récents détaillés
  -- ════════════════════════════════════════════════════════════════

  INSERT INTO prospects (user_id, source, sector, email_from_name, email_from, email_subject, email_body,
                         qualification, scoring, prospection, status, received_at, detected_source, bank_submitted)
  VALUES
    (demo_user_id, 'gmail', 'credit', 'Thomas Bernard', 'thomas.bernard@laposte.net',
     'Premier achat — couple cadre Toulouse',
     'Bonjour, avec ma femme nous cherchons à acheter notre première résidence à Toulouse (T4, 425k€). Cadres CDI, revenus combinés 7200€, apport 110k.',
     '{"type":"acheteur","firstName":"Thomas","lastName":"Bernard","email":"thomas.bernard@laposte.net","phone":"06 65 43 21 09","propertyType":"T4 105m²","address":"Toulouse — Carmes","price":425000,"monthly_income":7200,"down_payment":110000,"existing_debts_monthly":0,"employment_status":"cdi","is_couple":true,"purchase_timeline":"less_3_months","description":"Couple cadre Toulouse"}'::jsonb,
     '{"score":92,"temperature":"hot","explanation":"Profil de référence : couple cadres CDI, apport 26%, aucun endettement"}'::jsonb,
     '{"email":{"subject":"Votre T4 aux Carmes","body":"Bonjour Thomas..."}}'::jsonb,
     'new', NOW() - INTERVAL '2 hours',
     '{"sourceId":"gmail","sourceName":"Gmail direct","confidence":"high","method":"auto"}'::jsonb,
     NULL),
    (demo_user_id, 'empruntis', 'credit', 'Camille Martin', 'camille.martin@email.fr',
     'Recherche financement résidence principale — délai 45 jours',
     'Bonjour, nous cherchons un courtier pour financer notre résidence principale à Genève. CDI tous les deux, revenus 5800 CHF, apport 170k CHF.',
     '{"type":"acheteur","firstName":"Camille","lastName":"Martin","email":"camille.martin@email.fr","phone":"07 89 87 65 43","propertyType":"4 pièces 95m²","address":"Genève centre","price":850000,"monthly_income":5800,"down_payment":170000,"existing_debts_monthly":0,"employment_status":"cdi","is_couple":true,"purchase_timeline":"less_3_months","description":"Couple CDI Genève"}'::jsonb,
     '{"score":87,"temperature":"hot","explanation":"Couple CDI, apport 20%, compromis signé"}'::jsonb,
     '{"email":{"subject":"Votre projet de financement à Genève","body":"Bonjour Camille..."}}'::jsonb,
     'viewed', NOW() - INTERVAL '4 hours',
     '{"sourceId":"empruntis","sourceName":"Empruntis","confidence":"high","method":"auto"}'::jsonb,
     '[{"name":"BCV","submitted_at":"2026-06-08","status":"pending","notes":"Dossier complet envoyé jeudi"}]'::jsonb),
    (demo_user_id, 'gmail', 'credit', 'Pierre Garcia', 'p.garcia@bluemail.ch',
     'Financement immeuble de rendement Lausanne',
     'Bonjour, je m''intéresse à un immeuble de rendement à Lausanne (1,85M CHF, rendement brut 4,2%). Cadre supérieur pharma.',
     '{"type":"acheteur","firstName":"Pierre","lastName":"Garcia","email":"p.garcia@bluemail.ch","phone":"+41 79 234 56 78","propertyType":"Immeuble 3 appartements","address":"Lausanne","price":1850000,"monthly_income":12500,"down_payment":555000,"existing_debts_monthly":2800,"employment_status":"cdi","is_couple":false,"purchase_timeline":"less_3_months","description":"Cadre pharma Lausanne"}'::jsonb,
     '{"score":78,"temperature":"hot","explanation":"Revenus élevés, apport 30%, endettement RP à surveiller"}'::jsonb,
     '{"email":{"subject":"Votre immeuble Lausanne","body":"Bonjour Pierre..."}}'::jsonb,
     'replied', NOW() - INTERVAL '6 hours',
     '{"sourceId":"gmail","sourceName":"Gmail direct","confidence":"high","method":"auto"}'::jsonb,
     '[{"name":"BCV","submitted_at":"2026-06-06","status":"counter","rate":2.10,"notes":"Conditions à finaliser sur LTV"},{"name":"UBS","submitted_at":"2026-06-07","status":"pending","notes":"En analyse"}]'::jsonb),
    (demo_user_id, 'pretto', 'credit', 'Sophie Lefèvre', 'sophie.lefevre@gmail.com',
     'Demande de financement — premier achat à Lyon',
     'Bonjour, je souhaite acheter mon premier T3 à Lyon (280k). Ingénieure CDI, 4200€ net, apport 50k (18%).',
     '{"type":"acheteur","firstName":"Sophie","lastName":"Lefèvre","email":"sophie.lefevre@gmail.com","phone":"06 12 34 56 78","propertyType":"T3","address":"Lyon","price":280000,"monthly_income":4200,"down_payment":50000,"existing_debts_monthly":0,"employment_status":"cdi","is_couple":false,"purchase_timeline":"less_3_months","description":"Primo CDI tech Lyon"}'::jsonb,
     '{"score":72,"temperature":"hot","explanation":"CDI tech 4 ans, apport 18%, aucun crédit"}'::jsonb,
     '{"email":{"subject":"Votre premier achat à Lyon","body":"Bonjour Sophie..."}}'::jsonb,
     'viewed', NOW() - INTERVAL '8 hours',
     '{"sourceId":"pretto","sourceName":"Pretto","confidence":"high","method":"auto"}'::jsonb,
     '[{"name":"BNP Paribas","submitted_at":"2026-06-08","status":"pending","notes":"Attente décision sous 5j"},{"name":"Crédit Mutuel","submitted_at":"2026-06-08","status":"pending","notes":"Analyste demande compromis"}]'::jsonb),
    (demo_user_id, 'seloger', 'credit', 'Margaux Lambert', 'margaux.lambert@gmail.com',
     'Premier appartement Strasbourg',
     'Couple ingé + infirmière FPH, primo accession Strasbourg T3 250k, apport 38k (15%).',
     '{"type":"acheteur","firstName":"Margaux","lastName":"Lambert","email":"margaux.lambert@gmail.com","phone":"06 78 90 12 34","propertyType":"T3","address":"Strasbourg","price":250000,"monthly_income":4800,"down_payment":38000,"existing_debts_monthly":0,"employment_status":"cdi","is_couple":true,"purchase_timeline":"3_to_6_months"}'::jsonb,
     '{"score":68,"temperature":"hot","explanation":"Couple CDI dont FPH, apport correct"}'::jsonb,
     '{"email":{"subject":"Votre projet Strasbourg","body":"Bonjour Margaux..."}}'::jsonb,
     'replied', NOW() - INTERVAL '1 day',
     '{"sourceId":"seloger","sourceName":"SeLoger","confidence":"high","method":"auto"}'::jsonb,
     '[{"name":"CIC","submitted_at":"2026-06-04","status":"accepted","rate":3.28,"notes":"Acceptation client OK"},{"name":"Crédit Mutuel","submitted_at":"2026-06-04","status":"counter","rate":3.40,"notes":"Contre-offre 0.12pt"}]'::jsonb),
    (demo_user_id, 'gmail', 'credit', 'Marc Dubois', 'm.dubois@orange.fr',
     'Renégociation de mon prêt immobilier',
     'Fonctionnaire enseignant 12 ans, 3200€ net, prêt 2020 à 2,8% sur 220k.',
     '{"type":"acheteur","firstName":"Marc","lastName":"Dubois","email":"m.dubois@orange.fr","phone":"05 56 78 90 12","propertyType":"Refinancement","address":"Bordeaux","price":220000,"monthly_income":3200,"existing_debts_monthly":1380,"employment_status":"fonctionnaire","is_couple":false}'::jsonb,
     '{"score":65,"temperature":"hot","explanation":"Fonctionnaire titulaire, refinancement classique"}'::jsonb,
     '{"email":{"subject":"Étude renégociation","body":"Bonjour Marc..."}}'::jsonb,
     'replied', NOW() - INTERVAL '2 days',
     '{"sourceId":"gmail","sourceName":"Gmail direct","confidence":"high","method":"auto"}'::jsonb,
     '[{"name":"Crédit Agricole","submitted_at":"2026-06-04","status":"counter","rate":3.15,"notes":"Contre-offre acceptable"}]'::jsonb),
    (demo_user_id, 'web_form', 'credit', 'Antoine Rousseau', 'antoine.rousseau@orange.fr',
     'Rachat de crédit immobilier — artisan',
     'Artisan plombier 8 ans Lille, refinancement RP + trésorerie pro.',
     '{"type":"acheteur","firstName":"Antoine","lastName":"Rousseau","email":"antoine.rousseau@orange.fr","phone":"06 23 45 67 89","propertyType":"Refi + trésorerie","address":"Roubaix","price":165000,"monthly_income":4200,"existing_debts_monthly":1050,"employment_status":"independant","is_couple":false}'::jsonb,
     '{"score":55,"temperature":"warm","explanation":"Indépendant solide"}'::jsonb,
     '{"email":{"subject":"Étude de votre rachat","body":"Bonjour Antoine..."}}'::jsonb,
     'viewed', NOW() - INTERVAL '3 days',
     '{"sourceId":"web_form","sourceName":"Site web","confidence":"high","method":"auto"}'::jsonb,
     '[{"name":"Crédit du Nord","submitted_at":"2026-06-01","status":"accepted","rate":3.45,"notes":"Validé"}]'::jsonb),
    (demo_user_id, 'meilleurtaux', 'credit', 'Lisa Moreau', 'lisa.m1992@yahoo.fr',
     'Question sur l''apport pour un crédit',
     'CDI 2 ans Paris, 2800€ net, 12k d''épargne, projet 250k banlieue.',
     '{"type":"acheteur","firstName":"Lisa","lastName":"Moreau","email":"lisa.m1992@yahoo.fr","propertyType":"Indéterminé","address":"Paris/94/93","price":250000,"monthly_income":2800,"down_payment":12000,"employment_status":"cdi","is_couple":false,"purchase_timeline":"more_6_months"}'::jsonb,
     '{"score":48,"temperature":"warm","explanation":"CDI mais apport très limité (5%)"}'::jsonb,
     '{"email":{"subject":"Votre projet à Paris","body":"Bonjour Lisa..."}}'::jsonb,
     'new', NOW() - INTERVAL '4 days',
     '{"sourceId":"meilleurtaux","sourceName":"Meilleurtaux","confidence":"high","method":"auto"}'::jsonb,
     '[{"name":"Société Générale","submitted_at":"2026-05-22","status":"rejected","notes":"Taux d''effort > 35%"}]'::jsonb),
    (demo_user_id, 'forwarding', 'credit', 'Léa Moreau', 'lea.m@protonmail.com',
     'Possibilités de prêt jeune actif',
     '26 ans CDD Annecy, 2100€ net, 8k d''épargne, projet studio 175k à 1-2 ans.',
     '{"type":"acheteur","firstName":"Léa","lastName":"Moreau","email":"lea.m@protonmail.com","propertyType":"Studio","address":"Annecy","price":175000,"monthly_income":2100,"down_payment":8000,"employment_status":"cdd","is_couple":false}'::jsonb,
     '{"score":45,"temperature":"warm","explanation":"Jeune CDD, apport limité"}'::jsonb,
     '{"email":{"subject":"Votre projet Annecy","body":"Bonjour Léa..."}}'::jsonb,
     'new', NOW() - INTERVAL '5 days',
     '{"sourceId":"forwarding","sourceName":"Email transféré","confidence":"high","method":"auto"}'::jsonb,
     NULL),
    (demo_user_id, 'whatsapp', 'credit', 'Alex Bernard', 'alex.bernard@protonmail.com',
     'Renseignements crédits immobiliers',
     'Freelance graphiste Nantes 1,5 an, CA variable, sans apport.',
     '{"type":"acheteur","firstName":"Alex","lastName":"Bernard","email":"alex.bernard@protonmail.com","address":"Nantes","monthly_income":3000,"down_payment":0,"employment_status":"independant","is_couple":false}'::jsonb,
     '{"score":32,"temperature":"cold","explanation":"Indépendant jeune, sans apport"}'::jsonb,
     '{"email":{"subject":"Vos questions","body":"Bonjour Alex..."}}'::jsonb,
     'archived', NOW() - INTERVAL '7 days',
     '{"sourceId":"whatsapp","sourceName":"WhatsApp","confidence":"medium","method":"manual"}'::jsonb,
     NULL);

  -- ════════════════════════════════════════════════════════════════
  --  3. 25 emails filtrés (spam, perso, promo, notifications)
  -- ════════════════════════════════════════════════════════════════

  INSERT INTO prospects
    (user_id, source, sector, email_from_name, email_from, email_subject, email_body,
     qualification, scoring, prospection, status, relevance, received_at)
  VALUES
    (demo_user_id, 'gmail', 'credit', 'LinkedIn', 'noreply@linkedin.com', 'Vous avez 12 nouvelles invitations', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.97,"reason":"Notification réseau social"}'::jsonb, NOW() - INTERVAL '4 hours'),
    (demo_user_id, 'gmail', 'credit', 'Vercel', 'noreply@vercel.com', 'Build succeeded · lefevre-courtage.fr', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.98,"reason":"Notification technique"}'::jsonb, NOW() - INTERVAL '6 hours'),
    (demo_user_id, 'gmail', 'credit', 'Booking.com', 'noreply@booking.com', 'Bon plan : Lyon dès 89€', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"promotion","confidence":0.95,"reason":"Email commercial"}'::jsonb, NOW() - INTERVAL '8 hours'),
    (demo_user_id, 'gmail', 'credit', 'EDF', 'facture@edf.fr', 'Votre facture du mois est disponible', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.99,"reason":"Facture service"}'::jsonb, NOW() - INTERVAL '12 hours'),
    (demo_user_id, 'gmail', 'credit', 'Maman', 'mamie.lefevre@orange.fr', 'Dimanche midi ?', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"personal","confidence":0.93,"reason":"Email personnel"}'::jsonb, NOW() - INTERVAL '14 hours'),
    (demo_user_id, 'gmail', 'credit', 'Disney+', 'no-reply@mail.disneyplus.com', 'Votre abonnement va être renouvelé', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.97,"reason":"Notification abonnement"}'::jsonb, NOW() - INTERVAL '18 hours'),
    (demo_user_id, 'gmail', 'credit', 'Free Mobile', 'noreply@free-mobile.fr', 'Votre facture mobile - Mai 2026', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.99,"reason":"Facture télécom"}'::jsonb, NOW() - INTERVAL '1 day'),
    (demo_user_id, 'gmail', 'credit', 'OVH', 'noreply@ovh.com', 'Renouvellement nom de domaine', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.98,"reason":"Notification technique"}'::jsonb, NOW() - INTERVAL '1 day 4 hours'),
    (demo_user_id, 'gmail', 'credit', 'Cdiscount Pro', 'pro@cdiscount.com', '-30% sur les imprimantes', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"promotion","confidence":0.96,"reason":"Email commercial"}'::jsonb, NOW() - INTERVAL '2 days'),
    (demo_user_id, 'gmail', 'credit', 'Spotify', 'no-reply@spotify.com', 'Votre récap musical de mai', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.94,"reason":"Notification produit"}'::jsonb, NOW() - INTERVAL '2 days 6 hours'),
    (demo_user_id, 'gmail', 'credit', 'Amazon', 'auto-confirm@amazon.fr', 'Votre commande a été expédiée', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.99,"reason":"Notification e-commerce"}'::jsonb, NOW() - INTERVAL '3 days'),
    (demo_user_id, 'gmail', 'credit', 'Pierre (mari)', 'pierre.lefevre@gmail.com', 'Liste courses', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"personal","confidence":0.91,"reason":"Email personnel"}'::jsonb, NOW() - INTERVAL '3 days 2 hours'),
    (demo_user_id, 'gmail', 'credit', 'Stripe', 'no-reply@stripe.com', 'Payout sent · €1,847.20', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.98,"reason":"Notification paiement"}'::jsonb, NOW() - INTERVAL '4 days'),
    (demo_user_id, 'gmail', 'credit', 'Slack', 'feedback@slack.com', 'Reminder · Réunion lundi 10h', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.97,"reason":"Notification collaboration"}'::jsonb, NOW() - INTERVAL '4 days 8 hours'),
    (demo_user_id, 'gmail', 'credit', 'Le Bon Coin Pro', 'noreply@leboncoin.fr', 'Boostez vos annonces ce mois', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"promotion","confidence":0.95,"reason":"Email commercial"}'::jsonb, NOW() - INTERVAL '5 days'),
    (demo_user_id, 'gmail', 'credit', 'Anne (sœur)', 'anne.lefevre.85@gmail.com', 'Anniversaire de papa', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"personal","confidence":0.92,"reason":"Email personnel"}'::jsonb, NOW() - INTERVAL '5 days 4 hours'),
    (demo_user_id, 'gmail', 'credit', 'PayPal', 'service@paypal.fr', 'Mouvement sur votre compte', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.98,"reason":"Notification paiement"}'::jsonb, NOW() - INTERVAL '6 days'),
    (demo_user_id, 'gmail', 'credit', 'Apple', 'no_reply@email.apple.com', 'Votre reçu pour iCloud+', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.99,"reason":"Notification abonnement"}'::jsonb, NOW() - INTERVAL '7 days'),
    (demo_user_id, 'gmail', 'credit', 'Indeed', 'jobs@indeed.com', '12 nouvelles offres dans votre région', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.95,"reason":"Newsletter emploi"}'::jsonb, NOW() - INTERVAL '8 days'),
    (demo_user_id, 'gmail', 'credit', 'Doctolib', 'noreply@doctolib.fr', 'Rappel : rdv demain 14h30', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"personal","confidence":0.96,"reason":"Rappel personnel"}'::jsonb, NOW() - INTERVAL '9 days'),
    (demo_user_id, 'gmail', 'credit', 'Uber', 'noreply@uber.com', 'Reçu : trajet du 5 juin', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.98,"reason":"Reçu transport"}'::jsonb, NOW() - INTERVAL '10 days'),
    (demo_user_id, 'gmail', 'credit', 'Microsoft', 'account-security-noreply@microsoft.com', 'Activité de connexion inhabituelle', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.99,"reason":"Alerte sécurité"}'::jsonb, NOW() - INTERVAL '12 days'),
    (demo_user_id, 'gmail', 'credit', 'CB Promo', 'pub@deals-shop.net', '!!! GAGNEZ 5000€ MAINTENANT !!!', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"spam","confidence":0.99,"reason":"Spam détecté"}'::jsonb, NOW() - INTERVAL '14 days'),
    (demo_user_id, 'gmail', 'credit', 'Trading Pro', 'noreply@cryptotraders.io', 'Doublez votre capital en 7 jours', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"spam","confidence":0.99,"reason":"Spam financier"}'::jsonb, NOW() - INTERVAL '15 days'),
    (demo_user_id, 'gmail', 'credit', 'GitHub', 'noreply@github.com', 'New release for bankkey/widget', '...',
     '{}'::jsonb, NULL, NULL, 'filtered',
     '{"relevant":false,"category":"notification","confidence":0.98,"reason":"Notification technique"}'::jsonb, NOW() - INTERVAL '18 days');

  -- ════════════════════════════════════════════════════════════════
  --  4. 50 décisions bancaires sur 6 mois
  -- ════════════════════════════════════════════════════════════════

  FOR i IN 1..50 LOOP
    IF i % 5 = 0 THEN
      banque := banques_ch[1 + (i * 3) % array_length(banques_ch, 1)];
    ELSE
      banque := banques_fr[1 + (i * 7) % array_length(banques_fr, 1)];
    END IF;

    outcome_status := CASE
      WHEN (i * 13) % 100 < 55 THEN 'accepted'
      WHEN (i * 13) % 100 < 77 THEN 'rejected'
      WHEN (i * 13) % 100 < 92 THEN 'counter'
      ELSE 'withdrawn'
    END;

    IF i % 5 = 0 THEN
      taux := 1.80 + ((i * 13) % 90) / 100.0;
    ELSE
      taux := 2.95 + ((i * 17) % 130) / 100.0;
    END IF;

    prix := 110000 + (i * 7300) % 1290000;
    commission := (prix * 0.011)::INT;
    rec_date := NOW() - (INTERVAL '1 day' * (i * 3.6)::INT);

    IF outcome_status = 'accepted' THEN
      INSERT INTO deal_outcomes
        (user_id, bank_name, status, rate_pct, loan_amount, duration_years, conditions, decided_at, snapshot)
      VALUES (demo_user_id, banque, 'accepted', taux, prix, 20 + (i % 6),
              'Offre éditée ' || (rec_date + INTERVAL '5 days')::DATE::TEXT || '. Domiciliation revenus exigée.',
              rec_date,
              jsonb_build_object('city', villes_fr[1 + (i * 11) % array_length(villes_fr, 1)],
                                 'commission', commission,
                                 'prospect_initials', chr(65 + (i*3) % 26) || '.' || chr(65 + (i*5) % 26) || '.'));
    ELSIF outcome_status = 'rejected' THEN
      INSERT INTO deal_outcomes
        (user_id, bank_name, status, rejection_reason, conditions, decided_at, snapshot)
      VALUES (demo_user_id, banque, 'rejected',
              CASE i % 4 WHEN 0 THEN 'debt_ratio' WHEN 1 THEN 'income_too_low' WHEN 2 THEN 'profile' ELSE 'other' END,
              CASE i % 4 WHEN 0 THEN 'Taux d''effort > 35%' WHEN 1 THEN 'Revenus insuffisants' WHEN 2 THEN 'Profil hors politique' ELSE 'Autre' END,
              rec_date,
              jsonb_build_object('prospect_initials', chr(65 + (i*7) % 26) || '.' || chr(65 + (i*11) % 26) || '.'));
    ELSIF outcome_status = 'counter' THEN
      INSERT INTO deal_outcomes
        (user_id, bank_name, status, rate_pct, loan_amount, duration_years, conditions, decided_at, snapshot)
      VALUES (demo_user_id, banque, 'counter', taux + 0.15, prix, 22 + (i % 5),
              'Contre-offre · apport supplémentaire demandé',
              rec_date,
              jsonb_build_object('commission_estimate', commission));
    ELSE
      INSERT INTO deal_outcomes
        (user_id, bank_name, status, conditions, decided_at, snapshot)
      VALUES (demo_user_id, banque, 'withdrawn',
              'Dossier retiré par le client (autre proposition acceptée ailleurs)',
              rec_date,
              jsonb_build_object('reason', 'client_withdrew'));
    END IF;
  END LOOP;

  RETURN 'Compte démo réinitialisé : profil + 90 prospects + 25 filtres + 50 décisions à ' || NOW()::TEXT;
END;
$$;

-- Pour tester manuellement :
-- SELECT reset_demo_account();
