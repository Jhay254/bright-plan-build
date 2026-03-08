import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSessions, useAvailableSessions } from "@/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Clock, CheckCircle2, Filter } from "lucide-react";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import { useTranslation } from "react-i18next";
import type { Database } from "@/integrations/supabase/types";

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

const LANGUAGE_OPTIONS = [
  { value: "", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "sw", label: "Swahili" },
  { value: "ar", label: "Arabic" },
  { value: "pt", label: "Portuguese" },
];

const CocoonPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { data: sessions = [], isLoading } = useUserSessions(user?.id);
  const { data: availableSessions = [] } = useAvailableSessions(user?.id, role === "volunteer");

  const [filterLang, setFilterLang] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const activeSessions = sessions.filter((s) => !["closed", "cancelled"].includes(s.status));
  const pastSessions = sessions.filter((s) => ["closed", "cancelled"].includes(s.status));

  const filteredAvailable = useMemo(() => {
    let result = availableSessions;
    if (filterLang) result = result.filter((s) => s.language === filterLang);
    if (filterTopic) result = result.filter((s) => s.topic.toLowerCase().includes(filterTopic.toLowerCase()));
    return result;
  }, [availableSessions, filterLang, filterTopic]);

  if (isLoading) return <PageSkeleton rows={4} />;

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

      {/* Volunteer: available sessions to accept */}
      {role === "volunteer" && availableSessions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-semibold text-forest uppercase tracking-wide">
              Sessions Needing Support
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-driftwood"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-3">
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="text-sm border border-border rounded-echo-md px-3 py-1.5 bg-card text-bark focus:border-fern focus:outline-none"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                placeholder="Filter by topic…"
                className="text-sm border border-border rounded-echo-md px-3 py-1.5 bg-card text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none flex-1 min-w-[140px]"
              />
            </div>
          )}

          {filteredAvailable.length === 0 ? (
            <p className="text-sm text-driftwood">No sessions match your filters.</p>
          ) : (
            <div className="space-y-2">
              {filteredAvailable.map((s) => (
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
          )}
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
    </div>
  );
};

export default CocoonPage;
