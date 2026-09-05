// Config-driven admin CRUD for the "simple" resources — the ones whose
// forms are plain field lists (no dynamic client-side row editors). Add a
// field here and the list/new/edit pages at /admin/[resource] pick it up
// automatically. Lifting Anchors and Calculator Settings are richer
// (dynamic dimension/capacity/factor-table editors) and live in their own
// route folders instead — see src/app/admin/lifting-anchors and
// src/app/admin/calculator-settings.

export type SimpleFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "json"
  | "slug"
  | "image";

export interface RelationRef {
  table: string;
  labelColumn: string;
}

export interface SimpleFieldConfig {
  name: string;
  label: string;
  type: SimpleFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  relation?: RelationRef;
  /** For type "slug": the name of the field to auto-generate the slug from. */
  slugFrom?: string;
}

export interface SimpleResourceConfig {
  key: string;
  table: string;
  label: string;
  labelPlural: string;
  fields: SimpleFieldConfig[];
  listColumns: { name: string; label: string }[];
  orderBy: string;
}

const ANCHOR_TYPE_OPTIONS = [
  { value: "recessedWireAnchor", label: "Recessed wire anchor (e.g. Utility Lift)" },
  { value: "pinAnchor", label: "Cast-in pin anchor (e.g. Lifting Pin)" },
  { value: "liftLoop", label: "Face lift loop" },
  { value: "coilInsert", label: "Coil insert" },
  { value: "other", label: "Other" },
];

const GEOMETRY_TYPE_OPTIONS = [
  { value: "box", label: "Box / vault (4 walls + base/top)" },
  { value: "slab", label: "Flat slab / pad / lid" },
  { value: "wallPanel", label: "Wall panel" },
  { value: "riser", label: "Riser / ring" },
  { value: "other", label: "Other" },
];

const RECESS_SYSTEM_TYPE_OPTIONS = [
  { value: "rubber", label: "Rubber Recess" },
  { value: "plus", label: "Plus Recess" },
  { value: "disposable", label: "Disposable Recess" },
];

const REDUCTION_CONDITION_OPTIONS = [
  { value: "freeEdge", label: "Free edge (shear cone on 1 side)" },
  { value: "thinWall", label: "Thin wall (shear cone on 2 sides)" },
  { value: "other", label: "Other" },
];

export const SIMPLE_RESOURCES: Record<string, SimpleResourceConfig> = {
  brands: {
    key: "brands",
    table: "brands",
    label: "Brand",
    labelPlural: "Brands",
    orderBy: "title",
    listColumns: [
      { name: "title", label: "Name" },
      { name: "website", label: "Website" },
    ],
    fields: [
      { name: "title", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", slugFrom: "title", required: true },
      { name: "logo_url", label: "Logo", type: "image" },
      { name: "website", label: "Website", type: "text", placeholder: "https://…" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
    ],
  },

  "anchor-families": {
    key: "anchor-families",
    table: "anchor_families",
    label: "Anchor Family / System",
    labelPlural: "Anchor Families",
    orderBy: "title",
    listColumns: [
      { name: "title", label: "Family name" },
      { name: "anchor_type", label: "Type" },
      { name: "brand_id", label: "Brand" },
    ],
    fields: [
      { name: "title", label: "Family name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", slugFrom: "title", required: true },
      {
        name: "brand_id",
        label: "Brand",
        type: "select",
        relation: { table: "brands", labelColumn: "title" },
      },
      {
        name: "anchor_type",
        label: "Anchor type",
        type: "select",
        required: true,
        options: ANCHOR_TYPE_OPTIONS,
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "safety_notes", label: "Safety / installation notes", type: "textarea" },
      { name: "diagram_image_url", label: "Diagram image", type: "image" },
      {
        name: "allowable_load_zone_degrees",
        label: "Allowable load zone (± degrees from vertical/axis)",
        type: "number",
      },
      {
        name: "min_edge_distance_formula",
        label: "Minimum edge distance formula",
        type: "text",
        placeholder: "e.g. 1.5 × Embedded Depth",
      },
      {
        name: "min_spacing_formula",
        label: "Minimum anchor spacing formula",
        type: "text",
        placeholder: "e.g. 3 × Insert Length",
      },
      {
        name: "source_catalog_ref",
        label: "Source catalog reference",
        type: "text",
        placeholder: "ALP Supply 2026 Precast Accessories Technical Manual & Catalog",
      },
    ],
  },

  "element-types": {
    key: "element-types",
    table: "element_types",
    label: "Precast Element Type",
    labelPlural: "Precast Element Types",
    orderBy: "title",
    listColumns: [
      { name: "title", label: "Name" },
      { name: "geometry_type", label: "Geometry" },
    ],
    fields: [
      { name: "title", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", slugFrom: "title", required: true },
      {
        name: "geometry_type",
        label: "Geometry type",
        type: "select",
        required: true,
        options: GEOMETRY_TYPE_OPTIONS,
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "diagram_image_url", label: "Diagram image", type: "image" },
      {
        name: "typical_pick_patterns",
        label: "Typical pick patterns (JSON)",
        type: "json",
        helpText:
          'Array of rigging layouts, e.g. [{"numberOfPoints":4,"anchorsTakingLoad":4,"description":"4-point pick"}]',
      },
    ],
  },

  "lifting-eyes": {
    key: "lifting-eyes",
    table: "lifting_eyes",
    label: "Lifting Eye",
    labelPlural: "Lifting Eyes",
    orderBy: "title",
    listColumns: [
      { name: "title", label: "Name" },
      { name: "tonnage_range_label", label: "Tonnage" },
      { name: "part_number", label: "Part #" },
    ],
    fields: [
      { name: "title", label: "Name", type: "text", required: true },
      { name: "part_number", label: "Part #", type: "text" },
      {
        name: "brand_id",
        label: "Brand",
        type: "select",
        relation: { table: "brands", labelColumn: "title" },
      },
      {
        name: "tonnage_range_label",
        label: "Tonnage rating label",
        type: "text",
        required: true,
        placeholder: 'e.g. "3-5T" as marked on the bail',
      },
      { name: "min_tonnage", label: "Minimum tonnage", type: "number" },
      { name: "max_tonnage", label: "Maximum tonnage", type: "number" },
      { name: "image_url", label: "Image", type: "image" },
      { name: "weight_lbs", label: "Weight (lbs)", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },

  "recess-systems": {
    key: "recess-systems",
    table: "recess_systems",
    label: "Recess System",
    labelPlural: "Recess Systems",
    orderBy: "title",
    listColumns: [
      { name: "title", label: "Name" },
      { name: "system_type", label: "Type" },
      { name: "tonnage_rating", label: "Tonnage" },
    ],
    fields: [
      { name: "title", label: "Name", type: "text", required: true },
      {
        name: "system_type",
        label: "System type",
        type: "select",
        required: true,
        options: RECESS_SYSTEM_TYPE_OPTIONS,
      },
      {
        name: "tonnage_rating",
        label: "Tonnage rating",
        type: "number",
        required: true,
        placeholder: "e.g. 1, 2, 4, 8, 16, 20",
      },
      { name: "image_url", label: "Image", type: "image" },
      {
        name: "dimensions",
        label: "Recess dimensions (JSON)",
        type: "json",
        helpText: 'Array of {"key":"L","value":"4-3/4\\"","valueIn":4.75}',
      },
    ],
  },

  "load-reduction-tables": {
    key: "load-reduction-tables",
    table: "load_reduction_tables",
    label: "Load Reduction Table",
    labelPlural: "Load Reduction Tables",
    orderBy: "title",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "condition_type", label: "Condition" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "condition_type",
        label: "Condition",
        type: "select",
        required: true,
        options: REDUCTION_CONDITION_OPTIONS,
      },
      {
        name: "family_id",
        label: "Applies to family",
        type: "select",
        relation: { table: "anchor_families", labelColumn: "title" },
      },
      {
        name: "row_label",
        label: "Row axis label",
        type: "text",
        placeholder: 'e.g. "De (in)" or "WT (in)"',
      },
      {
        name: "columns",
        label: "Column labels (JSON)",
        type: "json",
        required: true,
        helpText: 'Array of strings, e.g. ["CI-16 4\\"", "CI-16 6\\"", "CI-18 9\\""]',
      },
      {
        name: "rows",
        label: "Rows (JSON)",
        type: "json",
        required: true,
        helpText:
          'Array of {"rowValue":4,"factors":[1,0.9,0.8]} — factors in the same order as the column labels above.',
      },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
};

export function getResourceConfig(key: string): SimpleResourceConfig | undefined {
  return SIMPLE_RESOURCES[key];
}

export function listResourceConfigs(): SimpleResourceConfig[] {
  return Object.values(SIMPLE_RESOURCES);
}
