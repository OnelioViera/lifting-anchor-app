import { createClient } from "@/lib/supabase/server";
import type { RelationRef, SimpleResourceConfig } from "./simple-resources";

export interface RelationOption {
  id: string;
  label: string;
}

/** Fetches { id, label } pairs for every relation field in a resource config. */
export async function getRelationOptionsForConfig(
  config: SimpleResourceConfig
): Promise<Record<string, RelationOption[]>> {
  const relationFields = config.fields.filter((f) => f.relation);
  if (relationFields.length === 0) return {};

  const supabase = await createClient();
  const entries = await Promise.all(
    relationFields.map(async (field) => {
      const relation = field.relation as RelationRef;
      const selectQuery: string = `id, ${relation.labelColumn}`;
      const { data, error } = await supabase
        .from(relation.table)
        .select(selectQuery)
        .order(relation.labelColumn, { ascending: true });

      if (error) {
        console.error(`getRelationOptionsForConfig (${relation.table}):`, error.message);
        return [field.name, [] as RelationOption[]] as const;
      }

      const options = ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
        const record = row as unknown as Record<string, unknown>;
        return {
          id: String(record.id),
          label: String(record[relation.labelColumn] ?? record.id),
        };
      });

      return [field.name, options] as const;
    })
  );

  return Object.fromEntries(entries);
}

/** Fetches { id, label } pairs for one arbitrary table/column pair. */
export async function getRelationOptions(
  relation: RelationRef
): Promise<RelationOption[]> {
  const supabase = await createClient();
  const selectQuery: string = `id, ${relation.labelColumn}`;
  const { data, error } = await supabase
    .from(relation.table)
    .select(selectQuery)
    .order(relation.labelColumn, { ascending: true });

  if (error) {
    console.error(`getRelationOptions (${relation.table}):`, error.message);
    return [];
  }

  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
    const record = row as unknown as Record<string, unknown>;
    return {
      id: String(record.id),
      label: String(record[relation.labelColumn] ?? record.id),
    };
  });
}
