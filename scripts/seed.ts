/**
 * Seeds the connected Supabase project with a sample of real ALP Supply
 * catalog data (2026 Precast Accessories Technical Manual & Catalog) so the
 * app has something to render right away. Idempotent — upserts on slug (or
 * on id for the calculator_settings singleton and join tables), so
 * re-running updates rather than duplicates.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Project
 * Settings → API → service_role key — keep this secret, never expose it to
 * the browser) in addition to NEXT_PUBLIC_SUPABASE_URL. See README.md.
 *
 * Run with: npm run seed
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

// Plain `dotenv` only loads a file literally named `.env` by default — it
// doesn't know about Next.js's `.env.local` convention. Load that explicitly
// so this script sees the same variables `next dev` does.
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "\nMissing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.\n" +
      "Add them to .env.local (see README.md) before running the seed script.\n"
  );
  process.exit(1);
}

// The service role key bypasses Row Level Security, which is what lets this
// script write catalog data without an interactive user session.
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function uploadLogo(filename: string): Promise<string> {
  const storagePath = `logos/${filename}`;
  const { data } = supabase.storage.from("catalog").getPublicUrl(storagePath);

  // Best-effort only: skip re-uploading if it's already in storage, and
  // never let a failed upload kill the rest of the seed run.
  try {
    const { data: existing } = await supabase.storage
      .from("catalog")
      .list("logos", { search: filename });
    if (existing?.some((f) => f.name === filename)) {
      console.log(`  (skipping re-upload of ${filename} — already in storage)`);
      return data.publicUrl;
    }
  } catch (err) {
    console.warn(`  Could not check for existing ${filename}, will try uploading:`, err);
  }

  try {
    const filePath = path.join(process.cwd(), "public", "logos", filename);
    const fileBuffer = readFileSync(filePath);
    const { error } = await supabase.storage
      .from("catalog")
      .upload(storagePath, fileBuffer, { contentType: "image/png", upsert: true });
    if (error) throw error;
  } catch (err) {
    console.warn(
      `  Warning: couldn't upload ${filename} (continuing anyway — this only affects the logo image, not the catalog data):`,
      err
    );
  }

  return data.publicUrl;
}

interface IdBySlug {
  [slug: string]: string;
}

async function upsertAndMapBySlug(
  table: string,
  rows: Record<string, unknown>[]
): Promise<IdBySlug> {
  const { data, error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");
  if (error) throw new Error(`${table}: ${error.message}`);

  const map: IdBySlug = {};
  for (const row of data ?? []) {
    map[row.slug as string] = row.id as string;
  }
  return map;
}

async function main() {
  console.log(`Seeding Supabase project ${supabaseUrl}…`);

  const [lindsayLogoUrl, alpLogoUrl] = await Promise.all([
    uploadLogo("lindsay-precast.png"),
    uploadLogo("alp-supply.png"),
  ]);

  // --- Brands ---
  const brandIds = await upsertAndMapBySlug("brands", [
    { title: "Lindsay Precast", slug: "lindsay-precast", logo_url: lindsayLogoUrl },
    {
      title: "ALP Supply",
      slug: "alp-supply",
      logo_url: alpLogoUrl,
      website: "https://alpsupply.com",
      phone: "800.332.7090",
      email: "sales@alpsupply.com",
    },
  ]);

  // --- Element types ---
  const elementTypeIds = await upsertAndMapBySlug("element_types", [
    {
      title: "Vault / Box Culvert",
      slug: "vault-box-culvert",
      geometry_type: "box",
      description:
        "Box-shaped precast structure lifted from recessed anchors inside the top or walls of the box.",
    },
    {
      title: "Box Base Manhole",
      slug: "box-base-manhole",
      geometry_type: "box",
      description: "Box-base manhole structure, typically lifted the same way as a vault.",
    },
    {
      title: "Pad / Slab",
      slug: "pad-slab",
      geometry_type: "slab",
      description: "Flat precast slab, lid, or pad lifted face-up via 3/4/8-point picks.",
    },
    {
      title: "Wall Panel",
      slug: "wall-panel",
      geometry_type: "wallPanel",
      description: "Vertical precast wall panel, lifted face-up via 2 or 4-point picks.",
    },
  ]);

  // --- Anchor families ---
  const familyIds = await upsertAndMapBySlug("anchor_families", [
    {
      title: "Utility Lift™ System",
      slug: "utility-lift",
      brand_id: brandIds["alp-supply"],
      anchor_type: "recessedWireAnchor",
      min_edge_distance_formula: "See per-part capacity table",
      source_catalog_ref: "ALP Supply 2026 Catalog, p.76-79",
    },
    {
      title: "Lifting Pin™ System",
      slug: "lifting-pin",
      brand_id: brandIds["alp-supply"],
      anchor_type: "pinAnchor",
      min_edge_distance_formula: "See per-part capacity table (varies by tension/shear)",
      source_catalog_ref: "ALP Supply 2026 Catalog, p.13-19",
    },
    {
      title: "Steel Core Lift Loops",
      slug: "steel-core-lift-loop",
      brand_id: brandIds["alp-supply"],
      anchor_type: "liftLoop",
      min_edge_distance_formula: "1.5 × Embedded Depth",
      source_catalog_ref: "ALP Supply 2026 Catalog, p.92",
    },
  ]);

  // --- Calculator settings (singleton) ---
  const { error: settingsError } = await supabase
    .from("calculator_settings")
    .upsert(
      {
        id: true,
        sling_angle_load_factors: [
          { slingAngleDeg: 90, verticalCableAngleDeg: 0, spreadAngleDeg: 0, loadIncreasePercent: 0, loadFactor: 1.0, riskLevel: "typical" },
          { slingAngleDeg: 82.5, verticalCableAngleDeg: 7.5, spreadAngleDeg: 15, loadIncreasePercent: 1, loadFactor: 1.01, riskLevel: "typical" },
          { slingAngleDeg: 75, verticalCableAngleDeg: 15, spreadAngleDeg: 30, loadIncreasePercent: 4, loadFactor: 1.04, riskLevel: "typical" },
          { slingAngleDeg: 67.5, verticalCableAngleDeg: 22.5, spreadAngleDeg: 45, loadIncreasePercent: 8, loadFactor: 1.08, riskLevel: "typical" },
          { slingAngleDeg: 60, verticalCableAngleDeg: 30, spreadAngleDeg: 60, loadIncreasePercent: 16, loadFactor: 1.16, riskLevel: "typical" },
          { slingAngleDeg: 52.5, verticalCableAngleDeg: 37.5, spreadAngleDeg: 75, loadIncreasePercent: 26, loadFactor: 1.26, riskLevel: "maxAllowedCaution" },
          { slingAngleDeg: 45, verticalCableAngleDeg: 45, spreadAngleDeg: 90, loadIncreasePercent: 41, loadFactor: 1.41, riskLevel: "maxAllowedCaution" },
          { slingAngleDeg: 37.5, verticalCableAngleDeg: 52.5, spreadAngleDeg: 105, loadIncreasePercent: 64, loadFactor: 1.64, riskLevel: "doNotUse" },
          { slingAngleDeg: 30, verticalCableAngleDeg: 60, spreadAngleDeg: 120, loadIncreasePercent: 100, loadFactor: 2.0, riskLevel: "doNotUse" },
        ],
        dynamic_load_factors: [
          { condition: "stationaryCrane", cableRiggingFactor: 1.0, chainRiggingFactor: 1.3 },
          { condition: "smoothSurface", cableRiggingFactor: 1.65, chainRiggingFactor: 2.5 },
          { condition: "unevenSurface", cableRiggingFactor: 2.0, chainRiggingFactor: 4.0 },
        ],
        notes: "Lifting with chains is not recommended. Source: ALP Supply 2026 Catalog, p.7.",
      },
      { onConflict: "id" }
    );
  if (settingsError) throw new Error(`calculator_settings: ${settingsError.message}`);

  // --- Utility Lift Anchors (.444"/.671" and 14mm/18mm series), p.78-79 ---
  const utilityLiftAnchors = [
    { part: "LUA44G", wd: ".444\"", w: "5-1/4\"", h: "3-1/8\"", fd: "15/16\"", weight: 0.4, thickness: 4, edge: 9, tension: 3200, shear: 5800 },
    { part: "LUA54G", wd: ".444\"", w: "6\"", h: "3-3/4\"", fd: "15/16\"", weight: 0.49, thickness: 5, edge: 10, tension: 3860, shear: 7710 },
    { part: "LUA64G", wd: ".444\"", w: "7-1/4\"", h: "4-3/4\"", fd: "15/16\"", weight: 0.58, thickness: 6, edge: 12, tension: 4460, shear: 9460 },
    { part: "LUA56G", wd: ".671\"", w: "6-1/4\"", h: "3-3/4\"", fd: "1-5/8\"", weight: 1.09, thickness: 5, edge: 10, tension: 4560, shear: 8430 },
    { part: "LUA66G", wd: ".671\"", w: "7-1/2\"", h: "4-3/4\"", fd: "1-5/8\"", weight: 1.27, thickness: 6, edge: 12, tension: 7320, shear: 15780 },
    { part: "LUA86G", wd: ".671\"", w: "9-3/4\"", h: "6-3/4\"", fd: "1-5/8\"", weight: 1.73, thickness: 8, edge: 16, tension: 10830, shear: 18850 },
    { part: "LUL414G", wd: "14mm", w: "6-1/4\"", h: "3-1/8\"", fd: "1-3/16\"", weight: 0.61, thickness: 4, edge: 9, tension: 3500, shear: 5400 },
    { part: "LUL514G", wd: "14mm", w: "8-1/4\"", h: "3-3/4\"", fd: "1-3/16\"", weight: 0.76, thickness: 5, edge: 10, tension: 5500, shear: 8500 },
    { part: "LUL614G", wd: "14mm", w: "10-9/16\"", h: "4-3/4\"", fd: "1-9/16\"", weight: 1.11, thickness: 6, edge: 12.5, tension: 6500, shear: 10100 },
    { part: "LUL518G", wd: "18mm", w: "8-5/8\"", h: "3-3/4\"", fd: "2\"", weight: 1.44, thickness: 5, edge: 10, tension: 6000, shear: 9300 },
    { part: "LUL618G", wd: "18mm", w: "9-1/16\"", h: "4-3/4\"", fd: "2\"", weight: 1.66, thickness: 6, edge: 12.5, tension: 7500, shear: 11600 },
    { part: "LUL818G", wd: "18mm", w: "12-3/8\"", h: "6-3/4\"", fd: "2\"", weight: 2.25, thickness: 8, edge: 15.5, tension: 13000, shear: 20000 },
  ];

  const utilityLiftRows = utilityLiftAnchors.map((a) => ({
    title: `ALP Utility Lift™ Anchor ${a.part}`,
    part_number: a.part,
    slug: a.part.toLowerCase(),
    brand_id: brandIds["alp-supply"],
    family_id: familyIds["utility-lift"],
    finish: "Hot-dipped galvanized",
    weight_lbs: a.weight,
    typical_element_thickness_in: a.thickness,
    wire_diameter_in: parseFloat(a.wd) || null,
    dimensions: [
      { key: "WD", value: a.wd },
      { key: "W", value: a.w },
      { key: "H", value: a.h },
      { key: "FD", value: a.fd },
    ],
    capacity_table: [
      {
        concreteStrengthPsi: 4000,
        slabMinThicknessIn: a.thickness,
        edgeDistanceTensionIn: a.edge,
        edgeDistanceShearIn: a.edge,
        swlTensionLbs: a.tension,
        swlShearLbs: a.shear,
        notes:
          "Table based on 4,000 psi and 145 pcf concrete. Cannot be adjusted for higher concrete strength.",
      },
    ],
    safety_factor: 4,
    source_catalog_page: "ALP Supply 2026 Catalog, p.78-79",
  }));

  // --- Steel Core Lift Loops, p.92 ---
  const liftLoops = [
    { part: "LLB", color: "Blue", d: "1/8\"", ed: "5-3/8\"", swl2500: 500, swl4000: 500 },
    { part: "LLW", color: "White", d: "1/4\"", ed: "5-1/2\"", swl2500: 2000, swl4000: 2000 },
    { part: "LLR", color: "Red", d: "9/32\"", ed: "5-7/8\"", swl2500: 2300, swl4000: 2400 },
    { part: "LLP", color: "Purple", d: "5/16\"", ed: "6-1/8\"", swl2500: 3000, swl4000: 3200 },
    { part: "LLLG", color: "Light Green", d: "3/8\"", ed: "7-3/8\"", swl2500: 4100, swl4000: 4500 },
    { part: "LLC", color: "Charcoal", d: "25/64\"", ed: "8-1/8\"", swl2500: 5000, swl4000: 5200 },
    { part: "LLDG", color: "Dark Green", d: "15/32\"", ed: "8-7/8\"", swl2500: 5800, swl4000: 7000 },
    { part: "LLY", color: "Yellow", d: "9/16\"", ed: "10\"", swl2500: 10000, swl4000: 10000 },
  ];

  const liftLoopRows = liftLoops.map((l) => ({
    title: `ALP Steel Core Lift Loop — ${l.color}`,
    part_number: l.part,
    slug: l.part.toLowerCase(),
    brand_id: brandIds["alp-supply"],
    family_id: familyIds["steel-core-lift-loop"],
    color_code: l.color,
    dimensions: [
      { key: "D", value: l.d },
      { key: "ED", value: l.ed },
    ],
    capacity_table: [
      {
        concreteStrengthPsi: 2500,
        edgeDistanceTensionIn: parseFloat(l.ed) * 1.5,
        swlTensionLbs: l.swl2500,
        notes:
          "Minimum edge distance = 1.5 × Embedded Depth. Tension capacities based on unreinforced concrete.",
      },
      {
        concreteStrengthPsi: 4000,
        edgeDistanceTensionIn: parseFloat(l.ed) * 1.5,
        swlTensionLbs: l.swl4000,
        notes:
          "Minimum edge distance = 1.5 × Embedded Depth. Tension capacities based on unreinforced concrete.",
      },
    ],
    safety_factor: 4,
    source_catalog_page: "ALP Supply 2026 Catalog, p.92",
  }));

  // --- Lifting Pin Anchors — representative sample across tonnage classes, p.18-19 ---
  const liftingPinAnchors = [
    { part: "LPA1T434G", ton: 1, l: "4-3/4\"", psi1500: 2000, psi2500: 2000, psi3500: 2000, psi5000: 2000, edgeT: 10, edgeS: 12 },
    { part: "LPA2T434G", ton: 2, l: "4-3/4\"", psi1500: 3250, psi2500: 4000, psi3500: 4000, psi5000: 4000, edgeT: 10, edgeS: 15 },
    { part: "LPA4T434G", ton: 4, l: "4-3/4\"", psi1500: 3650, psi2500: 4700, psi3500: 5600, psi5000: 6700, edgeT: 10, edgeS: 15 },
    { part: "LPA8T834G", ton: 8, l: "8-3/4\"", psi1500: 12940, psi2500: 16000, psi3500: 16000, psi5000: 16000, edgeT: 18, edgeS: 27 },
    { part: "LPA16T778G", ton: 16, l: "7-7/8\"", psi1500: 7000, psi2500: 9000, psi3500: 10750, psi5000: 12850, edgeT: 14, edgeS: 21 },
    { part: "LPA20T1934G", ton: 20, l: "19-3/4\"", psi1500: 26000, psi2500: 33800, psi3500: 40000, psi5000: 40000, edgeT: 40, edgeS: 48 },
  ];

  const liftingPinRows = liftingPinAnchors.map((p) => ({
    title: `ALP Lifting Pin™ Anchor ${p.part}`,
    part_number: p.part,
    slug: p.part.toLowerCase(),
    brand_id: brandIds["alp-supply"],
    family_id: familyIds["lifting-pin"],
    finish: "Hot-dipped galvanized",
    tonnage_rating: p.ton,
    dimensions: [{ key: "L", value: p.l }],
    capacity_table: [
      { concreteStrengthPsi: 1500, edgeDistanceTensionIn: p.edgeT, edgeDistanceShearIn: p.edgeS, swlTensionLbs: p.psi1500 },
      { concreteStrengthPsi: 2500, edgeDistanceTensionIn: p.edgeT, edgeDistanceShearIn: p.edgeS, swlTensionLbs: p.psi2500 },
      { concreteStrengthPsi: 3500, edgeDistanceTensionIn: p.edgeT, edgeDistanceShearIn: p.edgeS, swlTensionLbs: p.psi3500 },
      { concreteStrengthPsi: 5000, edgeDistanceTensionIn: p.edgeT, edgeDistanceShearIn: p.edgeS, swlTensionLbs: p.psi5000 },
    ],
    safety_factor: 4,
    source_catalog_page: "ALP Supply 2026 Catalog, p.18-19",
  }));

  const anchorIds = await upsertAndMapBySlug("lifting_anchors", [
    ...utilityLiftRows,
    ...liftLoopRows,
    ...liftingPinRows,
  ]);

  // --- Element type compatibility (join table) ---
  const elementTypeJoins: { lifting_anchor_id: string; element_type_id: string }[] = [];
  for (const a of utilityLiftAnchors) {
    const anchorId = anchorIds[a.part.toLowerCase()];
    for (const slug of ["vault-box-culvert", "box-base-manhole"]) {
      elementTypeJoins.push({ lifting_anchor_id: anchorId, element_type_id: elementTypeIds[slug] });
    }
  }
  for (const l of liftLoops) {
    const anchorId = anchorIds[l.part.toLowerCase()];
    for (const slug of ["pad-slab", "wall-panel"]) {
      elementTypeJoins.push({ lifting_anchor_id: anchorId, element_type_id: elementTypeIds[slug] });
    }
  }
  for (const p of liftingPinAnchors) {
    const anchorId = anchorIds[p.part.toLowerCase()];
    for (const slug of ["pad-slab", "wall-panel", "vault-box-culvert"]) {
      elementTypeJoins.push({ lifting_anchor_id: anchorId, element_type_id: elementTypeIds[slug] });
    }
  }

  const { error: joinError } = await supabase
    .from("lifting_anchor_element_types")
    .upsert(elementTypeJoins, { onConflict: "lifting_anchor_id,element_type_id" });
  if (joinError) throw new Error(`lifting_anchor_element_types: ${joinError.message}`);

  const totalAnchors = utilityLiftRows.length + liftLoopRows.length + liftingPinRows.length;
  console.log(
    `\nDone. Wrote 2 brands, 4 element types, 3 anchor families, 1 calculator settings row, and ${totalAnchors} lifting anchors.`
  );
  console.log("Open /admin to review, or /products and /calculator to see them in the app.\n");
}

main().catch((err) => {
  console.error("\nSeed script failed:\n");
  if (err && typeof err === "object") {
    const { message, details, hint, code, status, name, stack } = err as Record<string, unknown>;
    console.error({ name, message, details, hint, code, status });
    if (stack) console.error(String(stack));
  } else {
    console.error(err);
  }
  process.exitCode = 1;
});
