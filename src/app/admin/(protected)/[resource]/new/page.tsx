import { notFound } from "next/navigation";
import { getResourceConfig } from "@/lib/admin/simple-resources";
import { getRelationOptionsForConfig } from "@/lib/admin/relation-options";
import ResourceForm from "@/components/admin/ResourceForm";
import { saveResource } from "../actions";

export default async function NewResourcePage(
  props: PageProps<"/admin/[resource]/new">
) {
  const { resource } = await props.params;
  const config = getResourceConfig(resource);
  if (!config) return notFound();

  const relationOptions = await getRelationOptionsForConfig(config);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-lp-navy-dark">
        New {config.label}
      </h1>
      <ResourceForm
        config={config}
        action={saveResource.bind(null, config.key, null)}
        relationOptions={relationOptions}
      />
    </div>
  );
}
