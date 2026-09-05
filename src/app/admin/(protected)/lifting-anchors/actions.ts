"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { CapacityRow, DimensionField } from "@/lib/types";

export interface LiftingAnchorInput {
  title: string;
  part_number: string;
  slug: string;
  brand_id: string;
  family_id: string;
  size_label: string | null;
  image_url: string | null;
  datasheet_pdf_url: string | null;
  finish: string | null;
  color_code: string | null;
  weight_lbs: number | null;
  qty_per_bag: number | null;
  qty_per_crate: number | null;
  source_catalog_page: string | null;
  tonnage_rating: number | null;
  wire_diameter_in: number | null;
  bolt_diameter_in: number | null;
  number_of_struts: number | null;
  typical_element_thickness_in: number | null;
  dimensions: DimensionField[];
  capacity_table: CapacityRow[];
  safety_factor: number;
  installation_notes: string | null;
  element_type_ids: string[];
  lifting_eye_ids: string[];
  recess_system_ids: string[];
  reduction_table_ids: string[];
}

function toRecord(input: LiftingAnchorInput) {
  const {
    element_type_ids,
    lifting_eye_ids,
    recess_system_ids,
    reduction_table_ids,
    ...rest
  } = input;
  void element_type_ids;
  void lifting_eye_ids;
  void recess_system_ids;
  void reduction_table_ids;
  return rest;
}

async function syncJoinTable(
  supabase: SupabaseClient,
  table: string,
  anchorColumn: string,
  otherColumn: string,
  anchorId: string,
  otherIds: string[]
) {
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq(anchorColumn, anchorId);
  if (deleteError) throw new Error(deleteError.message);

  if (otherIds.length === 0) return;

  const rows = otherIds.map((otherId) => ({
    [anchorColumn]: anchorId,
    [otherColumn]: otherId,
  }));
  const { error: insertError } = await supabase.from(table).insert(rows);
  if (insertError) throw new Error(insertError.message);
}

function revalidatePublicPages() {
  revalidatePath("/admin/lifting-anchors");
  revalidatePath("/products");
  revalidatePath("/calculator");
  revalidatePath("/products/[slug]", "page");
}

export async function saveLiftingAnchor(
  id: string | null,
  input: LiftingAnchorInput
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient();
  const record = toRecord(input);

  let anchorId = id ?? undefined;

  if (id) {
    const { error } = await supabase
      .from("lifting_anchors")
      .update(record)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("lifting_anchors")
      .insert(record)
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "Insert failed." };
    anchorId = data.id as string;
  }

  if (!anchorId) return { error: "Missing anchor id after save." };

  try {
    await syncJoinTable(
      supabase,
      "lifting_anchor_element_types",
      "lifting_anchor_id",
      "element_type_id",
      anchorId,
      input.element_type_ids
    );
    await syncJoinTable(
      supabase,
      "lifting_anchor_lifting_eyes",
      "lifting_anchor_id",
      "lifting_eye_id",
      anchorId,
      input.lifting_eye_ids
    );
    await syncJoinTable(
      supabase,
      "lifting_anchor_recess_systems",
      "lifting_anchor_id",
      "recess_system_id",
      anchorId,
      input.recess_system_ids
    );
    await syncJoinTable(
      supabase,
      "lifting_anchor_reduction_tables",
      "lifting_anchor_id",
      "load_reduction_table_id",
      anchorId,
      input.reduction_table_ids
    );
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to save relations.",
    };
  }

  revalidatePublicPages();
  return { id: anchorId };
}

export async function deleteLiftingAnchor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lifting_anchors").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublicPages();
}
