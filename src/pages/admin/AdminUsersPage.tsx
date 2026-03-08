import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import { Users, Shield } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole extends Profile {
  role?: AppRole;
}

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!profiles) {
      setLoading(false);
      return;
    }

    // Get roles for each user
    const enriched: UserWithRole[] = [];
    for (const p of profiles) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", p.user_id)
        .limit(1)
        .single();
      enriched.push({ ...p, role: roleData?.role });
    }
    setUsers(enriched);
    setLoading(false);
  };

  const addRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.rpc("admin_set_user_role", {
      _target_user_id: userId,
      _new_role: role,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Role '${role}' added` });
    fetchUsers();
  };

  if (loading) return <PageSkeleton rows={5} />;

  const ROLE_COLORS: Record<AppRole, string> = {
    seeker: "bg-shore/20 text-shore",
    volunteer: "bg-fern/20 text-fern",
    admin: "bg-dusk/20 text-dusk",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-forest" />
        <h1 className="font-heading text-2xl font-bold text-bark">Users</h1>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-driftwood">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-driftwood uppercase tracking-wide">
                <th className="pb-2 pr-4">Alias</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Language</th>
                <th className="pb-2 pr-4">Onboarded</th>
                <th className="pb-2 pr-4">Joined</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-mist/10">
                  <td className="py-3 pr-4 text-bark font-medium">{u.alias}</td>
                  <td className="py-3 pr-4">
                    {u.role && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-echo-pill ${ROLE_COLORS[u.role]}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-driftwood">{u.language.toUpperCase()}</td>
                  <td className="py-3 pr-4 text-driftwood">{u.onboarding_complete ? "✓" : "—"}</td>
                  <td className="py-3 pr-4 text-driftwood">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {u.role !== "volunteer" && (
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => addRole(u.user_id, "volunteer")}>
                          <Shield className="h-3 w-3 mr-1" /> +Volunteer
                        </Button>
                      )}
                      {u.role !== "admin" && (
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => addRole(u.user_id, "admin")}>
                          <Shield className="h-3 w-3 mr-1" /> +Admin
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
