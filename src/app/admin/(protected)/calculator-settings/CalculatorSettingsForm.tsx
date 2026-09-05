"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DynamicLoadRow, SlingAngleRow } from "@/lib/types";
import {
  saveCalculatorSettings,
  type CalculatorSettingsInput,
} from "./actions";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from "@/components/admin/formStyles";

const RISK_LEVELS: SlingAngleRow["riskLevel"][] = [
  "typical",
  "maxAllowedCaution",
  "doNotUse",
];

const CONDITIONS: DynamicLoadRow["condition"][] = [
  "stationaryCrane",
  "smoothSurface",
  "unevenSurface",
];

function numOrUndefined(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

export default function CalculatorSettingsForm({
  initial,
}: {
  initial: CalculatorSettingsInput;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [form, setForm] = useState<CalculatorSettingsInput>(initial);

  function updateSlingRow(index: number, patch: Partial<SlingAngleRow>) {
    setForm((f) => {
      const next = [...f.sling_angle_load_factors];
      next[index] = { ...next[index], ...patch };
      return { ...f, sling_angle_load_factors: next };
    });
  }

  function updateDynamicRow(index: number, patch: Partial<DynamicLoadRow>) {
    setForm((f) => {
      const next = [...f.dynamic_load_factors];
      next[index] = { ...next[index], ...patch };
      return { ...f, dynamic_load_factors: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await saveCalculatorSettings(form);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-4xl flex-col gap-8 rounded-lg border border-black/10 bg-white p-6"
    >
      {/* ---- Sling angle load factors ---- */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-lp-navy-dark">
              Sling angle load factors
            </h2>
            <p className="text-xs text-black/50">
              Load multiplier by rigging spread angle (SPA).
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                sling_angle_load_factors: [
                  ...f.sling_angle_load_factors,
                  { slingAngleDeg: 90, loadFactor: 1 },
                ],
              }))
            }
            className={buttonSecondaryClass}
          >
            + Add row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-black/50">
              <tr>
                <th className="px-2 py-2">SLA (°)</th>
                <th className="px-2 py-2">VCA (°)</th>
                <th className="px-2 py-2">SPA (°)</th>
                <th className="px-2 py-2">Load increase (%)</th>
                <th className="px-2 py-2">Load factor</th>
                <th className="px-2 py-2">Risk level</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {form.sling_angle_load_factors.map((row, i) => (
                <tr key={i} className="border-t border-black/5">
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      step="any"
                      value={row.slingAngleDeg ?? ""}
                      onChange={(e) =>
                        updateSlingRow(i, {
                          slingAngleDeg: Number(e.target.value),
                        })
                      }
                      className={`${inputClass} w-20`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      step="any"
                      value={row.verticalCableAngleDeg ?? ""}
                      onChange={(e) =>
                        updateSlingRow(i, {
                          verticalCableAngleDeg: numOrUndefined(e.target.value),
                        })
                      }
                      className={`${inputClass} w-20`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      step="any"
                      value={row.spreadAngleDeg ?? ""}
                      onChange={(e) =>
                        updateSlingRow(i, {
                          spreadAngleDeg: numOrUndefined(e.target.value),
                        })
                      }
                      className={`${inputClass} w-20`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      step="any"
                      value={row.loadIncreasePercent ?? ""}
                      onChange={(e) =>
                        updateSlingRow(i, {
                          loadIncreasePercent: numOrUndefined(e.target.value),
                        })
                      }
                      className={`${inputClass} w-24`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      step="any"
                      value={row.loadFactor ?? ""}
                      onChange={(e) =>
                        updateSlingRow(i, { loadFactor: Number(e.target.value) })
                      }
                      className={`${inputClass} w-24`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={row.riskLevel ?? ""}
                      onChange={(e) =>
                        updateSlingRow(i, {
                          riskLevel: (e.target.value ||
                            undefined) as SlingAngleRow["riskLevel"],
                        })
                      }
                      className={`${selectClass} w-40`}
                    >
                      <option value="">—</option>
                      {RISK_LEVELS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          sling_angle_load_factors: f.sling_angle_load_factors.filter(
                            (_, idx) => idx !== i
                          ),
                        }))
                      }
                      className="text-xs font-semibold text-lp-red hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- Dynamic / shock load factors ---- */}
      <section className="flex flex-col gap-3 border-t border-black/10 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-lp-navy-dark">
              Dynamic / shock load factors
            </h2>
            <p className="text-xs text-black/50">
              Multipliers for cable vs. chain rigging under different handling
              conditions.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                dynamic_load_factors: [
                  ...f.dynamic_load_factors,
                  { condition: "stationaryCrane" },
                ],
              }))
            }
            className={buttonSecondaryClass}
          >
            + Add row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-black/50">
              <tr>
                <th className="px-2 py-2">Condition</th>
                <th className="px-2 py-2">Cable rigging factor (min)</th>
                <th className="px-2 py-2">Chain rigging factor (min)</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {form.dynamic_load_factors.map((row, i) => (
                <tr key={i} className="border-t border-black/5">
                  <td className="px-2 py-1.5">
                    <select
                      value={row.condition}
                      onChange={(e) =>
                        updateDynamicRow(i, {
                          condition: e.target.value as DynamicLoadRow["condition"],
                        })
                      }
                      className={`${selectClass} w-48`}
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      step="any"
                      value={row.cableRiggingFactor ?? ""}
                      onChange={(e) =>
                        updateDynamicRow(i, {
                          cableRiggingFactor: numOrUndefined(e.target.value),
                        })
                      }
                      className={`${inputClass} w-32`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      step="any"
                      value={row.chainRiggingFactor ?? ""}
                      onChange={(e) =>
                        updateDynamicRow(i, {
                          chainRiggingFactor: numOrUndefined(e.target.value),
                        })
                      }
                      className={`${inputClass} w-32`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          dynamic_load_factors: f.dynamic_load_factors.filter(
                            (_, idx) => idx !== i
                          ),
                        }))
                      }
                      className="text-xs font-semibold text-lp-red hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Notes</span>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
          className={textareaClass}
          placeholder="e.g. Lifting with chains is not recommended. Source: ALP Supply 2026 Catalog, p.7."
        />
      </label>

      {error && (
        <p className="rounded-md bg-lp-red/5 px-4 py-3 text-sm text-lp-red">
          {error}
        </p>
      )}
      {savedAt && !error && (
        <p className="text-sm text-emerald-700">Saved.</p>
      )}

      <div>
        <button type="submit" disabled={isPending} className={buttonPrimaryClass}>
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
