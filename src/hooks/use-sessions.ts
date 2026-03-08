import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Session = Database["public"]["Tables"]["cocoon_sessions"]["Row"];

export const sessionKeys = {
  all: ["sessions"] as const,
  mine: (userId: string) => ["sessions", "mine", userId] as const,
  available: (userId: string) => ["sessions", "available", userId] as const,
  detail: (id: string) => ["sessions", id] as const,
};

export function useUserSessions(userId: string | undefined) {
  return useQuery({
    queryKey: sessionKeys.mine(userId ?? ""),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cocoon_sessions")
        .select("*")
        .or(`seeker_id.eq.${userId},volunteer_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Session[];
    },
  });
}

export function useAvailableSessions(userId: string | undefined, isVolunteer: boolean) {
  return useQuery({
    queryKey: sessionKeys.available(userId ?? ""),
    enabled: !!userId && isVolunteer,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cocoon_sessions")
        .select("*")
        .eq("status", "requested")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as Session[]).filter((s) => s.seeker_id !== userId);
    },
  });
}

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId ?? ""),
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cocoon_sessions")
        .select("*")
        .eq("id", sessionId!)
        .single();
      if (error) throw error;
      return data as Session;
    },
  });
}

export function useSessionMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["session-messages", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_messages")
        .select("*")
        .eq("session_id", sessionId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      seeker_id: string;
      topic: string;
      urgency: "low" | "medium" | "high";
      language: string;
      preferences: string | null;
    }) => {
      const { data, error } = await supabase
        .from("cocoon_sessions")
        .insert(input)
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}
