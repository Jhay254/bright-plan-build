import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import {
  fetchCrisisFlags,
  resolveCrisisFlag,
  type CrisisFlag,
} from "@/lib/crisis-flags";

interface FlagWithContext extends CrisisFlag {
  message_content?: string;
  session_topic?: string;
  seeker_alias?: string;
}

const AdminCrisisPage = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"unresolved" | "all">("unresolved");

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ["admin", "crisis-flags", filter],
    enabled: role === "admin",
    queryFn: async () => {
      const rawFlags = await fetchCrisisFlags(filter === "unresolved");
      if (rawFlags.length === 0) return [];

      // Batch-fetch all related data instead of N+1
      const messageIds = rawFlags.map((f) => f.message_id);
      const sessionIds = [...new Set(rawFlags.map((f) => f.session_id))];

      const [messagesRes, sessionsRes] = await Promise.all([
        supabase
          .from("session_messages")
          .select("id, content")
          .in("id", messageIds),
        supabase
          .from("cocoon_sessions")
          .select("id, topic, seeker_id")
          .in("id", sessionIds),
      ]);

      const msgMap = new Map<string, string>();
      for (const m of messagesRes.data || []) {
        msgMap.set(m.id, m.content);
      }

      const sessMap = new Map<string, { topic: string; seeker_id: string }>();
      const seekerIds: string[] = [];
      for (const s of sessionsRes.data || []) {
        sessMap.set(s.id, { topic: s.topic, seeker_id: s.seeker_id });
        seekerIds.push(s.seeker_id);
      }

      // Batch-fetch seeker aliases
      const aliasMap = new Map<string, string>();
      if (seekerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, alias")
          .in("user_id", [...new Set(seekerIds)]);
        for (const p of profiles || []) {
          aliasMap.set(p.user_id, p.alias);
        }
      }

      return rawFlags.map((flag): FlagWithContext => {
        const sess = sessMap.get(flag.session_id);
        return {
          ...flag,
          message_content: msgMap.get(flag.message_id),
          session_topic: sess?.topic,
          seeker_alias: sess ? aliasMap.get(sess.seeker_id) : undefined,
        };
      });
    },
    staleTime: 10_000,
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ flagId, notes }: { flagId: string; notes: string }) => {
      await resolveCrisisFlag(flagId, user!.id, notes);
    },
    onSuccess: () => {
      toast({ title: "Flag resolved" });
      qc.invalidateQueries({ queryKey: ["admin", "crisis-flags"] });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  if (role !== "admin") {
    return (
      <div className="px-6 pt-8">
        <p className="text-driftwood">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (isLoading) return <PageSkeleton rows={4} />;

  return (
    <div className="px-6 pt-8 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-ember" />
        <div>
          <h1 className="font-heading text-2xl font-bold text-bark">Crisis Oversight</h1>
          <p className="text-driftwood text-sm">Review and resolve flagged crisis messages</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "unresolved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unresolved")}
        >
          <AlertTriangle className="h-4 w-4 mr-1" /> Unresolved
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Flags
        </Button>
      </div>

      {flags.length === 0 ? (
        <div className="bg-dawn rounded-echo-lg p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-fern mx-auto mb-3" />
          <p className="font-heading font-semibold text-bark mb-1">
            {filter === "unresolved" ? "No unresolved flags" : "No flags recorded"}
          </p>
          <p className="text-xs text-driftwood">Crisis flags will appear here when detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onResolve={(id, notes) => resolveMutation.mutate({ flagId: id, notes })}
              isPending={resolveMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FlagCard = ({
  flag,
  onResolve,
  isPending,
}: {
  flag: FlagWithContext;
  onResolve: (id: string, notes: string) => void;
  isPending: boolean;
}) => {
  const [notes, setNotes] = useState("");
  const [showResolve, setShowResolve] = useState(false);

  return (
    <div
      className={`rounded-echo-md border p-4 ${
        flag.resolved ? "bg-card border-border opacity-70" : "bg-ember/5 border-ember/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {flag.resolved ? (
            <CheckCircle2 className="h-4 w-4 text-fern shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-ember shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-bark">
              {flag.session_topic || "Unknown session"}
            </p>
            <p className="text-xs text-driftwood">
              Seeker: {flag.seeker_alias || "Unknown"} · {new Date(flag.flagged_at).toLocaleString()}
            </p>
          </div>
        </div>
        {flag.resolved && (
          <span className="text-xs bg-fern/10 text-fern px-2 py-0.5 rounded-echo-pill">Resolved</span>
        )}
      </div>

      <div className="bg-background rounded-echo-sm p-3 mb-3 border border-border">
        <p className="text-xs text-driftwood mb-1 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Flagged message:
        </p>
        <p className="text-sm text-bark">{flag.message_content || "Message not accessible"}</p>
      </div>

      {flag.resolved && flag.notes && (
        <p className="text-xs text-driftwood italic">Note: {flag.notes}</p>
      )}

      {!flag.resolved && (
        <>
          {showResolve ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Resolution notes (e.g. 'Referred to crisis line, seeker confirmed safe')"
                className="w-full text-sm border border-border rounded-echo-md px-3 py-2 bg-background text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onResolve(flag.id, notes)} disabled={isPending}>
                  Confirm Resolved
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowResolve(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowResolve(true)}>
              Resolve Flag
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCrisisPage;
