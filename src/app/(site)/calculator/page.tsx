import {
  getAllAnchors,
  getCalculatorSettings,
  getElementTypeOptions,
} from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import CalculatorClient from "@/components/CalculatorClient";

export const revalidate = 60;

export default async function CalculatorPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-lg border border-lp-red/30 bg-lp-red/5 p-6">
        <h1 className="text-lg font-semibold text-lp-red">
          Connect Supabase to use the calculator
        </h1>
        <p className="mt-2 max-w-xl text-sm text-black/70">
          The calculator matches anchors from your Supabase catalog against
          the load and edge-distance requirements you enter. Add your
          Supabase URL and anon key to <code>.env.local</code> first — see
          README.md.
        </p>
      </div>
    );
  }

  const [anchors, elementTypes, settings] = await Promise.all([
    getAllAnchors(),
    getElementTypeOptions(),
    getCalculatorSettings(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-lp-navy-dark">
          Anchor Calculator
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-black/60">
          Enter the element and rigging details below. Results show anchors
          whose published Safe Working Load and minimum edge distance are met
          for the load applied to each anchor — inflated for rigging angle and
          dynamic/shock factors per the ALP Supply safety guidelines.
        </p>
      </div>

      <CalculatorClient
        anchors={anchors}
        elementTypes={elementTypes}
        settings={settings ?? undefined}
      />
    </div>
  );
}
