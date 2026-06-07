-- ═══════════════════════════════════════════════════════════════════
-- BankKey — Demandes de démo
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS demo_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      VARCHAR(120) NOT NULL,
  last_name       VARCHAR(120),
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(60),
  agency_name     VARCHAR(255) NOT NULL,
  city            VARCHAR(120),
  preferred_slot  VARCHAR(120) NOT NULL,
  message         TEXT,
  status          VARCHAR(40) DEFAULT 'pending',  -- pending | contacted | done | cancelled
  notes           TEXT,                            -- pour vos notes internes
  contacted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_bookings_status_idx     ON demo_bookings(status);
CREATE INDEX IF NOT EXISTS demo_bookings_created_at_idx ON demo_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS demo_bookings_email_idx      ON demo_bookings(email);

-- RLS : seul le service_role peut accéder (insertions depuis l'API route)
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;

-- Aucune policy publique — accès uniquement via service_role key côté serveur
