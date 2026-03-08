import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/skeleton-card";

interface CrisisFlag {
  id: string;
  session_id: string;
  message_id: string;
  flagged_at: string;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  notes: string | null;
}

interface FlagWithContext extends CrisisFlag {
  message_content?: string;
  session_topic?: string;
  seeker_alias?: string;
}

const AdminCrisisPage = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [flags, setFlags] = useState<FlagWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"unresolved" | "all">("unresolved");

  useEffect(() => {
    if (role !== "admin") return;
    fetchFlags();
  }, [role, filter]);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("crisis_flags")
        .select("*")
        .order("flagged_at", { ascending: false });

      if (filter === "unresolved") {
        query = query.eq("resolved", false);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with context
      const enriched: FlagWithContext[] = [];
      for (const flag of (data || []) as CrisisFlag[]) {
        const item: FlagWithContext = { ...flag };

        // Get message content
        const { data: msg } = await supabase
          .from("session_messages")
          .select("content")
          .eq("id", flag.message_id)
          .single();
        if (msg) item.message_content = msg.content;

        // Get session topic + seeker
        const { data: sess } = await supabase
          .from("cocoon_sessions")
          .select("topic, seeker_id")
          .eq("id", flag.session_id)
          .single();
        if (sess) {
          item.session_topic = sess.topic;
          const { data: profile } = await supabase
            .from("profiles")
            .select("alias")
            .eq("user_id", sess.seeker_id)
            .single();
          if (profile) item.seeker_alias = profile.alias;
        }

        enriched.push(item);
      }

      setFlags(enriched);
    } catch (e: any) {
      toast({ title: "Error loading flags", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resolveFlag = async (flagId: string, notes: string) => {
    try {
      const { error } = await (supabase as any)
        .from("crisis_flags")
        .update({
          resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          notes,
        })
        .eq("id", flagId);
      if (error) throw error;

      setFlags((prev) =>
        prev.map((f) =>
          f.id === flagId ? { ...f, resolved: true, resolved_at: new Date().toISOString(), notes } : f
        )
      );
      toast({ title: "Flag resolved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (role !== "admin") {
    return (
      <div className="px-6 pt-8">
        <p className="text-driftwood">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (loading) return <PageSkeleton rows={4} />;

  return (
    <div className="px-6 pt-8 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-ember" />
        <div>
          <h1 className="font-heading text-2xl font-bold text-bark">Crisis Oversight</h1>
          <p className="text-driftwood text-sm">Review and resolve flagged crisis messages</p>
        </div>
      </div>

      {/* Filter tabs */}
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
            <FlagCard key={flag.id} flag={flag} onResolve={resolveFlag} />
          ))}
        </div>
      )}
    </div>
  );
};

const FlagCard = ({
  flag,
  onResolve,
}: {
  flag: FlagWithContext;
  onResolve: (id: string, notes: string) => void;
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

      {/* Flagged message */}
      <div className="bg-background rounded-echo-sm p-3 mb-3 border border-border">
        <p className="text-xs text-driftwood mb-1 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Flagged message:
        </p>
        <p className="text-sm text-bark">{flag.message_content || "Message not accessible"}</p>
      </div>

      {/* Resolve notes */}
      {flag.resolved && flag.notes && (
        <p className="text-xs text-driftwood italic">Note: {flag.notes}</p>
      )}

      {/* Resolve action */}
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
                <Button size="sm" onClick={() => onResolve(flag.id, notes)}>
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
