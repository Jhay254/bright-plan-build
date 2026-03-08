import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import { UserCheck, CheckCircle2, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type VolunteerProfile = Database["public"]["Tables"]["volunteer_profiles"]["Row"];

interface VolunteerWithAlias extends VolunteerProfile {
  alias?: string;
}

const AdminVolunteersPage = () => {
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState<VolunteerWithAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  useEffect(() => {
    fetchVolunteers();
  }, [filter]);

  const fetchVolunteers = async () => {
    setLoading(true);
    let query = supabase.from("volunteer_profiles").select("*").order("created_at", { ascending: false });

    if (filter === "pending") query = query.eq("is_approved", false);
    else if (filter === "approved") query = query.eq("is_approved", true);

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Enrich with aliases
    const enriched: VolunteerWithAlias[] = [];
    for (const v of data || []) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("alias")
        .eq("user_id", v.user_id)
        .single();
      enriched.push({ ...v, alias: profile?.alias ?? "Unknown" });
    }
    setVolunteers(enriched);
    setLoading(false);
  };

  const setApproval = async (userId: string, approved: boolean) => {
    const { error } = await supabase.rpc("admin_set_volunteer_approval", {
      _volunteer_user_id: userId,
      _approved: approved,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: approved ? "Volunteer approved" : "Volunteer rejected" });
    fetchVolunteers();
  };

  if (loading) return <PageSkeleton rows={4} />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="h-6 w-6 text-fern" />
        <h1 className="font-heading text-2xl font-bold text-bark">Volunteers</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "all"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {volunteers.length === 0 ? (
        <div className="bg-dawn rounded-echo-lg p-8 text-center">
          <p className="text-sm text-driftwood">No volunteers match this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {volunteers.map((v) => (
            <div key={v.id} className="bg-card border border-border rounded-echo-lg p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-heading font-semibold text-bark">{v.alias}</p>
                  <p className="text-xs text-driftwood">
                    Joined {new Date(v.created_at).toLocaleDateString()} ·{" "}
                    {v.is_approved ? (
                      <span className="text-fern">Approved</span>
                    ) : (
                      <span className="text-sunlight">Pending</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!v.is_approved && (
                    <Button size="sm" onClick={() => setApproval(v.user_id, true)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  )}
                  {v.is_approved && (
                    <Button size="sm" variant="outline" onClick={() => setApproval(v.user_id, false)}>
                      <XCircle className="h-4 w-4 mr-1" /> Revoke
                    </Button>
                  )}
                </div>
              </div>

              {v.motivation && (
                <div className="mb-2">
                  <p className="text-xs text-driftwood font-medium">Motivation</p>
                  <p className="text-sm text-bark">{v.motivation}</p>
                </div>
              )}
              {v.background && (
                <div className="mb-2">
                  <p className="text-xs text-driftwood font-medium">Background</p>
                  <p className="text-sm text-bark">{v.background}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-3 text-xs text-driftwood">
                <span>Sessions: {v.total_sessions}</span>
                <span>Hours: {v.total_hours}</span>
                {v.languages && <span>Languages: {v.languages.join(", ")}</span>}
                {v.specialisations && v.specialisations.length > 0 && (
                  <span>Specialisations: {v.specialisations.join(", ")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVolunteersPage;
