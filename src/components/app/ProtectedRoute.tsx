import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-gentle text-forest font-heading text-lg">Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Volunteers skip seeker onboarding — they onboard via /volunteer auth flow
  if (profile && !profile.onboarding_complete && role !== "volunteer") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
