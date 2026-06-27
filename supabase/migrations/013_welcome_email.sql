-- Track quand l'email de bienvenue a été envoyé (idempotence côté UI)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

-- Ajoute aussi un flag super_admin pour distinguer Sandra des autres
-- comptes flagués is_admin (utile si on délègue admin partiel plus tard)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Sandra = super admin
UPDATE profiles SET is_super_admin = TRUE, is_admin = TRUE
WHERE email IN ('sandra@bankkey.ch', 'sandra2@bankkey.ch');
