import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Calendar, Loader2, XCircle } from "lucide-react";
import ReapplyForm from "@/components/volunteer/ReapplyForm";
import { useVolunteerProfile, useVolunteerActiveSessions } from "@/hooks/use-volunteer-data";
import { DashboardSkeleton } from "@/components/ui/skeleton-card";
import QueryError from "@/components/ui/query-error";
import AvailabilityScheduler from "@/components/volunteer/AvailabilityScheduler";
import TrainingChecklist from "@/components/volunteer/TrainingChecklist";
import ImpactPortfolio from "@/components/volunteer/ImpactPortfolio";
import CpdLog from "@/components/volunteer/CpdLog";
import { useEffect, useState } from "react";
import { useEffect, useState } from "react";

const VolunteerDashboard = () => {
  const { user, profile, role, refreshProfile: refreshAuth } = useAuth();
  const navigate = useNavigate();
  const { data: volProfile, isLoading: vpLoading, isError: vpError, refetch: refetchProfile } = useVolunteerProfile(user?.id);
  const { data: activeSessions = [], isLoading: sessionsLoading, isError: sessionsError } = useVolunteerActiveSessions(user?.id);
  const [showReapply, setShowReapply] = useState(false);

  // Auto-create volunteer profile only if user came through the volunteer auth flow
  // (indicated by having pending volunteer data with motivation in localStorage)
  useEffect(() => {
    if (!user || vpLoading || volProfile) return;

    const pending = localStorage.getItem("echo_volunteer_pending");
    if (!pending) return; // No pending data = user didn't come from volunteer auth

    let parsed: { motivation?: string; background?: string; specialisations?: string[] };
    try {
      parsed = JSON.parse(pending);
    } catch {
      localStorage.removeItem("echo_volunteer_pending");
      return;
    }

    // Only auto-create if there's actual volunteer application data
    if (!parsed.motivation) return;

    const createProfile = async () => {
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

      // Claim volunteer role via security-definer function
      await supabase.rpc("claim_volunteer_role");

      // Auto-complete seeker onboarding so volunteers aren't blocked
      if (profile && !profile.onboarding_complete) {
        await supabase
          .from("profiles")
          .update({ onboarding_complete: true })
          .eq("user_id", user.id);
      }

      refetchProfile();
      refreshAuth();
    };

    createProfile();
  }, [user, vpLoading, volProfile, profile, refetchProfile, refreshAuth]);

  // Ensure volunteer role is claimed even if profile already exists
  useEffect(() => {
    if (!user || vpLoading || !volProfile || role === "volunteer") return;

    const claimRole = async () => {
      await supabase.rpc("claim_volunteer_role");
      refreshAuth();
    };
    claimRole();
  }, [user, vpLoading, volProfile, role, refreshAuth]);

  // If user is not a volunteer and has no pending volunteer application, redirect to home
  const hasPendingVolunteerData = (() => {
    try {
      const pending = localStorage.getItem("echo_volunteer_pending");
      return pending ? !!JSON.parse(pending).motivation : false;
    } catch { return false; }
  })();

  if (!vpLoading && !volProfile && !hasPendingVolunteerData) {
    return <Navigate to="/app" replace />;
  }

  if (vpLoading || sessionsLoading) return <DashboardSkeleton />;

  // --- Approval gate ---
  if (volProfile && !volProfile.is_approved) {
    const rejected = !!volProfile.rejection_reason;

    return (
      <>
        <Helmet><title>{rejected ? "Application Denied" : "Application Under Review"} — Echo</title></Helmet>
        <div className="px-6 pt-16 pb-24 max-w-md mx-auto text-center">
          {rejected ? (
            <>
              <XCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
              <h1 className="font-heading text-2xl font-bold text-bark mb-2">Application Not Approved</h1>
              <p className="text-sm text-driftwood mb-4">
                Unfortunately your volunteer application was not approved at this time.
              </p>
              <div className="bg-muted rounded-echo-md p-4 text-left mb-6">
                <p className="text-xs text-driftwood font-medium mb-1">Reason</p>
                <p className="text-sm text-bark">{volProfile.rejection_reason}</p>
              </div>

              {showReapply ? (
                <ReapplyForm
                  userId={user!.id}
                  currentMotivation={volProfile.motivation}
                  currentBackground={volProfile.background}
                  currentSpecialisations={volProfile.specialisations}
                  onSuccess={() => {
                    setShowReapply(false);
                    refetchProfile();
                  }}
                />
              ) : (
                <Button variant="hero" className="mt-2" onClick={() => setShowReapply(true)}>
                  Update & Re-apply
                </Button>
              )}
            </>
          ) : (
            <>
              <Loader2 className="h-14 w-14 text-fern mx-auto mb-4 animate-spin" />
              <h1 className="font-heading text-2xl font-bold text-bark mb-2">Application Under Review</h1>
              <p className="text-sm text-driftwood mb-4">
                Thank you for applying to volunteer with Echo! Our team is reviewing your application and you'll be notified once a decision is made.
              </p>
              <div className="bg-mist/30 rounded-echo-md p-4 text-left">
                <p className="text-xs text-driftwood font-medium mb-1">What happens next?</p>
                <ul className="text-sm text-bark space-y-1 list-disc list-inside">
                  <li>An admin will review your motivation and background</li>
                  <li>You'll receive a notification when approved</li>
                  <li>Once approved, you can start accepting sessions</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

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
