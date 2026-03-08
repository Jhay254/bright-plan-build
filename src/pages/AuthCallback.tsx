import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Handles Supabase email verification redirects.
 * Supabase appends auth tokens as URL hash fragments — the AuthContext
 * picks them up via onAuthStateChange. This page waits for the session
 * to be established, then redirects into the app.
 */
const AuthCallback = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Token exchange failed or expired — send to login
      navigate("/auth", { replace: true });
      return;
    }

    // Volunteer (by role or pending application) → volunteer dashboard
    const hasPendingVolunteer = !!localStorage.getItem("echo_volunteer_pending");
    if (role === "volunteer" || hasPendingVolunteer) {
      navigate("/app/volunteer", { replace: true });
      return;
    }

    // Seeker without completed onboarding → onboarding
    if (profile && !profile.onboarding_complete) {
      navigate("/onboarding", { replace: true });
      return;
    }

    // Default → app home
    navigate("/app", { replace: true });
  }, [user, profile, role, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse-gentle text-forest font-heading text-lg">
        Verifying your email…
      </div>
    </div>
  );
};

export default AuthCallback;
