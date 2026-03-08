import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

export const journalKeys = {
  all: (userId: string) => ["journal", userId] as const,
  filtered: (userId: string, filter: string) => ["journal", userId, filter] as const,
  detail: (entryId: string) => ["journal-entry", entryId] as const,
};

export function useJournalEntries(userId: string | undefined, filter: "all" | "milestones" = "all") {
  return useQuery({
    queryKey: journalKeys.filtered(userId ?? "", filter),
    enabled: !!userId,
    queryFn: async () => {
      let q = supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (filter === "milestones") q = q.eq("is_milestone", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as JournalEntry[];
    },
  });
}

export function useJournalEntry(entryId: string | undefined) {
  return useQuery({
    queryKey: journalKeys.detail(entryId ?? ""),
    enabled: !!entryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", entryId!)
        .single();
      if (error) throw error;
      return data as JournalEntry;
    },
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database["public"]["Tables"]["journal_entries"]["Insert"]) => {
      const { data, error } = await supabase.from("journal_entries").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}

export function useUpdateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Database["public"]["Tables"]["journal_entries"]["Update"] & { id: string }) => {
      const { data, error } = await supabase.from("journal_entries").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      qc.setQueryData(journalKeys.detail(data.id), data);
    },
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}
