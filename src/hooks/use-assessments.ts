import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AssessmentType } from "@/lib/assessment-questions";

interface AssessmentRow {
  id: string;
  user_id: string;
  type: string;
  answers: number[];
  total_score: number;
  created_at: string;
}

export function useAssessments(userId: string | undefined, type?: AssessmentType) {
  return useQuery<AssessmentRow[]>({
    queryKey: ["assessments", userId, type],
    enabled: !!userId,
    queryFn: async () => {
      let q = supabase
        .from("wellbeing_assessments" as any)
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: true });
      if (type) q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as AssessmentRow[];
    },
  });
}

export function useLatestAssessment(userId: string | undefined, type: AssessmentType) {
  return useQuery<AssessmentRow | null>({
    queryKey: ["assessments", "latest", userId, type],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("wellbeing_assessments" as any)
        .select("*")
        .eq("user_id", userId!)
        .eq("type", type)
        .order("created_at", { ascending: false })
        .limit(1) as any);
      if (error) throw error;
      return ((data as any)?.[0] ?? null) as AssessmentRow | null;
    },
  });
}

export function useSubmitAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user_id: string; type: AssessmentType; answers: number[]; total_score: number }) => {
      const { error } = await (supabase.from("wellbeing_assessments" as any).insert(payload) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}
