import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sessionKeys } from "@/hooks/use-sessions";
import type { Database } from "@/integrations/supabase/types";

type Session = Database["public"]["Tables"]["cocoon_sessions"]["Row"];
type SessionStatus = Database["public"]["Enums"]["session_status"];

const STATUS_TOAST: Partial<Record<SessionStatus, { title: string; description: string }>> = {
  matched: { title: "🎉 Volunteer matched!", description: "A volunteer is ready to start your session." },
  active: { title: "💬 Session started", description: "Your Cocoon session is now active." },
  wrap_up: { title: "⏳ Wrapping up", description: "The session is being wrapped up." },
  closed: { title: "✅ Session ended", description: "Your session has been completed." },
  cancelled: { title: "❌ Session cancelled", description: "The session has been cancelled." },
};

/**
 * Hook that subscribes to session status changes and shows toasts.
 * Should be mounted once in AppShell.
 */
export function useSessionStatusToasts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("session-status-toasts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cocoon_sessions",
        },
        (payload) => {
          const newSession = payload.new as Session;
          const oldSession = payload.old as Partial<Session>;

          // Only show toast if user is a participant and status actually changed
          const isParticipant =
            newSession.seeker_id === user.id || newSession.volunteer_id === user.id;
          if (!isParticipant) return;
          if (newSession.status === oldSession.status) return;

          const toastInfo = STATUS_TOAST[newSession.status];
          if (toastInfo) {
            toast(toastInfo);
          }

          // Invalidate session queries
          qc.invalidateQueries({ queryKey: sessionKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, qc]);
}
