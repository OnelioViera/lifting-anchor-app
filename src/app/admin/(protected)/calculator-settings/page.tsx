import { createClient } from "@/lib/supabase/server";
import type { CalculatorSettingsInput } from "./actions";
import CalculatorSettingsForm from "./CalculatorSettingsForm";

export default async function CalculatorSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("calculator_settings")
    .select("sling_angle_load_factors, dynamic_load_factors, notes")
    .eq("id", true)
    .maybeSingle();

  const initial: CalculatorSettingsInput = {
    sling_angle_load_factors: data?.sling_angle_load_factors ?? [],
    dynamic_load_factors: data?.dynamic_load_factors ?? [],
    notes: data?.notes ?? null,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-lp-navy-dark">
          Calculator Settings
        </h1>
        <p className="mt-1 text-sm text-black/60">
          Global sling-angle and dynamic/shock load factors applied by the
          Anchor Calculator — one shared table for the whole team.
        </p>
      </div>
      <CalculatorSettingsForm initial={initial} />
    </div>
  );
}
