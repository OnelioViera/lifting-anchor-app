import { createClient } from "@/lib/supabase/server";
import type {
  AnchorDetail,
  AnchorListItem,
  CalculatorSettings,
  CapacityRow,
  DimensionField,
  ElementTypeOption,
} from "@/lib/types";

// ---------------------------------------------------------------------
// Public, read-only data access for the catalog + calculator pages.
// Every function here degrades to an empty/undefined result rather than
// throwing, since the app should still render (with an empty state)
// before Supabase is connected or before any content has been added.
// ---------------------------------------------------------------------

const ANCHOR_LIST_SELECT = `
  id, title, part_number, slug, size_label, image_url, finish, color_code,
  weight_lbs, tonnage_rating, wire_diameter_in, bolt_diameter_in,
  typical_element_thickness_in, dimensions, capacity_table, safety_factor,
  brand:brands ( title, slug, logo_url ),
  family:anchor_families ( title, slug, anchor_type ),
  lifting_anchor_element_types ( element_types ( title, slug ) )
`;

interface RawBrandRef {
  title: string;
  slug: string;
  logo_url: string | null;
  website?: string | null;
}

interface RawFamilyRef {
  title: string;
  slug: string;
  anchor_type: string;
  description?: string | null;
  safety_notes?: string | null;
  diagram_image_url?: string | null;
  min_edge_distance_formula?: string | null;
  min_spacing_formula?: string | null;
}

interface RawElementTypeRef {
  title: string;
  slug: string;
}

interface RawAnchorListRow {
  id: string;
  title: string;
  part_number: string;
  slug: string;
  size_label: string | null;
  image_url: string | null;
  finish: string | null;
  color_code: string | null;
  weight_lbs: number | null;
  tonnage_rating: number | null;
  wire_diameter_in: number | null;
  bolt_diameter_in: number | null;
  typical_element_thickness_in: number | null;
  dimensions: DimensionField[] | null;
  capacity_table: CapacityRow[] | null;
  safety_factor: number | null;
  brand: RawBrandRef | null;
  family: RawFamilyRef | null;
  lifting_anchor_element_types: { element_types: RawElementTypeRef | null }[] | null;
}

function mapAnchorListRow(row: RawAnchorListRow): AnchorListItem {
  return {
    id: row.id,
    title: row.title,
    partNumber: row.part_number,
    slug: row.slug,
    sizeLabel: row.size_label ?? undefined,
    imageUrl: row.image_url ?? undefined,
    finish: row.finish ?? undefined,
    colorCode: row.color_code ?? undefined,
    weightLbs: row.weight_lbs ?? undefined,
    tonnageRating: row.tonnage_rating ?? undefined,
    wireDiameterIn: row.wire_diameter_in ?? undefined,
    boltDiameterIn: row.bolt_diameter_in ?? undefined,
    typicalElementThicknessIn: row.typical_element_thickness_in ?? undefined,
    dimensions: row.dimensions ?? [],
    capacityTable: row.capacity_table ?? [],
    safetyFactor: row.safety_factor ?? undefined,
    brand: row.brand
      ? {
          title: row.brand.title,
          slug: row.brand.slug,
          logoUrl: row.brand.logo_url ?? undefined,
        }
      : undefined,
    family: row.family
      ? {
          title: row.family.title,
          slug: row.family.slug,
          anchorType: row.family.anchor_type,
        }
      : undefined,
    elementTypes: (row.lifting_anchor_element_types ?? [])
      .map((j) => j.element_types)
      .filter((et): et is RawElementTypeRef => et !== null)
      .map((et) => ({ title: et.title, slug: et.slug })),
  };
}

export async function getAllAnchors(): Promise<AnchorListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifting_anchors")
    .select(ANCHOR_LIST_SELECT)
    .order("part_number", { ascending: true });

  if (error) {
    console.error("getAllAnchors:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as RawAnchorListRow[]).map(mapAnchorListRow);
}

const ANCHOR_DETAIL_SELECT = `
  id, title, part_number, slug, size_label, image_url, datasheet_pdf_url,
  finish, color_code, weight_lbs, qty_per_bag, qty_per_crate,
  source_catalog_page, tonnage_rating, wire_diameter_in, bolt_diameter_in,
  typical_element_thickness_in, dimensions, capacity_table, safety_factor,
  installation_notes,
  brand:brands ( title, slug, logo_url, website ),
  family:anchor_families (
    title, slug, anchor_type, description, safety_notes, diagram_image_url,
    min_edge_distance_formula, min_spacing_formula
  ),
  lifting_anchor_element_types ( element_types ( title, slug ) ),
  lifting_anchor_lifting_eyes (
    lifting_eyes ( title, part_number, tonnage_range_label, image_url )
  ),
  lifting_anchor_recess_systems (
    recess_systems ( title, system_type, tonnage_rating, image_url )
  )
`;

interface RawLiftingEyeRef {
  title: string;
  part_number: string | null;
  tonnage_range_label: string;
  image_url: string | null;
}

interface RawRecessSystemRef {
  title: string;
  system_type: string;
  tonnage_rating: number;
  image_url: string | null;
}

interface RawAnchorDetailRow extends Omit<RawAnchorListRow, "family"> {
  datasheet_pdf_url: string | null;
  qty_per_bag: number | null;
  qty_per_crate: number | null;
  source_catalog_page: string | null;
  installation_notes: string | null;
  family: RawFamilyRef | null;
  lifting_anchor_lifting_eyes: { lifting_eyes: RawLiftingEyeRef | null }[] | null;
  lifting_anchor_recess_systems: { recess_systems: RawRecessSystemRef | null }[] | null;
}

export async function getAnchorBySlug(slug: string): Promise<AnchorDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifting_anchors")
    .select(ANCHOR_DETAIL_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getAnchorBySlug:", error.message);
    return null;
  }

  const row = data as unknown as RawAnchorDetailRow;
  const base = mapAnchorListRow(row);

  return {
    ...base,
    datasheetPdfUrl: row.datasheet_pdf_url ?? undefined,
    qtyPerBag: row.qty_per_bag ?? undefined,
    qtyPerCrate: row.qty_per_crate ?? undefined,
    sourceCatalogPage: row.source_catalog_page ?? undefined,
    installationNotes: row.installation_notes ?? undefined,
    family: row.family
      ? {
          title: row.family.title,
          slug: row.family.slug,
          anchorType: row.family.anchor_type,
          description: row.family.description ?? undefined,
          safetyNotes: row.family.safety_notes ?? undefined,
          diagramImageUrl: row.family.diagram_image_url ?? undefined,
          minEdgeDistanceFormula: row.family.min_edge_distance_formula ?? undefined,
          minSpacingFormula: row.family.min_spacing_formula ?? undefined,
        }
      : undefined,
    compatibleLiftingEyes: (row.lifting_anchor_lifting_eyes ?? [])
      .map((j) => j.lifting_eyes)
      .filter((e): e is RawLiftingEyeRef => e !== null)
      .map((e) => ({
        title: e.title,
        partNumber: e.part_number ?? undefined,
        tonnageRangeLabel: e.tonnage_range_label,
        imageUrl: e.image_url ?? undefined,
      })),
    compatibleRecessSystems: (row.lifting_anchor_recess_systems ?? [])
      .map((j) => j.recess_systems)
      .filter((r): r is RawRecessSystemRef => r !== null)
      .map((r) => ({
        title: r.title,
        systemType: r.system_type,
        tonnageRating: r.tonnage_rating,
        imageUrl: r.image_url ?? undefined,
      })),
  };
}

export async function getElementTypeOptions(): Promise<ElementTypeOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("element_types")
    .select("id, title, slug, geometry_type")
    .order("title", { ascending: true });

  if (error) {
    console.error("getElementTypeOptions:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    geometryType: row.geometry_type,
  }));
}

export async function getCalculatorSettings(): Promise<CalculatorSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calculator_settings")
    .select("sling_angle_load_factors, dynamic_load_factors")
    .eq("id", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getCalculatorSettings:", error.message);
    return null;
  }

  return {
    slingAngleLoadFactors: data.sling_angle_load_factors ?? [],
    dynamicLoadFactors: data.dynamic_load_factors ?? [],
  };
}
