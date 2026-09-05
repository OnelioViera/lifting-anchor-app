import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listResourceConfigs } from "@/lib/admin/simple-resources";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const configs = listResourceConfigs();

  const { count: anchorCount } = await supabase
    .from("lifting_anchors")
    .select("*", { count: "exact", head: true });

  const counts = await Promise.all(
    configs.map(async (c) => {
      const { count } = await supabase
        .from(c.table)
        .select("*", { count: "exact", head: true });
      return [c.key, count ?? 0] as const;
    })
  );
  const countMap = Object.fromEntries(counts);

  const cardClass =
    "rounded-lg border border-black/10 bg-white p-5 hover:border-lp-navy/30";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-lp-navy-dark">Dashboard</h1>
        <p className="mt-1 text-sm text-black/60">
          Everything here is live — changes show up on the public catalog and
          calculator (at <code>/products</code> and <code>/calculator</code>)
          within about a minute.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/lifting-anchors" className={cardClass}>
          <p className="text-2xl font-semibold text-lp-navy-dark">
            {anchorCount ?? 0}
          </p>
          <p className="text-sm text-black/60">Lifting Anchors</p>
        </Link>

        {configs.map((c) => (
          <Link key={c.key} href={`/admin/${c.key}`} className={cardClass}>
            <p className="text-2xl font-semibold text-lp-navy-dark">
              {countMap[c.key]}
            </p>
            <p className="text-sm text-black/60">{c.labelPlural}</p>
          </Link>
        ))}

        <Link href="/admin/calculator-settings" className={cardClass}>
          <p className="text-sm font-semibold text-lp-navy-dark">
            Calculator Settings
          </p>
          <p className="mt-1 text-sm text-black/60">
            Sling-angle &amp; dynamic load factors
          </p>
        </Link>
      </div>
    </div>
  );
}
