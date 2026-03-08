import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const ROLE_COLORS: Record<AppRole, string> = {
  seeker: "bg-shore/20 text-shore",
  volunteer: "bg-fern/20 text-fern",
  admin: "bg-dusk/20 text-dusk",
};

const AdminUsersPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      // Batch: fetch profiles and roles in parallel
      const [profilesRes, rolesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("user_roles")
          .select("user_id, role"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      // Build a map of user_id → highest-priority role
      const roleMap = new Map<string, AppRole>();
      const priority: Record<AppRole, number> = { admin: 1, volunteer: 2, seeker: 3 };
      for (const r of rolesRes.data || []) {
        const existing = roleMap.get(r.user_id);
        if (!existing || priority[r.role] < priority[existing]) {
          roleMap.set(r.user_id, r.role);
        }
      }

      return (profilesRes.data || []).map((p) => ({
        ...p,
        role: roleMap.get(p.user_id),
      })) as UserWithRole[];
    },
    staleTime: 30_000,
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.rpc("admin_set_user_role", {
        _target_user_id: userId,
        _new_role: role,
      });
      if (error) throw error;
    },
    onSuccess: (_, { role }) => {
      toast({ title: `Role '${role}' added` });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  if (isLoading) return <PageSkeleton rows={5} />;

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
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7"
                          disabled={addRoleMutation.isPending}
                          onClick={() => addRoleMutation.mutate({ userId: u.user_id, role: "volunteer" })}
                        >
                          <Shield className="h-3 w-3 mr-1" /> +Volunteer
                        </Button>
                      )}
                      {u.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7"
                          disabled={addRoleMutation.isPending}
                          onClick={() => addRoleMutation.mutate({ userId: u.user_id, role: "admin" })}
                        >
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
