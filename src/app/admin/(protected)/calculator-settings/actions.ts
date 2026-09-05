"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DynamicLoadRow, SlingAngleRow } from "@/lib/types";

export interface CalculatorSettingsInput {
  sling_angle_load_factors: SlingAngleRow[];
  dynamic_load_factors: DynamicLoadRow[];
  notes: string | null;
}

export async function saveCalculatorSettings(
  input: CalculatorSettingsInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("calculator_settings")
    .update(input)
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/admin/calculator-settings");
  revalidatePath("/calculator");
  return {};
}
