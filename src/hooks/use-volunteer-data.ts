import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type VolunteerProfile = Database["public"]["Tables"]["volunteer_profiles"]["Row"];
type CpdEntry = Database["public"]["Tables"]["cpd_entries"]["Row"];

export const volunteerKeys = {
  profile: (userId: string) => ["volunteer-profile", userId] as const,
  sessions: (userId: string) => ["volunteer-sessions", userId] as const,
  training: (userId: string) => ["training-progress", userId] as const,
  availability: (userId: string) => ["availability", userId] as const,
  cpd: (userId: string) => ["cpd", userId] as const,
};

export function useVolunteerProfile(userId: string | undefined) {
  return useQuery({
    queryKey: volunteerKeys.profile(userId ?? ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteer_profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
      return data as VolunteerProfile | null;
    },
  });
}

export function useVolunteerActiveSessions(userId: string | undefined) {
  return useQuery({
    queryKey: volunteerKeys.sessions(userId ?? ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cocoon_sessions")
        .select("*")
        .eq("volunteer_id", userId!)
        .in("status", ["matched", "active", "wrap_up"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTrainingProgress(userId: string | undefined) {
  return useQuery({
    queryKey: volunteerKeys.training(userId ?? ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_progress")
        .select("module_key")
        .eq("user_id", userId!)
        .eq("completed", true);
      if (error) throw error;
      return new Set(data.map((d) => d.module_key));
    },
  });
}

export function useToggleTrainingModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, moduleKey, isCompleted }: { userId: string; moduleKey: string; isCompleted: boolean }) => {
      if (isCompleted) {
        await supabase.from("training_progress").delete().eq("user_id", userId).eq("module_key", moduleKey);
      } else {
        await supabase.from("training_progress").upsert(
          { user_id: userId, module_key: moduleKey, completed: true, completed_at: new Date().toISOString() },
          { onConflict: "user_id,module_key" }
        );
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: volunteerKeys.training(variables.userId) });
    },
  });
}

export function useAvailabilitySlots(userId: string | undefined) {
  return useQuery({
    queryKey: volunteerKeys.availability(userId ?? ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteer_availability")
        .select("*")
        .eq("user_id", userId!);
      if (error) throw error;
      const set = new Set<string>();
      data.forEach((s) => set.add(`${s.day_of_week}-${s.start_hour}`));
      return set;
    },
  });
}

export function useSaveAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, slots }: { userId: string; slots: Set<string> }) => {
      await supabase.from("volunteer_availability").delete().eq("user_id", userId);
      const rows = Array.from(slots).map((key) => {
        const [day, hour] = key.split("-").map(Number);
        return { user_id: userId, day_of_week: day, start_hour: hour, end_hour: hour + 2 };
      });
      if (rows.length > 0) {
        const { error } = await supabase.from("volunteer_availability").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: volunteerKeys.availability(variables.userId) });
    },
  });
}

export function useCpdEntries(userId: string | undefined) {
  return useQuery({
    queryKey: volunteerKeys.cpd(userId ?? ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cpd_entries")
        .select("*")
        .eq("user_id", userId!)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data as CpdEntry[];
    },
  });
}

export function useAddCpdEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database["public"]["Tables"]["cpd_entries"]["Insert"]) => {
      const { data, error } = await supabase.from("cpd_entries").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: volunteerKeys.cpd(variables.user_id) });
    },
  });
}
