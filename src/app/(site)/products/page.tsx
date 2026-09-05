import Link from "next/link";
import Image from "next/image";
import { getAllAnchors } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const revalidate = 60;

export default async function ProductsPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-lg border border-lp-red/30 bg-lp-red/5 p-6">
        <h1 className="text-lg font-semibold text-lp-red">
          Connect Supabase to see the catalog
        </h1>
        <p className="mt-2 max-w-xl text-sm text-black/70">
          Add your Supabase URL and anon key to <code>.env.local</code>, then
          add Lifting Anchor entries at <code>/admin</code>. See README.md.
        </p>
      </div>
    );
  }

  const anchors = await getAllAnchors();

  const byFamily = new Map<string, typeof anchors>();
  for (const anchor of anchors) {
    const key = anchor.family?.title ?? "Uncategorized";
    if (!byFamily.has(key)) byFamily.set(key, []);
    byFamily.get(key)!.push(anchor);
  }

  if (anchors.length === 0) {
    return (
      <div className="rounded-lg border border-black/10 bg-white p-6">
        <h1 className="text-lg font-semibold text-lp-navy-dark">
          No anchors yet
        </h1>
        <p className="mt-2 max-w-xl text-sm text-black/60">
          Your Supabase project is connected, but no lifting anchors exist
          yet. Add them at{" "}
          <Link href="/admin/lifting-anchors" className="underline">
            /admin/lifting-anchors
          </Link>
          , or run <code>npm run seed</code> to import the sample parts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold text-lp-navy-dark">
        Anchor Catalog
      </h1>
      {Array.from(byFamily.entries()).map(([familyTitle, items]) => (
        <section key={familyTitle} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-lp-navy-dark">
            {familyTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((anchor) => (
              <Link
                key={anchor.id}
                href={`/products/${anchor.slug}`}
                className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-4 hover:border-lp-navy/30"
              >
                {anchor.imageUrl ? (
                  <Image
                    src={anchor.imageUrl}
                    alt={anchor.title}
                    width={300}
                    height={220}
                    className="h-32 w-full rounded object-contain bg-black/[.03]"
                  />
                ) : (
                  <div className="h-32 w-full rounded bg-black/[.03]" />
                )}
                <div>
                  <p className="font-semibold text-lp-navy-dark">
                    {anchor.title}
                  </p>
                  <p className="text-xs text-black/50">{anchor.partNumber}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
