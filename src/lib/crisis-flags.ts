import { supabase } from "@/integrations/supabase/client";

/**
 * Typed wrapper for the crisis_flags table which is not
 * present in the auto-generated Supabase types.
 */

export interface CrisisFlag {
  id: string;
  session_id: string;
  message_id: string;
  flagged_at: string;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  notes: string | null;
}

export interface CrisisFlagInsert {
  session_id: string;
  message_id: string;
}

export interface CrisisFlagUpdate {
  resolved?: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  notes?: string | null;
}

const table = () =>
  // crisis_flags is not in generated types, so we cast once here
  (supabase as any).from("crisis_flags");

export async function fetchCrisisFlags(unresolvedOnly: boolean) {
  let query = table()
    .select("*")
    .order("flagged_at", { ascending: false });

  if (unresolvedOnly) {
    query = query.eq("resolved", false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as CrisisFlag[];
}

export async function insertCrisisFlag(flag: CrisisFlagInsert) {
  const { error } = await table().insert(flag);
  if (error) throw error;
}

export async function resolveCrisisFlag(
  flagId: string,
  resolvedBy: string,
  notes: string
) {
  const { error } = await table()
    .update({
      resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      notes,
    } satisfies CrisisFlagUpdate)
    .eq("id", flagId);
  if (error) throw error;
}
