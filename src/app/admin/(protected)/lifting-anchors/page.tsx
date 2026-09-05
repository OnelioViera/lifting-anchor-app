import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import { buttonPrimaryClass } from "@/components/admin/formStyles";
import { deleteLiftingAnchor } from "./actions";

export default async function LiftingAnchorsListPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifting_anchors")
    .select(
      "id, title, part_number, brand:brands(title), family:anchor_families(title)"
    )
    .order("part_number", { ascending: true });

  if (error) {
    return <p className="text-sm text-lp-red">Error loading anchors: {error.message}</p>;
  }

  interface Row {
    id: string;
    title: string;
    part_number: string;
    brand: { title: string } | null;
    family: { title: string } | null;
  }
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-lp-navy-dark">
          Lifting Anchors
        </h1>
        <Link href="/admin/lifting-anchors/new" className={buttonPrimaryClass}>
          + New Lifting Anchor
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-lp-navy/5 text-left text-xs uppercase tracking-wide text-black/50">
            <tr>
              <th className="px-4 py-3">Part #</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Family</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-black/50">
                  No lifting anchors yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-mono text-xs">{row.part_number}</td>
                <td className="px-4 py-3">{row.title}</td>
                <td className="px-4 py-3">{row.family?.title ?? "—"}</td>
                <td className="px-4 py-3">{row.brand?.title ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/lifting-anchors/${row.id}`}
                      className="text-xs font-semibold text-lp-navy hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteLiftingAnchor.bind(null, row.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
