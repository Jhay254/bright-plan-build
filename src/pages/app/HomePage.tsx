import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { profile, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="px-6 pt-8">
      <div className="mb-8">
        <p className="text-sm text-driftwood font-medium">Welcome back,</p>
        <h1 className="font-heading text-2xl font-bold text-bark">
          {profile?.alias ?? "Friend"}
        </h1>
      </div>

      {role === "seeker" && (
        <div className="space-y-4">
          <div className="bg-dawn rounded-echo-lg p-6 shadow-echo-1">
            <h2 className="font-heading text-lg font-semibold text-bark mb-2">How are you feeling?</h2>
            <p className="text-sm text-driftwood mb-4">Reach out whenever you're ready. A trained volunteer is here for you.</p>
            <Button variant="hero" onClick={() => navigate("/app/cocoon")}>
              <MessageCircle className="h-4 w-4 mr-2" /> Start a Session
            </Button>
          </div>

          <div className="bg-card rounded-echo-lg p-6 shadow-echo-1 border border-border">
            <h2 className="font-heading text-lg font-semibold text-bark mb-2">Your Healing Journal</h2>
            <p className="text-sm text-driftwood mb-4">Track your journey. Reflect. Grow.</p>
            <Button variant="outline" onClick={() => navigate("/app/journal")}>
              <BookOpen className="h-4 w-4 mr-2" /> Open Journal
            </Button>
          </div>
        </div>
      )}

      {role === "volunteer" && (
        <div className="bg-dawn rounded-echo-lg p-6 shadow-echo-1">
          <h2 className="font-heading text-lg font-semibold text-bark mb-2">Volunteer Dashboard</h2>
          <p className="text-sm text-driftwood">Your upcoming sessions and impact stats will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
