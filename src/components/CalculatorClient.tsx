"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  computeRequiredLoadPerAnchor,
  findMatchingAnchors,
  type CalculatorInputs,
} from "@/lib/calculator";
import type {
  AnchorListItem,
  CalculatorSettings,
  ElementTypeOption,
} from "@/lib/types";

const FALLBACK_SPREAD_ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120];

export default function CalculatorClient({
  anchors,
  elementTypes,
  settings,
}: {
  anchors: AnchorListItem[];
  elementTypes: ElementTypeOption[];
  settings?: CalculatorSettings;
}) {
  const [elementTypeSlug, setElementTypeSlug] = useState<string>("");
  const [thicknessIn, setThicknessIn] = useState<number>(6);
  const [concreteStrengthPsi, setConcreteStrengthPsi] = useState<
    number | undefined
  >(4000);
  const [totalWeightLbs, setTotalWeightLbs] = useState<number>(8000);
  const [anchorsTakingLoad, setAnchorsTakingLoad] = useState<number>(4);
  const [spreadAngleDeg, setSpreadAngleDeg] = useState<number>(60);
  const [dynamicCondition, setDynamicCondition] =
    useState<CalculatorInputs["dynamicCondition"]>("smoothSurface");
  const [riggingType, setRiggingType] =
    useState<CalculatorInputs["riggingType"]>("cable");
  const [availableEdgeDistanceIn, setAvailableEdgeDistanceIn] = useState<
    number | undefined
  >(undefined);

  const spreadAngleOptions =
    settings?.slingAngleLoadFactors
      ?.map((r) => r.spreadAngleDeg)
      .filter((v): v is number => v !== undefined)
      .sort((a, b) => a - b) ?? FALLBACK_SPREAD_ANGLES;

  const inputs: CalculatorInputs = {
    elementTypeSlug: elementTypeSlug || undefined,
    thicknessIn,
    concreteStrengthPsi,
    totalWeightLbs,
    anchorsTakingLoad,
    spreadAngleDeg,
    dynamicCondition,
    riggingType,
    availableEdgeDistanceIn,
  };

  const requiredLoadPerAnchor = useMemo(
    () => computeRequiredLoadPerAnchor(inputs, settings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      totalWeightLbs,
      anchorsTakingLoad,
      spreadAngleDeg,
      dynamicCondition,
      riggingType,
      settings,
    ]
  );

  const matches = useMemo(
    () => findMatchingAnchors(anchors, inputs, settings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      anchors,
      elementTypeSlug,
      thicknessIn,
      concreteStrengthPsi,
      totalWeightLbs,
      anchorsTakingLoad,
      spreadAngleDeg,
      dynamicCondition,
      riggingType,
      availableEdgeDistanceIn,
      settings,
    ]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form className="flex flex-col gap-5 rounded-lg border border-black/10 bg-white p-6">
        <Field label="Precast element type">
          <select
            className={selectClass}
            value={elementTypeSlug}
            onChange={(e) => setElementTypeSlug(e.target.value)}
          >
            <option value="">Any</option>
            {elementTypes.map((et) => (
              <option key={et.id} value={et.slug}>
                {et.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Element thickness (in)">
          <input
            type="number"
            className={inputClass}
            value={thicknessIn}
            min={0}
            step={0.25}
            onChange={(e) => setThicknessIn(Number(e.target.value))}
          />
        </Field>

        <Field label="Concrete strength at lift (psi)">
          <input
            type="number"
            className={inputClass}
            value={concreteStrengthPsi ?? ""}
            min={0}
            step={100}
            placeholder="unknown"
            onChange={(e) =>
              setConcreteStrengthPsi(
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
          />
        </Field>

        <Field label="Total element weight (lbs)">
          <input
            type="number"
            className={inputClass}
            value={totalWeightLbs}
            min={0}
            onChange={(e) => setTotalWeightLbs(Number(e.target.value))}
          />
        </Field>

        <Field label="Number of anchors taking the load">
          <input
            type="number"
            className={inputClass}
            value={anchorsTakingLoad}
            min={1}
            onChange={(e) => setAnchorsTakingLoad(Number(e.target.value))}
          />
        </Field>

        <Field label="Rigging spread angle (SPA, °)">
          <select
            className={selectClass}
            value={spreadAngleDeg}
            onChange={(e) => setSpreadAngleDeg(Number(e.target.value))}
          >
            {spreadAngleOptions.map((deg) => (
              <option key={deg} value={deg}>
                {deg}°
              </option>
            ))}
          </select>
        </Field>

        <Field label="Handling condition">
          <select
            className={selectClass}
            value={dynamicCondition}
            onChange={(e) =>
              setDynamicCondition(
                e.target.value as CalculatorInputs["dynamicCondition"]
              )
            }
          >
            <option value="stationaryCrane">Stationary crane</option>
            <option value="smoothSurface">Transporting — smooth surface</option>
            <option value="unevenSurface">Transporting — uneven surface</option>
          </select>
        </Field>

        <Field label="Rigging type">
          <select
            className={selectClass}
            value={riggingType}
            onChange={(e) =>
              setRiggingType(e.target.value as CalculatorInputs["riggingType"])
            }
          >
            <option value="cable">Cable</option>
            <option value="chain">Chain (not recommended)</option>
          </select>
        </Field>

        <Field label="Available edge distance (in, optional)">
          <input
            type="number"
            className={inputClass}
            value={availableEdgeDistanceIn ?? ""}
            min={0}
            placeholder="not limited"
            onChange={(e) =>
              setAvailableEdgeDistanceIn(
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
          />
        </Field>

        <div className="rounded-md bg-lp-navy/5 p-4 text-sm">
          <p className="text-black/60">Required capacity per anchor</p>
          <p className="text-xl font-semibold text-lp-navy-dark">
            {Math.round(requiredLoadPerAnchor).toLocaleString()} lbs
          </p>
        </div>
      </form>

      <div className="flex flex-col gap-4">
        {matches.length === 0 ? (
          <div className="rounded-lg border border-black/10 bg-white p-6 text-sm text-black/60">
            No anchors in the catalog currently meet these requirements. Try
            reducing the number of anchors, using a shallower rigging angle,
            or check back once more parts are added to the catalog.
          </div>
        ) : (
          matches.map((match) => (
            <Link
              key={match.anchor.id}
              href={`/products/${match.anchor.slug}`}
              className="flex flex-col gap-2 rounded-lg border border-black/10 bg-white p-5 hover:border-lp-navy/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-lp-red">
                  {match.anchor.family?.title}
                </p>
                <p className="font-semibold text-lp-navy-dark">
                  {match.anchor.title}
                </p>
                <p className="font-mono text-xs text-black/50">
                  {match.anchor.partNumber}
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-black/50">SWL (tension)</p>
                  <p className="font-semibold">
                    {match.matchingRow.swlTensionLbs.toLocaleString()} lbs
                  </p>
                </div>
                <div>
                  <p className="text-black/50">Min. edge dist.</p>
                  <p className="font-semibold">
                    {match.matchingRow.edgeDistanceTensionIn ?? "—"}
                    {match.matchingRow.edgeDistanceTensionIn ? '"' : ""}
                  </p>
                </div>
                <div>
                  <p className="text-black/50">Utilization</p>
                  <p className="font-semibold">
                    {Math.round(match.utilization * 100)}%
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

const inputClass =
  "rounded-md border border-black/15 px-3 py-2 text-sm focus:border-lp-navy focus:outline-none";
const selectClass = inputClass + " bg-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black/60">{label}</span>
      {children}
    </label>
  );
}
