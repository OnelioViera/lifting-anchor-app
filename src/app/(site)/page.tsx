import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const families = [
  {
    title: "Utility Lift™ Anchors",
    description:
      "Recessed wire anchors for lifting box-shaped vaults and box-base manholes from the inside of the structure.",
  },
  {
    title: "Lifting Pin™ Anchors",
    description:
      "Cast-in pin anchors (1T–20T) paired with a matching lifting eye and recess system — for pads, slabs, and heavier structures.",
  },
  {
    title: "Steel Core Lift Loops",
    description:
      "Color-coded wire rope loops for economical face lifting of panels and slabs.",
  },
  {
    title: "Coil Inserts",
    description:
      "Bolted connections for lifting and handling, including thin-slab and free-edge configurations.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-6">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-lp-navy-dark">
          Find the right lifting anchor for every precast pour.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-black/60">
          Enter the specs of a vault, box-base manhole, or pad and this tool
          searches the ALP Supply catalog for anchors that meet the required
          safe working load and edge-distance requirements — accounting for
          rigging angle and dynamic load factors.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/calculator"
            className="rounded-md bg-lp-navy px-5 py-3 text-sm font-semibold text-white hover:bg-lp-navy-dark"
          >
            Open the Anchor Calculator
          </Link>
          <Link
            href="/products"
            className="rounded-md border border-lp-navy/20 px-5 py-3 text-sm font-semibold text-lp-navy-dark hover:bg-lp-navy/5"
          >
            Browse the anchor catalog
          </Link>
        </div>
      </section>

      {!isSupabaseConfigured && (
        <section className="rounded-lg border border-lp-red/30 bg-lp-red/5 p-6">
          <h2 className="text-sm font-semibold text-lp-red">
            Supabase project not connected yet
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/70">
            This app is scaffolded but not wired up to real content yet. Once
            you create a Supabase project, run{" "}
            <code className="font-mono text-xs">supabase/schema.sql</code>,
            and add its URL + anon key to{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs">
              .env.local
            </code>
            , the catalog and calculator below will populate from content you
            add at <code className="font-mono text-xs">/admin</code>. See{" "}
            <code className="font-mono text-xs">README.md</code> for the
            step-by-step.
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {families.map((family) => (
          <div
            key={family.title}
            className="rounded-lg border border-black/10 bg-white p-6"
          >
            <h3 className="font-semibold text-lp-navy-dark">
              {family.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-black/60">
              {family.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
