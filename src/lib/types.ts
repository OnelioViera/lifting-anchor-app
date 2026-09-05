// ---------------------------------------------------------------------
// Public app types — the shape data.ts hands to pages/components.
// (Field names are camelCase here regardless of the underlying Postgres
// column names, which data.ts maps from.)
// ---------------------------------------------------------------------

export interface DimensionField {
  key: string;
  value: string;
  valueIn?: number;
}

export interface CapacityRow {
  concreteStrengthPsi?: number;
  slabMinThicknessIn?: number;
  edgeDistanceTensionIn?: number;
  edgeDistanceShearIn?: number;
  minCornerDistanceIn?: number;
  minSpacingIn?: number;
  swlTensionLbs: number;
  swlShearLbs?: number;
  ultimateMechanicalTensionLbs?: number;
  notes?: string;
}

export interface AnchorListItem {
  id: string;
  title: string;
  partNumber: string;
  slug: string;
  sizeLabel?: string;
  imageUrl?: string;
  finish?: string;
  colorCode?: string;
  weightLbs?: number;
  tonnageRating?: number;
  wireDiameterIn?: number;
  boltDiameterIn?: number;
  typicalElementThicknessIn?: number;
  dimensions: DimensionField[];
  capacityTable: CapacityRow[];
  safetyFactor?: number;
  brand?: { title: string; slug: string; logoUrl?: string };
  family?: { title: string; slug: string; anchorType: string };
  elementTypes?: { title: string; slug: string }[];
}

export interface AnchorDetail extends AnchorListItem {
  datasheetPdfUrl?: string;
  qtyPerBag?: number;
  qtyPerCrate?: number;
  sourceCatalogPage?: string;
  installationNotes?: string;
  family?: AnchorListItem["family"] & {
    description?: string;
    safetyNotes?: string;
    diagramImageUrl?: string;
    minEdgeDistanceFormula?: string;
    minSpacingFormula?: string;
  };
  compatibleLiftingEyes?: {
    title: string;
    partNumber?: string;
    tonnageRangeLabel: string;
    imageUrl?: string;
  }[];
  compatibleRecessSystems?: {
    title: string;
    systemType: string;
    tonnageRating: number;
    imageUrl?: string;
  }[];
}

export interface ElementTypeOption {
  id: string;
  title: string;
  slug: string;
  geometryType: string;
}

export interface SlingAngleRow {
  slingAngleDeg: number;
  verticalCableAngleDeg?: number;
  spreadAngleDeg?: number;
  loadIncreasePercent?: number;
  loadFactor: number;
  riskLevel?: "typical" | "maxAllowedCaution" | "doNotUse";
}

export interface DynamicLoadRow {
  condition: "stationaryCrane" | "smoothSurface" | "unevenSurface";
  cableRiggingFactor?: number;
  chainRiggingFactor?: number;
}

export interface CalculatorSettings {
  slingAngleLoadFactors?: SlingAngleRow[];
  dynamicLoadFactors?: DynamicLoadRow[];
}

// ---------------------------------------------------------------------
// Admin / database row types — one per Postgres table, field names match
// the SQL columns exactly (see supabase/schema.sql). Used by the admin
// CRUD forms and server actions.
// ---------------------------------------------------------------------

export interface BrandRow {
  id: string;
  title: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
}

export type AnchorType =
  | "recessedWireAnchor"
  | "pinAnchor"
  | "liftLoop"
  | "coilInsert"
  | "other";

export interface AnchorFamilyRow {
  id: string;
  title: string;
  slug: string;
  brand_id: string | null;
  anchor_type: AnchorType;
  description: string | null;
  safety_notes: string | null;
  diagram_image_url: string | null;
  allowable_load_zone_degrees: number | null;
  min_edge_distance_formula: string | null;
  min_spacing_formula: string | null;
  source_catalog_ref: string | null;
}

export type GeometryType = "box" | "slab" | "wallPanel" | "riser" | "other";

export interface PickPattern {
  numberOfPoints?: number;
  anchorsTakingLoad?: number;
  description?: string;
  diagramImageUrl?: string;
}

export interface ElementTypeRow {
  id: string;
  title: string;
  slug: string;
  geometry_type: GeometryType;
  description: string | null;
  diagram_image_url: string | null;
  typical_pick_patterns: PickPattern[];
}

export interface LiftingEyeRow {
  id: string;
  title: string;
  part_number: string | null;
  brand_id: string | null;
  tonnage_range_label: string;
  min_tonnage: number | null;
  max_tonnage: number | null;
  image_url: string | null;
  weight_lbs: number | null;
  notes: string | null;
}

export type RecessSystemType = "rubber" | "plus" | "disposable";

export interface RecessSystemRow {
  id: string;
  title: string;
  system_type: RecessSystemType;
  tonnage_rating: number;
  image_url: string | null;
  dimensions: DimensionField[];
}

export type ReductionConditionType = "freeEdge" | "thinWall" | "other";

export interface ReductionTableRow {
  rowValue: number;
  factors: number[];
}

export interface LoadReductionTableRow {
  id: string;
  title: string;
  condition_type: ReductionConditionType;
  family_id: string | null;
  row_label: string | null;
  columns: string[];
  rows: ReductionTableRow[];
  notes: string | null;
}

export type FinishType =
  | "Hot-dipped galvanized"
  | "Plain"
  | "Plated"
  | "Stainless Steel";

export interface LiftingAnchorRow {
  id: string;
  title: string;
  part_number: string;
  slug: string;
  brand_id: string;
  family_id: string;
  size_label: string | null;
  image_url: string | null;
  datasheet_pdf_url: string | null;
  finish: FinishType | null;
  color_code: string | null;
  weight_lbs: number | null;
  qty_per_bag: number | null;
  qty_per_crate: number | null;
  source_catalog_page: string | null;
  tonnage_rating: number | null;
  wire_diameter_in: number | null;
  bolt_diameter_in: number | null;
  number_of_struts: number | null;
  typical_element_thickness_in: number | null;
  dimensions: DimensionField[];
  capacity_table: CapacityRow[];
  safety_factor: number;
  installation_notes: string | null;
  // Populated separately (join tables), not a real column:
  element_type_ids?: string[];
  lifting_eye_ids?: string[];
  recess_system_ids?: string[];
  reduction_table_ids?: string[];
}

export interface CalculatorSettingsRow {
  id: true;
  sling_angle_load_factors: SlingAngleRow[];
  dynamic_load_factors: DynamicLoadRow[];
  notes: string | null;
}
