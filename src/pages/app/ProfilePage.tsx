import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const ProfilePage = () => {
  const { profile, role, user, signOut } = useAuth();

  return (
    <div className="px-6 pt-8">
      <h1 className="font-heading text-2xl font-bold text-bark mb-6">Profile</h1>

      <div className="bg-card rounded-echo-lg p-6 shadow-echo-1 border border-border space-y-4">
        <div>
          <p className="text-xs text-driftwood uppercase tracking-wide">Alias</p>
          <p className="font-heading font-semibold text-bark">{profile?.alias ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-driftwood uppercase tracking-wide">Role</p>
          <p className="font-medium text-fern capitalize">{role ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-driftwood uppercase tracking-wide">Account</p>
          <p className="text-sm text-bark">{user?.is_anonymous ? "Anonymous" : user?.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-driftwood uppercase tracking-wide">Language</p>
          <p className="text-sm text-bark uppercase">{profile?.language ?? "en"}</p>
        </div>
      </div>

      <Button variant="ghost" className="mt-8 text-care-alert" onClick={signOut}>
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
};

export default ProfilePage;
