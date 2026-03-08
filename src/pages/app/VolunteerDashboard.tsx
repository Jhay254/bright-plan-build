import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Calendar } from "lucide-react";
import { useVolunteerProfile, useVolunteerActiveSessions } from "@/hooks/use-volunteer-data";
import { DashboardSkeleton } from "@/components/ui/skeleton-card";
import AvailabilityScheduler from "@/components/volunteer/AvailabilityScheduler";
import TrainingChecklist from "@/components/volunteer/TrainingChecklist";
import ImpactPortfolio from "@/components/volunteer/ImpactPortfolio";
import CpdLog from "@/components/volunteer/CpdLog";
import { useEffect } from "react";

const VolunteerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: volProfile, isLoading: vpLoading, refetch: refetchProfile } = useVolunteerProfile(user?.id);
  const { data: activeSessions = [], isLoading: sessionsLoading } = useVolunteerActiveSessions(user?.id);

  // Auto-create volunteer profile if it doesn't exist
  useEffect(() => {
    if (!user || vpLoading || volProfile) return;

    const createProfile = async () => {
      const pending = localStorage.getItem("echo_volunteer_pending");
      const parsed = pending ? JSON.parse(pending) : {};

      await supabase
        .from("volunteer_profiles")
        .insert({
          user_id: user.id,
          motivation: parsed.motivation || null,
          background: parsed.background || null,
          specialisations: parsed.specialisations || [],
          languages: [profile?.language ?? "en"],
        });

      localStorage.removeItem("echo_volunteer_pending");

      await supabase.from("user_roles").upsert(
        { user_id: user.id, role: "volunteer" as const },
        { onConflict: "user_id,role" }
      );

      // Auto-complete seeker onboarding so volunteers aren't blocked
      if (profile && !profile.onboarding_complete) {
        await supabase
          .from("profiles")
          .update({ onboarding_complete: true })
          .eq("user_id", user.id);
      }

      refetchProfile();
    };

    createProfile();
  }, [user, vpLoading, volProfile, profile, refetchProfile]);

  if (vpLoading || sessionsLoading) return <DashboardSkeleton />;

  return (
    <>
      <Helmet>
        <title>Volunteer Hub — Echo</title>
        <meta name="description" content="Your volunteer dashboard. Manage sessions, training, and availability." />
      </Helmet>
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

      {/* Tabs */}
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
    </>
  );
};

export default VolunteerDashboard;
