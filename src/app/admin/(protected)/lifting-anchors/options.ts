import { createClient } from "@/lib/supabase/server";

export interface OptionRef {
  id: string;
  label: string;
}

export async function getLiftingAnchorFormOptions() {
  const supabase = await createClient();

  const [brands, families, elementTypes, liftingEyes, recessSystems, reductionTables] =
    await Promise.all([
      supabase.from("brands").select("id, title").order("title"),
      supabase.from("anchor_families").select("id, title").order("title"),
      supabase.from("element_types").select("id, title").order("title"),
      supabase.from("lifting_eyes").select("id, title").order("title"),
      supabase.from("recess_systems").select("id, title").order("title"),
      supabase.from("load_reduction_tables").select("id, title").order("title"),
    ]);

  const toOptions = (rows: { id: string; title: string }[] | null): OptionRef[] =>
    (rows ?? []).map((r) => ({ id: r.id, label: r.title }));

  return {
    brands: toOptions(brands.data),
    families: toOptions(families.data),
    elementTypes: toOptions(elementTypes.data),
    liftingEyes: toOptions(liftingEyes.data),
    recessSystems: toOptions(recessSystems.data),
    reductionTables: toOptions(reductionTables.data),
  };
}
