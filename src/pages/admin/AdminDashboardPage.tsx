import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import { LayoutDashboard, Users, UserCheck, MessageSquare, AlertTriangle, Clock } from "lucide-react";

interface Stats {
  active_sessions: number;
  total_sessions: number;
  total_seekers: number;
  approved_volunteers: number;
  pending_approvals: number;
  unresolved_crisis: number;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.rpc("admin_get_stats");
      if (!error && data) setStats(data as unknown as Stats);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <PageSkeleton rows={3} />;

  const cards = [
    { label: "Active Sessions", value: stats?.active_sessions ?? 0, icon: MessageSquare, color: "text-forest", link: "/admin/sessions" },
    { label: "Total Sessions", value: stats?.total_sessions ?? 0, icon: Clock, color: "text-driftwood", link: "/admin/sessions" },
    { label: "Registered Seekers", value: stats?.total_seekers ?? 0, icon: Users, color: "text-shore", link: "/admin/users" },
    { label: "Approved Volunteers", value: stats?.approved_volunteers ?? 0, icon: UserCheck, color: "text-fern", link: "/admin/volunteers" },
    { label: "Pending Approvals", value: stats?.pending_approvals ?? 0, icon: UserCheck, color: "text-sunlight", link: "/admin/volunteers" },
    { label: "Unresolved Crisis", value: stats?.unresolved_crisis ?? 0, icon: AlertTriangle, color: "text-ember", link: "/admin/crisis" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="h-6 w-6 text-forest" />
        <h1 className="font-heading text-2xl font-bold text-bark">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
};

export default AdminDashboardPage;
