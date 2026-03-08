import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-gentle text-forest font-heading text-lg">Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Volunteers skip seeker onboarding — they onboard via /volunteer auth flow
  // Also skip if navigating to volunteer dashboard (role may not be claimed yet)
  const isVolunteerPath = location.pathname.startsWith("/app/volunteer");
  if (profile && !profile.onboarding_complete && role !== "volunteer" && !isVolunteerPath) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
