"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResourceConfig } from "@/lib/admin/simple-resources";

function revalidatePublicPages() {
  revalidatePath("/products");
  revalidatePath("/calculator");
  revalidatePath("/products/[slug]", "page");
}

export async function saveResource(
  resourceKey: string,
  id: string | null,
  formData: FormData
) {
  const config = getResourceConfig(resourceKey);
  if (!config) throw new Error(`Unknown admin resource: ${resourceKey}`);

  const record: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (field.type === "checkbox") {
      record[field.name] = formData.get(field.name) === "on";
      continue;
    }

    const raw = formData.get(field.name);
    const value = typeof raw === "string" ? raw.trim() : "";

    if (field.type === "number") {
      record[field.name] = value === "" ? null : Number(value);
    } else if (field.type === "json") {
      if (value === "") {
        record[field.name] = [];
      } else {
        try {
          record[field.name] = JSON.parse(value);
        } catch {
          throw new Error(`"${field.label}" is not valid JSON.`);
        }
      }
    } else {
      record[field.name] = value === "" ? null : value;
    }
  }

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from(config.table).update(record).eq("id", id)
    : await supabase.from(config.table).insert(record);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/${resourceKey}`);
  revalidatePublicPages();
  redirect(`/admin/${resourceKey}`);
}

export async function deleteResource(resourceKey: string, id: string) {
  const config = getResourceConfig(resourceKey);
  if (!config) throw new Error(`Unknown admin resource: ${resourceKey}`);

  const supabase = await createClient();
  const { error } = await supabase.from(config.table).delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/${resourceKey}`);
  revalidatePublicPages();
}
