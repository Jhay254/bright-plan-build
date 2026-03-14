import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const REMINDER_DAYS = 14;

export function useAssessmentReminder(userId: string | undefined) {
  return useQuery({
    queryKey: ["assessment-reminder", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // cache 30 min
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - REMINDER_DAYS);

      const { data, error } = await (supabase
        .from("wellbeing_assessments" as any)
        .select("id")
        .eq("user_id", userId!)
        .gte("created_at", cutoff.toISOString())
        .limit(1) as any);

      if (error) throw error;
      // true = should show reminder (no recent assessment)
      return !data || data.length === 0;
    },
  });
}
