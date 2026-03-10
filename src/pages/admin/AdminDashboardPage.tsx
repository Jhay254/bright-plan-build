import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import QueryError from "@/components/ui/query-error";
import { Helmet } from "react-helmet-async";
import { LayoutDashboard, Users, UserCheck, MessageSquare, AlertTriangle, Clock, Activity } from "lucide-react";
import { fetchCrisisFlags, type CrisisFlag } from "@/lib/crisis-flags";
import type { Database } from "@/integrations/supabase/types";

type Session = Database["public"]["Tables"]["cocoon_sessions"]["Row"];
type VolunteerProfile = Database["public"]["Tables"]["volunteer_profiles"]["Row"];

interface ActivityItem {
  id: string;
  type: "session" | "volunteer" | "crisis";
  title: string;
  subtitle: string;
  timestamp: string;
  icon: typeof MessageSquare;
  color: string;
  link: string;
}

interface Stats {
  active_sessions: number;
  total_sessions: number;
  total_seekers: number;
  approved_volunteers: number;
  pending_approvals: number;
  unresolved_crisis: number;
}

function useActivityFeed(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "activity-feed"],
    enabled,
    queryFn: async () => {
      const [sessionsRes, volunteersRes, crisisFlags, profilesRes] = await Promise.all([
        supabase
          .from("cocoon_sessions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("volunteer_profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        fetchCrisisFlags(false).then((flags) => flags.slice(0, 10)),
        supabase.from("profiles").select("user_id, alias"),
      ]);

      const aliasMap = new Map<string, string>();
      for (const p of profilesRes.data || []) {
        aliasMap.set(p.user_id, p.alias);
      }

      const items: ActivityItem[] = [];

      for (const s of (sessionsRes.data || []) as Session[]) {
        const seekerAlias = aliasMap.get(s.seeker_id) || "Unknown";
        items.push({
          id: `session-${s.id}`,
          type: "session",
          title: s.topic.length > 50 ? s.topic.slice(0, 50) + "…" : s.topic,
          subtitle: `${seekerAlias} · ${s.status.replace("_", " ")} · ${s.urgency}`,
          timestamp: s.created_at,
          icon: MessageSquare,
          color: s.urgency === "crisis" || s.urgency === "high" ? "text-ember" : "text-forest",
          link: "/admin/sessions",
        });
      }

      for (const v of (volunteersRes.data || []) as VolunteerProfile[]) {
        const alias = aliasMap.get(v.user_id) || "Unknown";
        items.push({
          id: `volunteer-${v.id}`,
          type: "volunteer",
          title: `${alias} signed up as volunteer`,
          subtitle: v.is_approved
            ? "Approved"
            : v.rejection_reason
            ? "Rejected"
            : "Pending review",
          timestamp: v.created_at,
          icon: UserCheck,
          color: v.is_approved ? "text-fern" : v.rejection_reason ? "text-destructive" : "text-sunlight",
          link: "/admin/volunteers",
        });
      }

      for (const f of crisisFlags as CrisisFlag[]) {
        items.push({
          id: `crisis-${f.id}`,
          type: "crisis",
          title: f.resolved ? "Crisis flag resolved" : "Crisis flag raised",
          subtitle: f.resolved ? `Resolved · ${f.notes?.slice(0, 40) || "No notes"}` : "Unresolved — needs attention",
          timestamp: f.flagged_at,
          icon: AlertTriangle,
          color: f.resolved ? "text-fern" : "text-ember",
          link: "/admin/crisis",
        });
      }

      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return items.slice(0, 15);
    },
    staleTime: 30_000,
  });
}

function formatRelativeTime(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TYPE_BADGE: Record<ActivityItem["type"], { label: string; className: string }> = {
  session: { label: "Session", className: "bg-forest/10 text-forest" },
  volunteer: { label: "Volunteer", className: "bg-dusk/10 text-dusk" },
  crisis: { label: "Crisis", className: "bg-ember/10 text-ember" },
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  // Realtime: auto-refresh activity feed & stats on changes
  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cocoon_sessions" },
        () => {
          qc.invalidateQueries({ queryKey: ["admin", "activity-feed"] });
          qc.invalidateQueries({ queryKey: ["admin", "stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "volunteer_profiles" },
        () => {
          qc.invalidateQueries({ queryKey: ["admin", "activity-feed"] });
          qc.invalidateQueries({ queryKey: ["admin", "stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_stats");
      if (error) throw error;
      return data as unknown as Stats;
    },
    staleTime: 30_000,
  });

  const { data: activity = [], isLoading: activityLoading } = useActivityFeed();

  const statsError = !statsLoading && !stats;

  if (statsLoading) return <PageSkeleton rows={3} />;
  if (statsError) return <QueryError message="Failed to load dashboard stats." onRetry={() => qc.invalidateQueries({ queryKey: ["admin", "stats"] })} />;

  const cards = [
    { label: "Active Sessions", value: stats?.active_sessions ?? 0, icon: MessageSquare, color: "text-forest", link: "/admin/sessions" },
    { label: "Total Sessions", value: stats?.total_sessions ?? 0, icon: Clock, color: "text-driftwood", link: "/admin/sessions" },
    { label: "Registered Seekers", value: stats?.total_seekers ?? 0, icon: Users, color: "text-shore", link: "/admin/users" },
    { label: "Approved Volunteers", value: stats?.approved_volunteers ?? 0, icon: UserCheck, color: "text-fern", link: "/admin/volunteers" },
    { label: "Pending Approvals", value: stats?.pending_approvals ?? 0, icon: UserCheck, color: "text-sunlight", link: "/admin/volunteers" },
    { label: "Unresolved Crisis", value: stats?.unresolved_crisis ?? 0, icon: AlertTriangle, color: "text-ember", link: "/admin/crisis" },
  ];

  return (
    <>
      <Helmet><title>Admin Dashboard — Echo</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="h-6 w-6 text-forest" />
          <h1 className="font-heading text-2xl font-bold text-bark">Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.link)}
              className="bg-card border border-border rounded-echo-lg p-5 text-left hover:border-fern transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-3xl font-bold text-bark font-heading">{card.value}</p>
              <p className="text-sm text-driftwood mt-1">{card.label}</p>
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="flex items-center gap-3 mb-5">
          <Activity className="h-5 w-5 text-driftwood" />
          <h2 className="font-heading text-lg font-semibold text-bark">Recent Activity</h2>
        </div>

        {activityLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-echo-md" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="bg-dawn rounded-echo-lg p-8 text-center">
            <p className="text-sm text-driftwood">No recent activity yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activity.map((item) => {
              const badge = TYPE_BADGE[item.type];
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.link)}
                  className="w-full flex items-start gap-3 bg-card border border-border rounded-echo-md px-4 py-3 text-left hover:border-fern/50 transition-colors group"
                >
                  <item.icon className={`h-4 w-4 mt-0.5 shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-bark truncate">{item.title}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-echo-pill shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-driftwood truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-[11px] text-driftwood shrink-0 mt-0.5 opacity-70 group-hover:opacity-100">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboardPage;
