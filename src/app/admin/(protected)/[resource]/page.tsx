import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResourceConfig } from "@/lib/admin/simple-resources";
import DeleteButton from "@/components/admin/DeleteButton";
import { buttonPrimaryClass } from "@/components/admin/formStyles";
import { deleteResource } from "./actions";

export default async function ResourceListPage(
  props: PageProps<"/admin/[resource]">
) {
  const { resource } = await props.params;
  const config = getResourceConfig(resource);
  if (!config) return notFound();

  const relationSelects = config.fields
    .filter((f) => f.relation)
    .map(
      (f) =>
        `${f.name}__rel:${f.relation!.table}!${f.name}(${f.relation!.labelColumn})`
    );
  const selectStr: string = ["*", ...relationSelects].join(", ");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(config.table)
    .select(selectStr)
    .order(config.orderBy, { ascending: true });

  if (error) {
    return (
      <p className="text-sm text-lp-red">
        Error loading {config.labelPlural}: {error.message}
      </p>
    );
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-lp-navy-dark">
          {config.labelPlural}
        </h1>
        <Link href={`/admin/${config.key}/new`} className={buttonPrimaryClass}>
          + New {config.label}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-lp-navy/5 text-left text-xs uppercase tracking-wide text-black/50">
            <tr>
              {config.listColumns.map((col) => (
                <th key={col.name} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={config.listColumns.length + 1}
                  className="px-4 py-6 text-center text-black/50"
                >
                  No {config.labelPlural.toLowerCase()} yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={String(row.id)} className="border-t border-black/5">
                {config.listColumns.map((col) => {
                  const field = config.fields.find((f) => f.name === col.name);
                  let display: unknown = row[col.name];
                  if (field?.relation) {
                    const rel = row[`${col.name}__rel`] as Record<
                      string,
                      unknown
                    > | null;
                    display = rel ? rel[field.relation.labelColumn] : "—";
                  }
                  if (field?.options) {
                    display =
                      field.options.find((o) => o.value === display)?.label ??
                      display;
                  }
                  return (
                    <td key={col.name} className="px-4 py-3">
                      {display !== null && display !== undefined && display !== ""
                        ? String(display)
                        : "—"}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/${config.key}/${row.id}`}
                      className="text-xs font-semibold text-lp-navy hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteResource.bind(null, config.key, String(row.id))}
                    />
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
