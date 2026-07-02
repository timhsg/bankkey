-- ════════════════════════════════════════════════════════════════════════
--  CRM d'acquisition BankKey (utilisé par les agents OpenClaw)
--  À exécuter dans Supabase → SQL Editor :
--  https://supabase.com/dashboard/project/pffnjqylzdxnytbyorhk/sql/new
--
--  Isolation : RLS activé SANS policy → seuls les appels avec la
--  service key (OpenClaw) peuvent lire/écrire. L'app courtiers n'y a
--  jamais accès.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists sales_prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  company      text not null,
  contact_name text,
  role         text,               -- 'fondateur', 'courtier', 'office manager'…
  email        text,
  phone        text,
  website      text,               -- normalisé : minuscule, sans www ni trailing /
  city         text,
  region       text,               -- 'GE', 'VD', 'Lyon', 'Bordeaux'…
  country      text not null check (country in ('CH','FR')),

  source        text not null,     -- 'orias' | 'zefix' | 'annuaire' | 'ads_library' | 'manuel'
  score         int  not null default 0,
  score_reasons jsonb not null default '[]'::jsonb,
  signals       jsonb not null default '{}'::jsonb,
  -- signals : { ads_meta: bool, ads_google: bool, site_year: int,
  --             site_mobile: bool, reviews_count: int, portals: [],
  --             team_size_hint: int, cms: 'wix'|'wordpress'|… }

  stage text not null default 'new' check (stage in
    ('new','researched','queued','contacted','replied','call_booked',
     'trial','won','lost','suppressed')),
  suppressed_reason text,          -- 'opt_out' | 'bounce' | 'refus' | 'anti_icp'
  next_action_at timestamptz,      -- prochaine touche planifiée
  notes text,

  -- Clé de déduplication : domaine si connu, sinon nom normalisé
  unique_key text generated always as (lower(coalesce(website, company))) stored,
  constraint sales_prospects_unique unique (unique_key)
);

create index if not exists idx_sales_prospects_stage on sales_prospects (stage);
create index if not exists idx_sales_prospects_score on sales_prospects (score desc);
create index if not exists idx_sales_prospects_next  on sales_prospects (next_action_at);

create table if not exists sales_touches (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references sales_prospects(id) on delete cascade,
  at timestamptz not null default now(),

  channel   text not null check (channel in ('email','phone','linkedin','whatsapp','autre')),
  direction text not null check (direction in ('out','in')),
  template  text,                  -- 'T1' | 'T2' | 'T3' | null (réponse libre)
  subject   text,
  body      text,
  approved_by text,                -- 'tim' | 'auto'
  meta jsonb not null default '{}'::jsonb
);

create index if not exists idx_sales_touches_prospect on sales_touches (prospect_id, at desc);

alter table sales_prospects enable row level security;
alter table sales_touches   enable row level security;
-- Volontairement AUCUNE policy : accès service key uniquement.

-- Upsert type depuis un agent (curl) :
-- curl -s "$SUPABASE_URL/rest/v1/sales_prospects?on_conflict=unique_key" \
--   -H "apikey: $SUPABASE_SERVICE_KEY" \
--   -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
--   -H "Content-Type: application/json" \
--   -H "Prefer: resolution=merge-duplicates,return=minimal" \
--   -d '[{"company":"Cabinet X","website":"cabinetx.ch","country":"CH","source":"annuaire","score":72}]'
