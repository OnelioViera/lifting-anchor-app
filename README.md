# Lifting Anchor Calculator

A Next.js + Tailwind CSS app for selecting the correct precast lifting
anchor (edge distance, safe working load, rigging factors) from the ALP
Supply catalog, for Lindsay Precast vaults, box-base manholes, pads, and
wall panels. Content lives in Supabase (Postgres) and is managed through a
custom team admin at `/admin` — built into this same app, not a third-party
editor.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **Supabase** — Postgres database, Auth (team sign-in for `/admin`), and
  Storage (product images / diagrams / datasheets)

## 1. Install dependencies

```bash
npm install
```

## 2. Connect Supabase

This project doesn't have a Supabase project wired up yet — you'll create
one and plug in its keys.

1. Create a free account and project at [supabase.com](https://supabase.com/).
2. Open your project's **SQL Editor** and run the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql). This creates every table,
   sets up Row Level Security (public read, sign-in required to write), and
   creates the `catalog` Storage bucket used for uploaded images/PDFs.
3. Create a file named `.env.local` in the project root (same folder as
   `package.json`) with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```
   (A copy of this template was also sent separately in chat as
   `.env.local.example`, since files with "env" in the name can't be
   auto-saved into your folder for security reasons — download it from
   there if you'd rather copy it than retype it.)
4. Fill in both values from your project at
   [supabase.com/dashboard](https://supabase.com/dashboard/) → your project
   → **Project Settings → API** → "Project URL" and the "anon" **public**
   key (not the service_role key — that one stays out of the app).

## 3. Create team logins for the admin

The admin at `/admin` is gated by Supabase Auth — there's no separate
username/password system to manage. For each teammate who should be able to
edit the catalog:

1. Supabase dashboard → **Authentication → Users → Add user**.
2. Set their email and a temporary password (auto-confirm the email so they
   can sign in immediately, or set up an email provider so they get a real
   invite — see Supabase's Auth docs for that).
3. They sign in at `/admin/login` with those credentials. Anyone signed in
   can edit anything — there's no separate role system yet (see "What's
   next" below if you need per-person permissions later).

## 4. Run it

```bash
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- Catalog: [http://localhost:3000/products](http://localhost:3000/products)
- Calculator: [http://localhost:3000/calculator](http://localhost:3000/calculator)
- Team admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## 5. (Optional) Seed sample catalog data

To see the app populated immediately with a real sample of ALP Supply
parts (Utility Lift Anchors, Steel Core Lift Loops, and a spread of
Lifting Pin Anchors across tonnage classes), plus the rigging-angle and
dynamic-load factor tables from the safety guidelines:

1. In your Supabase project, go to **Project Settings → API** and reveal
   the **service_role** secret key.
2. Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses
   Row Level Security, which is what lets the script write catalog data
   without an interactive sign-in — keep it out of the browser and out of
   version control.
3. Run:
   ```bash
   npm run seed
   ```

This is idempotent — running it again updates the same rows (matched by
slug/part number) rather than duplicating them.

## Cleaning up leftover Sanity files

This project used to run on Sanity as its CMS and has since moved to
Supabase. If your project folder still has these from before, delete them
— they're no longer used and the packages they depend on have been removed
from `package.json`:

- `sanity.config.ts`
- `src/sanity/` (the whole folder)
- `src/app/studio/` (the whole folder)

## Project structure

```
supabase/schema.sql             Postgres schema, RLS policies, Storage bucket setup
middleware.ts                    Refreshes the Supabase session + gates /admin
src/
  app/
    (site)/                    Public app pages (shared header/footer)
      page.tsx                 Homepage
      products/                Anchor catalog listing + detail pages
      calculator/              The anchor calculator
    admin/
      login/                  Team sign-in
      (protected)/             Everything below requires a signed-in user
        page.tsx               Dashboard
        [resource]/            Generic CRUD for the "simple" resources —
                                 brands, anchor families, element types,
                                 lifting eyes, recess systems, load
                                 reduction tables (config-driven, see
                                 src/lib/admin/simple-resources.ts)
        lifting-anchors/       Rich editor: dimensions, capacity table,
                                 and compatibility, with dynamic row editors
        calculator-settings/    Sling-angle + dynamic load factor tables
  components/
    admin/                     Shared admin form widgets (image upload,
                                 slug auto-fill, delete-with-confirm, etc.)
    CalculatorClient.tsx, SiteHeader.tsx, SiteFooter.tsx
  lib/
    types.ts                   Shared TS types (public + admin/db row shapes)
    data.ts                    Public read queries (catalog + calculator pages)
    calculator.ts               Pure functions: load factors + anchor matching
    supabase/                  Browser/server Supabase clients + middleware helper
    admin/                      Resource config, relation-option helpers, auth actions
scripts/seed.ts                 Sample data importer (see above)
public/logos/                   Lindsay Precast + ALP Supply logos
```

## Content model, at a glance

Every table lives in `supabase/schema.sql`; the shapes below are the same
ones the admin forms and public pages use.

- **`brands`** — Lindsay Precast, ALP Supply.
- **`anchor_families`** — a product "system" from the catalog (Utility
  Lift™, Lifting Pin™, Steel Core Lift Loops, Coil Inserts), with shared
  safety notes and edge-distance/spacing formulas.
- **`lifting_anchors`** — an individual sellable part (e.g. `LUA54G`,
  `LPA4T312G`). Dimensions are stored as a flexible labeled list (JSONB,
  matching the letters used on each catalog drawing — W, H, FD, EH, ED,
  etc.) rather than fixed columns, since every family labels things
  differently. The **capacity table** is a JSONB array of rows so a part
  can publish different SWLs per concrete strength.
- **`element_types`** — Vault / Box Culvert, Box Base Manhole, Pad/Slab,
  Wall Panel — used to filter which anchors are suitable for which
  structure.
- **`lifting_eyes`** / **`recess_systems`** — the hook and recess-former
  components that pair with Lifting Pin Anchors by tonnage rating.
- **`load_reduction_tables`** — generic lookup table for SWL reduction
  factors under free-edge / thin-wall conditions (used by Coil Inserts).
  Not yet populated by the seed script — see "What's next" below.
- **`calculator_settings`** — a singleton (`id = true`) holding the
  sling-angle load factor table and dynamic/shock load factor table from
  the safety guidelines, applied globally by the calculator.
- Join tables (`lifting_anchor_element_types`, `lifting_anchor_lifting_eyes`,
  `lifting_anchor_recess_systems`, `lifting_anchor_reduction_tables`) model
  the many-to-many relationships between a lifting anchor and each of those.

### Adding a new field to the admin

For the "simple" resources (brands, anchor families, element types,
lifting eyes, recess systems, load reduction tables): add the column in
`supabase/schema.sql`, then add one entry to that resource's `fields` array
in `src/lib/admin/simple-resources.ts` — the list/new/edit pages at
`/admin/[resource]` pick it up automatically, no new page needed.

For Lifting Anchors or Calculator Settings, add the column in
`supabase/schema.sql` and wire the new field into
`src/app/admin/(protected)/lifting-anchors/LiftingAnchorForm.tsx` (or
`.../calculator-settings/CalculatorSettingsForm.tsx`) and its `actions.ts` —
these are hand-built because they have dynamic row editors that the
generic form doesn't support.

## How the calculator works today

`src/lib/calculator.ts` is a pure, unit-testable module:

1. `computeRequiredLoadPerAnchor` — divides total element weight by the
   number of anchors assumed to take the load, then multiplies by the
   sling-angle load factor (for the chosen rigging spread angle) and the
   dynamic/shock load factor (for the chosen handling condition + cable vs.
   chain rigging).
2. `findMatchingAnchors` — filters the catalog to anchors whose published
   SWL (at the applicable concrete strength and minimum thickness) meets
   or exceeds that required load, and whose minimum edge distance fits
   within the edge distance you have available.

This is a first pass, not a substitute for engineering review — see the
disclaimer in the footer. Notably missing still (see below): the ACI
318-19 area-reduction method for anchor-to-anchor spacing/overlap, and the
coil-insert free-edge/thin-wall reduction-factor lookups.

## What's next

- Populate `load_reduction_tables` rows with the actual Coil Insert
  free-edge/thin-wall factor tables and wire them into the calculator.
- Add Coil Insert and Lifting Pin Anchor (full tonnage range) sample data.
- Add the ACI 318-19 area-reduction check (`A_Nc`/`A_Nco`) for anchor
  spacing near edges/corners.
- Add a rigging diagram / pick-pattern picker per `element_type` (2/3/4/8-point
  picks) to auto-fill "number of anchors taking the load".
- Per-person admin roles/permissions (today, anyone with a Supabase Auth
  login can edit anything) — Supabase Auth supports custom claims/roles if
  you need read-only vs. editor accounts later.
- Deploy: this app deploys cleanly to Vercel — set the same environment
  variables there (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  and add your production URL to Supabase's Auth → URL Configuration
  (Site URL / Redirect URLs) so sign-in works there too.
