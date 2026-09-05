import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LiftingAnchorInput } from "../actions";
import { getLiftingAnchorFormOptions } from "../options";
import LiftingAnchorForm from "../LiftingAnchorForm";

export default async function EditLiftingAnchorPage(
  props: PageProps<"/admin/lifting-anchors/[id]">
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [{ data: anchor, error }, options, joins] = await Promise.all([
    supabase.from("lifting_anchors").select("*").eq("id", id).maybeSingle(),
    getLiftingAnchorFormOptions(),
    Promise.all([
      supabase
        .from("lifting_anchor_element_types")
        .select("element_type_id")
        .eq("lifting_anchor_id", id),
      supabase
        .from("lifting_anchor_lifting_eyes")
        .select("lifting_eye_id")
        .eq("lifting_anchor_id", id),
      supabase
        .from("lifting_anchor_recess_systems")
        .select("recess_system_id")
        .eq("lifting_anchor_id", id),
      supabase
        .from("lifting_anchor_reduction_tables")
        .select("load_reduction_table_id")
        .eq("lifting_anchor_id", id),
    ]),
  ]);

  if (error || !anchor) return notFound();

  const [elementTypeJoins, liftingEyeJoins, recessSystemJoins, reductionTableJoins] =
    joins;

  const initial: Partial<LiftingAnchorInput> = {
    ...(anchor as Record<string, unknown>),
    element_type_ids: (elementTypeJoins.data ?? []).map((r) => r.element_type_id),
    lifting_eye_ids: (liftingEyeJoins.data ?? []).map((r) => r.lifting_eye_id),
    recess_system_ids: (recessSystemJoins.data ?? []).map((r) => r.recess_system_id),
    reduction_table_ids: (reductionTableJoins.data ?? []).map(
      (r) => r.load_reduction_table_id
    ),
  } as Partial<LiftingAnchorInput>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-lp-navy-dark">
        Edit Lifting Anchor
      </h1>
      <LiftingAnchorForm id={id} initial={initial} {...options} />
    </div>
  );
}
