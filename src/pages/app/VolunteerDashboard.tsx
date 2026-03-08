import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Calendar } from "lucide-react";
import AvailabilityScheduler from "@/components/volunteer/AvailabilityScheduler";
import TrainingChecklist from "@/components/volunteer/TrainingChecklist";
import ImpactPortfolio from "@/components/volunteer/ImpactPortfolio";
import CpdLog from "@/components/volunteer/CpdLog";
import type { Database } from "@/integrations/supabase/types";

type VolunteerProfile = Database["public"]["Tables"]["volunteer_profiles"]["Row"];
type Session = Database["public"]["Tables"]["cocoon_sessions"]["Row"];

const VolunteerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [volProfile, setVolProfile] = useState<VolunteerProfile | null>(null);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      // Get or create volunteer profile
      let { data: vp } = await supabase
        .from("volunteer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!vp) {
        // Check for pending signup data
        const pending = sessionStorage.getItem("echo_volunteer_pending");
        const parsed = pending ? JSON.parse(pending) : {};

        const { data: created } = await supabase
          .from("volunteer_profiles")
          .insert({
            user_id: user.id,
            motivation: parsed.motivation || null,
            background: parsed.background || null,
            specialisations: parsed.specialisations || [],
            languages: [profile?.language ?? "en"],
          })
          .select()
          .single();
        vp = created;
        sessionStorage.removeItem("echo_volunteer_pending");

        // Add volunteer role if not already present
        await supabase.from("user_roles").upsert({
          user_id: user.id,
          role: "volunteer" as const,
        }, { onConflict: "user_id,role" });
      }

      setVolProfile(vp);

      // Fetch active sessions
      const { data: sessions } = await supabase
        .from("cocoon_sessions")
        .select("*")
        .eq("volunteer_id", user.id)
        .in("status", ["matched", "active", "wrap_up"])
        .order("created_at", { ascending: false });
      if (sessions) setActiveSessions(sessions);

      setLoading(false);
    };
    fetch();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="px-6 pt-8">
        <div className="animate-pulse-gentle text-forest font-heading text-sm">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      <div className="mb-6">
        <p className="text-sm text-driftwood font-medium">Welcome back,</p>
        <h1 className="font-heading text-2xl font-bold text-bark">{profile?.alias ?? "Volunteer"}</h1>
      </div>

      {/* Active sessions quick view */}
      {activeSessions.length > 0 && (
        <div className="mb-6">
          <h2 className="font-heading text-sm font-semibold text-forest uppercase tracking-wide mb-2">Active Sessions</h2>
          <div className="space-y-2">
            {activeSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/app/cocoon/${s.id}`)}
                className="w-full text-left bg-dawn rounded-echo-md p-4 border border-mist hover:border-forest transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-forest" />
                    <p className="text-sm font-medium text-bark">{s.topic}</p>
                  </div>
                  <span className="text-xs text-fern capitalize">{s.status.replace("_", " ")}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick stats */}
      {volProfile && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-echo-md p-4 border border-border text-center">
            <MessageCircle className="h-5 w-5 text-forest mx-auto mb-1" />
            <p className="font-heading text-xl font-bold text-bark">{volProfile.total_sessions}</p>
            <p className="text-[10px] text-driftwood uppercase">Sessions</p>
          </div>
          <div className="bg-card rounded-echo-md p-4 border border-border text-center">
            <Clock className="h-5 w-5 text-fern mx-auto mb-1" />
            <p className="font-heading text-xl font-bold text-bark">{Number(volProfile.total_hours).toFixed(1)}</p>
            <p className="text-[10px] text-driftwood uppercase">Hours</p>
          </div>
        </div>
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="sessions" className="mt-6">
        <TabsList className="grid grid-cols-4 mb-6 h-auto bg-sand rounded-echo-md p-1">
          <TabsTrigger value="sessions" className="text-xs py-2 rounded-echo-sm data-[state=active]:bg-card data-[state=active]:text-forest">Sessions</TabsTrigger>
          <TabsTrigger value="training" className="text-xs py-2 rounded-echo-sm data-[state=active]:bg-card data-[state=active]:text-forest">Training</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs py-2 rounded-echo-sm data-[state=active]:bg-card data-[state=active]:text-forest">Schedule</TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs py-2 rounded-echo-sm data-[state=active]:bg-card data-[state=active]:text-forest">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <div>
            <h2 className="font-heading text-lg font-semibold text-bark mb-3">Available Sessions</h2>
            <p className="text-sm text-driftwood mb-4">Find seekers who need support. Go to the Cocoon tab to view and accept sessions.</p>
            <Button variant="outline" onClick={() => navigate("/app/cocoon")}>
              <Calendar className="h-4 w-4 mr-2" /> View Cocoon Sessions
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="training">
          <TrainingChecklist />
        </TabsContent>

        <TabsContent value="schedule">
          <AvailabilityScheduler />
        </TabsContent>

        <TabsContent value="portfolio">
          {volProfile && <ImpactPortfolio profile={volProfile} />}
          <div className="mt-8">
            <CpdLog />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VolunteerDashboard;
