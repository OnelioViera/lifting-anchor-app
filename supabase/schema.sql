-- Lifting Anchor Calculator — Supabase (Postgres) schema
--
-- Run this once in your Supabase project's SQL Editor
-- (manage at https://supabase.com/dashboard/project/_/sql/new).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS /
-- CREATE OR REPLACE, except the table creations themselves — if you need
-- to start over, drop the tables first.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Helper: keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  logo_url text,
  website text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on brands;
create trigger set_updated_at before update on brands
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- anchor_families — a product "system" from the catalog (Utility Lift,
-- Lifting Pin, Steel Core Lift Loops, Coil Inserts)
-- ---------------------------------------------------------------------
create table if not exists anchor_families (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  brand_id uuid references brands(id) on delete set null,
  anchor_type text not null check (
    anchor_type in ('recessedWireAnchor', 'pinAnchor', 'liftLoop', 'coilInsert', 'other')
  ),
  description text,
  safety_notes text,
  diagram_image_url text,
  allowable_load_zone_degrees numeric,
  min_edge_distance_formula text,
  min_spacing_formula text,
  source_catalog_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on anchor_families;
create trigger set_updated_at before update on anchor_families
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- element_types — Vault/Box Culvert, Box Base Manhole, Pad/Slab, Wall Panel
-- ---------------------------------------------------------------------
create table if not exists element_types (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  geometry_type text not null check (
    geometry_type in ('box', 'slab', 'wallPanel', 'riser', 'other')
  ),
  description text,
  diagram_image_url text,
  -- [{ numberOfPoints, anchorsTakingLoad, description, diagramImageUrl }]
  typical_pick_patterns jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on element_types;
create trigger set_updated_at before update on element_types
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- lifting_eyes — the hook/bail that engages a cast-in Lifting Pin Anchor
-- ---------------------------------------------------------------------
create table if not exists lifting_eyes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  part_number text,
  brand_id uuid references brands(id) on delete set null,
  tonnage_range_label text not null,
  min_tonnage numeric,
  max_tonnage numeric,
  image_url text,
  weight_lbs numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on lifting_eyes;
create trigger set_updated_at before update on lifting_eyes
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- recess_systems — Rubber / Plus / Disposable recess formers, by tonnage
-- ---------------------------------------------------------------------
create table if not exists recess_systems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  system_type text not null check (system_type in ('rubber', 'plus', 'disposable')),
  tonnage_rating numeric not null,
  image_url text,
  -- [{ key, value, valueIn }]
  dimensions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on recess_systems;
create trigger set_updated_at before update on recess_systems
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- load_reduction_tables — free-edge / thin-wall SWL reduction factors
-- (Coil Inserts). Not yet wired into the calculator — see README.
-- ---------------------------------------------------------------------
create table if not exists load_reduction_tables (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  condition_type text not null check (condition_type in ('freeEdge', 'thinWall', 'other')),
  family_id uuid references anchor_families(id) on delete set null,
  row_label text,
  columns jsonb not null default '[]'::jsonb, -- string[]
  rows jsonb not null default '[]'::jsonb,    -- [{ rowValue, factors: number[] }]
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on load_reduction_tables;
create trigger set_updated_at before update on load_reduction_tables
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- lifting_anchors — an individual sellable part (e.g. LUA54G, LPA4T434G)
-- ---------------------------------------------------------------------
create table if not exists lifting_anchors (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  part_number text not null,
  slug text not null unique,
  brand_id uuid not null references brands(id) on delete restrict,
  family_id uuid not null references anchor_families(id) on delete restrict,
  size_label text,
  image_url text,
  datasheet_pdf_url text,
  finish text check (
    finish in ('Hot-dipped galvanized', 'Plain', 'Plated', 'Stainless Steel')
  ),
  color_code text,
  weight_lbs numeric,
  qty_per_bag numeric,
  qty_per_crate numeric,
  source_catalog_page text,
  tonnage_rating numeric,
  wire_diameter_in numeric,
  bolt_diameter_in numeric,
  number_of_struts numeric,
  typical_element_thickness_in numeric,
  -- [{ key, value, valueIn }]
  dimensions jsonb not null default '[]'::jsonb,
  -- [{ concreteStrengthPsi, slabMinThicknessIn, edgeDistanceTensionIn,
  --    edgeDistanceShearIn, minCornerDistanceIn, minSpacingIn,
  --    swlTensionLbs, swlShearLbs, ultimateMechanicalTensionLbs, notes }]
  capacity_table jsonb not null default '[]'::jsonb,
  safety_factor numeric not null default 4,
  installation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lifting_anchors_family_id_idx on lifting_anchors(family_id);
create index if not exists lifting_anchors_brand_id_idx on lifting_anchors(brand_id);

drop trigger if exists set_updated_at on lifting_anchors;
create trigger set_updated_at before update on lifting_anchors
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Many-to-many join tables
-- ---------------------------------------------------------------------
create table if not exists lifting_anchor_element_types (
  lifting_anchor_id uuid not null references lifting_anchors(id) on delete cascade,
  element_type_id uuid not null references element_types(id) on delete cascade,
  primary key (lifting_anchor_id, element_type_id)
);

create table if not exists lifting_anchor_lifting_eyes (
  lifting_anchor_id uuid not null references lifting_anchors(id) on delete cascade,
  lifting_eye_id uuid not null references lifting_eyes(id) on delete cascade,
  primary key (lifting_anchor_id, lifting_eye_id)
);

create table if not exists lifting_anchor_recess_systems (
  lifting_anchor_id uuid not null references lifting_anchors(id) on delete cascade,
  recess_system_id uuid not null references recess_systems(id) on delete cascade,
  primary key (lifting_anchor_id, recess_system_id)
);

create table if not exists lifting_anchor_reduction_tables (
  lifting_anchor_id uuid not null references lifting_anchors(id) on delete cascade,
  load_reduction_table_id uuid not null references load_reduction_tables(id) on delete cascade,
  primary key (lifting_anchor_id, load_reduction_table_id)
);

-- ---------------------------------------------------------------------
-- calculator_settings — singleton (sling-angle + dynamic/shock load factors)
-- ---------------------------------------------------------------------
create table if not exists calculator_settings (
  id boolean primary key default true,
  constraint calculator_settings_singleton check (id),
  -- [{ slingAngleDeg, verticalCableAngleDeg, spreadAngleDeg,
  --    loadIncreasePercent, loadFactor, riskLevel }]
  sling_angle_load_factors jsonb not null default '[]'::jsonb,
  -- [{ condition, cableRiggingFactor, chainRiggingFactor }]
  dynamic_load_factors jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on calculator_settings;
create trigger set_updated_at before update on calculator_settings
  for each row execute function set_updated_at();

insert into calculator_settings (id)
values (true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Row Level Security — catalog data is publicly readable (the app's
-- public pages use the anon key), writes require a signed-in team member
-- (the admin UI signs in via Supabase Auth).
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'brands', 'anchor_families', 'element_types', 'lifting_eyes',
      'recess_systems', 'load_reduction_tables', 'lifting_anchors',
      'lifting_anchor_element_types', 'lifting_anchor_lifting_eyes',
      'lifting_anchor_recess_systems', 'lifting_anchor_reduction_tables',
      'calculator_settings'
    ])
  loop
    execute format('alter table %I enable row level security;', t);

    execute format(
      'drop policy if exists "Public read access" on %I;', t
    );
    execute format(
      'create policy "Public read access" on %I for select using (true);', t
    );

    execute format(
      'drop policy if exists "Authenticated write access" on %I;', t
    );
    execute format(
      'create policy "Authenticated write access" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Storage bucket for product images / diagrams / datasheets, uploaded
-- from the admin UI. Public read (so <img>/<Image> tags and PDF links
-- work without signing URLs); writes require an authenticated session.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do nothing;

drop policy if exists "Public read catalog assets" on storage.objects;
create policy "Public read catalog assets" on storage.objects
  for select using (bucket_id = 'catalog');

drop policy if exists "Authenticated write catalog assets" on storage.objects;
create policy "Authenticated write catalog assets" on storage.objects
  for all using (bucket_id = 'catalog' and auth.role() = 'authenticated')
  with check (bucket_id = 'catalog' and auth.role() = 'authenticated');
