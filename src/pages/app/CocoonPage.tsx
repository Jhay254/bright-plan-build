import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Session = Database["public"]["Tables"]["cocoon_sessions"]["Row"];
type SessionStatus = Database["public"]["Enums"]["session_status"];

const STATUS_ICON: Record<SessionStatus, React.ReactNode> = {
  requested: <Clock className="h-4 w-4 text-sunlight" />,
  matched: <MessageCircle className="h-4 w-4 text-fern" />,
  active: <MessageCircle className="h-4 w-4 text-forest" />,
  wrap_up: <Clock className="h-4 w-4 text-ember" />,
  closed: <CheckCircle2 className="h-4 w-4 text-driftwood" />,
  cancelled: <CheckCircle2 className="h-4 w-4 text-care-alert" />,
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  requested: "Waiting",
  matched: "Matched",
  active: "Active",
  wrap_up: "Wrapping up",
  closed: "Ended",
  cancelled: "Cancelled",
};

const CocoonPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      // Fetch user's own sessions
      const { data } = await supabase
        .from("cocoon_sessions")
        .select("*")
        .or(`seeker_id.eq.${user.id},volunteer_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (data) setSessions(data);

      // If volunteer, also fetch available sessions to accept
      if (role === "volunteer") {
        const { data: available } = await supabase
          .from("cocoon_sessions")
          .select("*")
          .eq("status", "requested")
          .order("created_at", { ascending: true });
        if (available) setAvailableSessions(available.filter((s) => s.seeker_id !== user.id));
      }

      setLoading(false);
    };

    fetchSessions();
  }, [user, role]);

  const activeSessions = sessions.filter((s) => !["closed", "cancelled"].includes(s.status));
  const pastSessions = sessions.filter((s) => ["closed", "cancelled"].includes(s.status));

  return (
    <div className="px-6 pt-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-bark">Cocoon</h1>
          <p className="text-driftwood text-sm">Your safe conversation space</p>
        </div>
        {role === "seeker" && (
          <Button variant="default" size="sm" onClick={() => navigate("/app/cocoon/new")}>
            <Plus className="h-4 w-4 mr-1" /> New Session
          </Button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse-gentle text-forest font-heading text-sm">Loading…</div>
      ) : (
        <>
          {/* Volunteer: available sessions to accept */}
          {role === "volunteer" && availableSessions.length > 0 && (
            <div className="mb-8">
              <h2 className="font-heading text-sm font-semibold text-forest uppercase tracking-wide mb-3">
                Sessions Needing Support
              </h2>
              <div className="space-y-2">
                {availableSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/app/cocoon/${s.id}`)}
                    className="w-full text-left bg-dawn rounded-echo-md p-4 border border-mist hover:border-forest transition-colors"
                  >
                    <p className="font-medium text-bark text-sm">{s.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-echo-pill ${
                        s.urgency === "high" ? "bg-ember/20 text-ember" :
                        s.urgency === "medium" ? "bg-sunlight/20 text-bark" :
                        "bg-mist text-fern"
                      }`}>
                        {s.urgency}
                      </span>
                      <span className="text-xs text-driftwood">{s.language.toUpperCase()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active sessions */}
          {activeSessions.length > 0 && (
            <div className="mb-8">
              <h2 className="font-heading text-sm font-semibold text-bark uppercase tracking-wide mb-3">Active</h2>
              <div className="space-y-2">
                {activeSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/app/cocoon/${s.id}`)}
                    className="w-full text-left bg-card rounded-echo-md p-4 border border-border hover:border-fern transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-bark text-sm">{s.topic}</p>
                      <div className="flex items-center gap-1.5">
                        {STATUS_ICON[s.status]}
                        <span className="text-xs text-driftwood">{STATUS_LABEL[s.status]}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {activeSessions.length === 0 && role === "seeker" && (
            <div className="bg-dawn rounded-echo-lg p-8 text-center mb-8">
              <MessageCircle className="h-10 w-10 text-fern mx-auto mb-3" />
              <p className="font-heading font-semibold text-bark mb-1">No active sessions</p>
              <p className="text-xs text-driftwood mb-4">Start a Cocoon session to connect with a volunteer.</p>
              <Button variant="hero" onClick={() => navigate("/app/cocoon/new")}>
                Request a Session
              </Button>
            </div>
          )}

          {/* Past sessions */}
          {pastSessions.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-semibold text-driftwood uppercase tracking-wide mb-3">Past Sessions</h2>
              <div className="space-y-2">
                {pastSessions.slice(0, 10).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/app/cocoon/${s.id}`)}
                    className="w-full text-left bg-card rounded-echo-md p-4 border border-border opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-bark">{s.topic}</p>
                      <span className="text-xs text-driftwood">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CocoonPage;
