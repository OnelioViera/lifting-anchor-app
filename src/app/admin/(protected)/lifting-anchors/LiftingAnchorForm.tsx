"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CapacityRow, DimensionField } from "@/lib/types";
import { saveLiftingAnchor, type LiftingAnchorInput } from "./actions";
import ImageUploadField from "@/components/admin/ImageUploadField";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from "@/components/admin/formStyles";
import { slugify } from "@/lib/slugify";
import Link from "next/link";

interface OptionRef {
  id: string;
  label: string;
}

const FINISH_OPTIONS = [
  "Hot-dipped galvanized",
  "Plain",
  "Plated",
  "Stainless Steel",
];

function numOrNull(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

const emptyForm: LiftingAnchorInput = {
  title: "",
  part_number: "",
  slug: "",
  brand_id: "",
  family_id: "",
  size_label: null,
  image_url: null,
  datasheet_pdf_url: null,
  finish: null,
  color_code: null,
  weight_lbs: null,
  qty_per_bag: null,
  qty_per_crate: null,
  source_catalog_page: null,
  tonnage_rating: null,
  wire_diameter_in: null,
  bolt_diameter_in: null,
  number_of_struts: null,
  typical_element_thickness_in: null,
  dimensions: [],
  capacity_table: [],
  safety_factor: 4,
  installation_notes: null,
  element_type_ids: [],
  lifting_eye_ids: [],
  recess_system_ids: [],
  reduction_table_ids: [],
};

export default function LiftingAnchorForm({
  id,
  initial,
  brands,
  families,
  elementTypes,
  liftingEyes,
  recessSystems,
  reductionTables,
}: {
  id?: string;
  initial?: Partial<LiftingAnchorInput>;
  brands: OptionRef[];
  families: OptionRef[];
  elementTypes: OptionRef[];
  liftingEyes: OptionRef[];
  recessSystems: OptionRef[];
  reductionTables: OptionRef[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const [form, setForm] = useState<LiftingAnchorInput>({
    ...emptyForm,
    ...initial,
  });

  function update<K extends keyof LiftingAnchorInput>(
    key: K,
    value: LiftingAnchorInput[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleId(key: keyof LiftingAnchorInput, id: string) {
    setForm((f) => {
      const current = f[key] as string[];
      const next = current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id];
      return { ...f, [key]: next };
    });
  }

  function updateDimension(index: number, patch: Partial<DimensionField>) {
    setForm((f) => {
      const next = [...f.dimensions];
      next[index] = { ...next[index], ...patch };
      return { ...f, dimensions: next };
    });
  }

  function updateCapacityRow(index: number, patch: Partial<CapacityRow>) {
    setForm((f) => {
      const next = [...f.capacity_table];
      next[index] = { ...next[index], ...patch };
      return { ...f, capacity_table: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveLiftingAnchor(id ?? null, form);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/lifting-anchors");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-4xl flex-col gap-8 rounded-lg border border-black/10 bg-white p-6"
    >
      {/* ---- General ---- */}
      <section className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Display name *</span>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Part # *</span>
          <input
            required
            value={form.part_number}
            onChange={(e) => {
              const value = e.target.value;
              update("part_number", value);
              if (!slugEdited) update("slug", slugify(value));
            }}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Slug *</span>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugEdited(true);
              update("slug", e.target.value);
            }}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Size / ID label</span>
          <input
            value={form.size_label ?? ""}
            onChange={(e) => update("size_label", e.target.value || null)}
            className={inputClass}
            placeholder='e.g. "5/4", "1T"'
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Brand *</span>
          <select
            required
            value={form.brand_id}
            onChange={(e) => update("brand_id", e.target.value)}
            className={selectClass}
          >
            <option value="">Select…</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Anchor family / system *</span>
          <select
            required
            value={form.family_id}
            onChange={(e) => update("family_id", e.target.value)}
            className={selectClass}
          >
            <option value="">Select…</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Finish</span>
          <select
            value={form.finish ?? ""}
            onChange={(e) => update("finish", e.target.value || null)}
            className={selectClass}
          >
            <option value="">—</option>
            {FINISH_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Color code</span>
          <input
            value={form.color_code ?? ""}
            onChange={(e) => update("color_code", e.target.value || null)}
            className={inputClass}
            placeholder="e.g. Blue (color-coded lift loops)"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={labelClass}>Product image</span>
          <ImageUploadField
            value={form.image_url}
            onChange={(url) => update("image_url", url || null)}
          />
        </label>
      </section>

      {/* ---- Dimensions / filterable attributes ---- */}
      <section className="flex flex-col gap-4 border-t border-black/10 pt-6">
        <h2 className="text-sm font-semibold text-lp-navy-dark">
          Dimensions &amp; filterable attributes
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <NumberField
            label="Tonnage rating (tons)"
            value={form.tonnage_rating}
            onChange={(v) => update("tonnage_rating", v)}
          />
          <NumberField
            label="Wire diameter (in)"
            value={form.wire_diameter_in}
            onChange={(v) => update("wire_diameter_in", v)}
          />
          <NumberField
            label="Bolt diameter (in)"
            value={form.bolt_diameter_in}
            onChange={(v) => update("bolt_diameter_in", v)}
          />
          <NumberField
            label="Number of struts (coil inserts)"
            value={form.number_of_struts}
            onChange={(v) => update("number_of_struts", v)}
          />
          <NumberField
            label="Typical slab/wall thickness (in)"
            value={form.typical_element_thickness_in}
            onChange={(v) => update("typical_element_thickness_in", v)}
          />
          <NumberField
            label="Weight (lbs)"
            value={form.weight_lbs}
            onChange={(v) => update("weight_lbs", v)}
          />
          <NumberField
            label="Qty / Bag"
            value={form.qty_per_bag}
            onChange={(v) => update("qty_per_bag", v)}
          />
          <NumberField
            label="Qty / Crate"
            value={form.qty_per_crate}
            onChange={(v) => update("qty_per_crate", v)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={labelClass}>
              Dimensions (as labeled on the catalog drawing)
            </span>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  dimensions: [...f.dimensions, { key: "", value: "" }],
                }))
              }
              className={buttonSecondaryClass}
            >
              + Add dimension
            </button>
          </div>
          {form.dimensions.map((d, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                value={d.key}
                onChange={(e) => updateDimension(i, { key: e.target.value })}
                placeholder="Label (e.g. W, H, FD)"
                className={`${inputClass} w-32`}
              />
              <input
                value={d.value}
                onChange={(e) => updateDimension(i, { value: e.target.value })}
                placeholder='Value (e.g. 5-1/4")'
                className={`${inputClass} w-40`}
              />
              <input
                type="number"
                step="any"
                value={d.valueIn ?? ""}
                onChange={(e) =>
                  updateDimension(i, { valueIn: numOrNull(e.target.value) ?? undefined })
                }
                placeholder="Decimal in."
                className={`${inputClass} w-28`}
              />
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    dimensions: f.dimensions.filter((_, idx) => idx !== i),
                  }))
                }
                className="text-xs font-semibold text-lp-red hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Capacity table ---- */}
      <section className="flex flex-col gap-3 border-t border-black/10 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-lp-navy-dark">
            Capacity table
          </h2>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                capacity_table: [...f.capacity_table, { swlTensionLbs: 0 }],
              }))
            }
            className={buttonSecondaryClass}
          >
            + Add row
          </button>
        </div>

        {form.capacity_table.length === 0 && (
          <p className="text-sm text-black/50">
            No rows yet — add at least one to publish this part.
          </p>
        )}

        {form.capacity_table.map((row, i) => (
          <div
            key={i}
            className="grid gap-3 rounded-md border border-black/10 p-4 sm:grid-cols-4"
          >
            <NumberField
              label="Concrete strength (psi)"
              value={row.concreteStrengthPsi ?? null}
              onChange={(v) =>
                updateCapacityRow(i, { concreteStrengthPsi: v ?? undefined })
              }
            />
            <NumberField
              label="Min. slab/wall thickness (in)"
              value={row.slabMinThicknessIn ?? null}
              onChange={(v) =>
                updateCapacityRow(i, { slabMinThicknessIn: v ?? undefined })
              }
            />
            <NumberField
              label="Edge dist. — tension (in)"
              value={row.edgeDistanceTensionIn ?? null}
              onChange={(v) =>
                updateCapacityRow(i, { edgeDistanceTensionIn: v ?? undefined })
              }
            />
            <NumberField
              label="Edge dist. — shear (in)"
              value={row.edgeDistanceShearIn ?? null}
              onChange={(v) =>
                updateCapacityRow(i, { edgeDistanceShearIn: v ?? undefined })
              }
            />
            <NumberField
              label="Min. corner distance (in)"
              value={row.minCornerDistanceIn ?? null}
              onChange={(v) =>
                updateCapacityRow(i, { minCornerDistanceIn: v ?? undefined })
              }
            />
            <NumberField
              label="Min. anchor spacing (in)"
              value={row.minSpacingIn ?? null}
              onChange={(v) =>
                updateCapacityRow(i, { minSpacingIn: v ?? undefined })
              }
            />
            <NumberField
              label="SWL — tension @ 90° (lbs) *"
              value={row.swlTensionLbs ?? null}
              onChange={(v) =>
                updateCapacityRow(i, { swlTensionLbs: v ?? 0 })
              }
            />
            <NumberField
              label="SWL — shear @ 90° (lbs)"
              value={row.swlShearLbs ?? null}
              onChange={(v) =>
                updateCapacityRow(i, { swlShearLbs: v ?? undefined })
              }
            />
            <NumberField
              label="Ultimate mechanical tension (lbs)"
              value={row.ultimateMechanicalTensionLbs ?? null}
              onChange={(v) =>
                updateCapacityRow(i, {
                  ultimateMechanicalTensionLbs: v ?? undefined,
                })
              }
            />
            <label className="flex flex-col gap-1.5 sm:col-span-3">
              <span className={labelClass}>Notes</span>
              <input
                value={row.notes ?? ""}
                onChange={(e) =>
                  updateCapacityRow(i, { notes: e.target.value || undefined })
                }
                className={inputClass}
              />
            </label>
            <div className="sm:col-span-4">
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    capacity_table: f.capacity_table.filter((_, idx) => idx !== i),
                  }))
                }
                className="text-xs font-semibold text-lp-red hover:underline"
              >
                Remove row
              </button>
            </div>
          </div>
        ))}

        <NumberField
          label="Published safety factor (e.g. 4 for a 4:1 SWL)"
          value={form.safety_factor}
          onChange={(v) => update("safety_factor", v ?? 4)}
        />
      </section>

      {/* ---- Compatibility ---- */}
      <section className="flex flex-col gap-5 border-t border-black/10 pt-6">
        <h2 className="text-sm font-semibold text-lp-navy-dark">
          Compatibility
        </h2>

        <CheckboxGroup
          label="Suitable precast element types"
          options={elementTypes}
          selected={form.element_type_ids}
          onToggle={(id) => toggleId("element_type_ids", id)}
        />
        <CheckboxGroup
          label="Compatible lifting eyes"
          options={liftingEyes}
          selected={form.lifting_eye_ids}
          onToggle={(id) => toggleId("lifting_eye_ids", id)}
        />
        <CheckboxGroup
          label="Compatible recess systems"
          options={recessSystems}
          selected={form.recess_system_ids}
          onToggle={(id) => toggleId("recess_system_ids", id)}
        />
        <CheckboxGroup
          label="Applicable load reduction tables"
          options={reductionTables}
          selected={form.reduction_table_ids}
          onToggle={(id) => toggleId("reduction_table_ids", id)}
        />

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Installation / orientation notes</span>
          <textarea
            value={form.installation_notes ?? ""}
            onChange={(e) => update("installation_notes", e.target.value || null)}
            className={textareaClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Source catalog page</span>
          <input
            value={form.source_catalog_page ?? ""}
            onChange={(e) => update("source_catalog_page", e.target.value || null)}
            placeholder="e.g. ALP Supply 2026 Catalog, p.78"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Datasheet / catalog page (PDF URL)</span>
          <ImageUploadField
            value={form.datasheet_pdf_url}
            onChange={(url) => update("datasheet_pdf_url", url || null)}
          />
        </label>
      </section>

      {error && (
        <p className="rounded-md bg-lp-red/5 px-4 py-3 text-sm text-lp-red">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
          {isPending ? "Saving…" : "Save"}
        </button>
        <Link href="/admin/lifting-anchors" className={buttonSecondaryClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e) => onChange(numOrNull(e.target.value))}
        className={inputClass}
      />
    </label>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: OptionRef[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      {options.length === 0 ? (
        <p className="text-xs text-black/40">None added yet.</p>
      ) : (
        <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border border-black/10 p-3">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => onToggle(opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
