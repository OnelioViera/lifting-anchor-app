import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResourceConfig } from "@/lib/admin/simple-resources";
import { getRelationOptionsForConfig } from "@/lib/admin/relation-options";
import ResourceForm from "@/components/admin/ResourceForm";
import { saveResource } from "../actions";

export default async function EditResourcePage(
  props: PageProps<"/admin/[resource]/[id]">
) {
  const { resource, id } = await props.params;
  const config = getResourceConfig(resource);
  if (!config) return notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(config.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return notFound();

  const relationOptions = await getRelationOptionsForConfig(config);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-lp-navy-dark">
        Edit {config.label}
      </h1>
      <ResourceForm
        config={config}
        action={saveResource.bind(null, config.key, id)}
        record={data as Record<string, unknown>}
        relationOptions={relationOptions}
      />
    </div>
  );
}
