import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityResource {
  id: string;
  category: string;
  title: string;
  description: string | null;
  url: string | null;
  emoji: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface PeerEncouragement {
  id: string;
  user_id: string;
  content: string;
  is_visible: boolean;
  created_at: string;
}

export function useCommunityResources() {
  return useQuery({
    queryKey: ["community-resources"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("community_resources")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CommunityResource[];
    },
  });
}

export function usePeerEncouragements() {
  return useQuery({
    queryKey: ["peer-encouragements"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("peer_encouragements")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as PeerEncouragement[];
    },
  });
}

export function usePostEncouragement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, content }: { userId: string; content: string }) => {
      const { error } = await (supabase as any)
        .from("peer_encouragements")
        .insert({ user_id: userId, content: content.slice(0, 280) });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["peer-encouragements"] });
    },
  });
}
