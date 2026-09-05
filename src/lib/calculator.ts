import type {
  AnchorListItem,
  CalculatorSettings,
  CapacityRow,
} from "./types";

export interface CalculatorInputs {
  elementTypeSlug?: string;
  thicknessIn: number;
  concreteStrengthPsi?: number;
  totalWeightLbs: number;
  anchorsTakingLoad: number;
  spreadAngleDeg: number;
  dynamicCondition: "stationaryCrane" | "smoothSurface" | "unevenSurface";
  riggingType: "cable" | "chain";
  availableEdgeDistanceIn?: number;
}

export interface AnchorMatch {
  anchor: AnchorListItem;
  matchingRow: CapacityRow;
  requiredLoadPerAnchorLbs: number;
  utilization: number; // requiredLoad / SWL, lower is more conservative
}

/**
 * Picks the sling-angle load factor for a given spread angle. Falls back to
 * 1.0 (no increase) when settings aren't loaded, and to the steepest
 * (highest-factor) row at or below the requested angle otherwise — i.e. we
 * never *underestimate* the load.
 */
export function getSlingAngleFactor(
  spreadAngleDeg: number,
  settings?: CalculatorSettings
): number {
  const rows = settings?.slingAngleLoadFactors;
  if (!rows || rows.length === 0) return 1;

  const exact = rows.find((r) => r.spreadAngleDeg === spreadAngleDeg);
  if (exact) return exact.loadFactor;

  // Otherwise pick the closest row with spreadAngleDeg >= requested (steeper
  // angle = safer / more conservative multiplier), else the max available.
  const sorted = [...rows].sort(
    (a, b) => (a.spreadAngleDeg ?? 0) - (b.spreadAngleDeg ?? 0)
  );
  const safer = sorted.find((r) => (r.spreadAngleDeg ?? 0) >= spreadAngleDeg);
  return (safer ?? sorted[sorted.length - 1]).loadFactor;
}

export function getDynamicLoadFactor(
  condition: CalculatorInputs["dynamicCondition"],
  riggingType: CalculatorInputs["riggingType"],
  settings?: CalculatorSettings
): number {
  const row = settings?.dynamicLoadFactors?.find(
    (r) => r.condition === condition
  );
  if (!row) return riggingType === "chain" ? 1.3 : 1.0;
  return (
    (riggingType === "chain" ? row.chainRiggingFactor : row.cableRiggingFactor) ??
    1
  );
}

export function computeRequiredLoadPerAnchor(
  inputs: CalculatorInputs,
  settings?: CalculatorSettings
): number {
  const base = inputs.totalWeightLbs / Math.max(1, inputs.anchorsTakingLoad);
  const angleFactor = getSlingAngleFactor(inputs.spreadAngleDeg, settings);
  const dynamicFactor = getDynamicLoadFactor(
    inputs.dynamicCondition,
    inputs.riggingType,
    settings
  );
  return base * angleFactor * dynamicFactor;
}

/**
 * Finds the best applicable capacity row for a given concrete strength:
 * the highest published strength that is <= the actual strength (never
 * assume a higher, unpublished strength gives you more capacity). If no
 * strength is given, or the table doesn't vary by strength, use the row(s)
 * with no concreteStrengthPsi set — or, failing that, the lowest published
 * strength (most conservative).
 */
export function pickCapacityRow(
  rows: CapacityRow[],
  concreteStrengthPsi?: number
): CapacityRow | undefined {
  const withoutPsi = rows.filter((r) => r.concreteStrengthPsi === undefined);
  if (withoutPsi.length > 0) {
    return withoutPsi.sort(
      (a, b) => (b.swlTensionLbs ?? 0) - (a.swlTensionLbs ?? 0)
    )[0];
  }

  if (concreteStrengthPsi === undefined) {
    // Conservative: use the lowest published strength.
    return [...rows].sort(
      (a, b) => (a.concreteStrengthPsi ?? 0) - (b.concreteStrengthPsi ?? 0)
    )[0];
  }

  const applicable = rows.filter(
    (r) => (r.concreteStrengthPsi ?? Infinity) <= concreteStrengthPsi
  );
  if (applicable.length === 0) return undefined;
  return applicable.sort(
    (a, b) => (b.concreteStrengthPsi ?? 0) - (a.concreteStrengthPsi ?? 0)
  )[0];
}

export function findMatchingAnchors(
  anchors: AnchorListItem[],
  inputs: CalculatorInputs,
  settings?: CalculatorSettings
): AnchorMatch[] {
  const requiredLoadPerAnchorLbs = computeRequiredLoadPerAnchor(
    inputs,
    settings
  );

  const matches: AnchorMatch[] = [];

  for (const anchor of anchors) {
    if (
      inputs.elementTypeSlug &&
      !anchor.elementTypes?.some((e) => e.slug === inputs.elementTypeSlug)
    ) {
      continue;
    }

    const rowsForThickness = anchor.capacityTable.filter(
      (r) =>
        r.slabMinThicknessIn === undefined ||
        r.slabMinThicknessIn <= inputs.thicknessIn
    );
    if (rowsForThickness.length === 0) continue;

    const row = pickCapacityRow(rowsForThickness, inputs.concreteStrengthPsi);
    if (!row) continue;

    if (row.swlTensionLbs < requiredLoadPerAnchorLbs) continue;

    if (
      inputs.availableEdgeDistanceIn !== undefined &&
      row.edgeDistanceTensionIn !== undefined &&
      row.edgeDistanceTensionIn > inputs.availableEdgeDistanceIn
    ) {
      continue;
    }

    matches.push({
      anchor,
      matchingRow: row,
      requiredLoadPerAnchorLbs,
      utilization: requiredLoadPerAnchorLbs / row.swlTensionLbs,
    });
  }

  // Most conservative / best-fit first: highest utilization (closest to its
  // rated capacity without exceeding it) surfaces first, so we're not
  // recommending an oversized anchor when a smaller one comfortably works —
  // but every match already satisfies the SWL requirement above.
  return matches.sort((a, b) => b.utilization - a.utilization);
}
