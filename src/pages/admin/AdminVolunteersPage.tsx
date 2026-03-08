import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import { Helmet } from "react-helmet-async";
import { UserCheck, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";

type VolunteerProfile = Database["public"]["Tables"]["volunteer_profiles"]["Row"];

interface VolunteerWithAlias extends VolunteerProfile {
  alias?: string;
}

const AdminVolunteersPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [rejectTarget, setRejectTarget] = useState<VolunteerWithAlias | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ["admin", "volunteers", filter],
    queryFn: async () => {
      let vQuery = supabase
        .from("volunteer_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "pending") vQuery = vQuery.eq("is_approved", false);
      else if (filter === "approved") vQuery = vQuery.eq("is_approved", true);

      const [vRes, pRes] = await Promise.all([
        vQuery,
        supabase.from("profiles").select("user_id, alias"),
      ]);

      if (vRes.error) throw vRes.error;
      if (pRes.error) throw pRes.error;

      const aliasMap = new Map<string, string>();
      for (const p of pRes.data || []) {
        aliasMap.set(p.user_id, p.alias);
      }

      return (vRes.data || []).map((v) => ({
        ...v,
        alias: aliasMap.get(v.user_id) ?? "Unknown",
      })) as VolunteerWithAlias[];
    },
    staleTime: 15_000,
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ userId, approved, reason }: { userId: string; approved: boolean; reason?: string }) => {
      const { error } = await supabase.rpc("admin_set_volunteer_approval", {
        _volunteer_user_id: userId,
        _approved: approved,
        _rejection_reason: reason ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      toast({ title: approved ? "Volunteer approved" : "Volunteer rejected" });
      qc.invalidateQueries({ queryKey: ["admin", "volunteers"] });
      setRejectTarget(null);
      setRejectionReason("");
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const handleReject = () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    approvalMutation.mutate({
      userId: rejectTarget.user_id,
      approved: false,
      reason: rejectionReason.trim(),
    });
  };

  if (isLoading) return <PageSkeleton rows={4} />;

  return (
    <>
      <Helmet><title>Volunteers — Admin — Echo</title></Helmet>
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
                      ) : (v as any).rejection_reason ? (
                        <span className="text-destructive">Rejected</span>
                      ) : (
                        <span className="text-sunlight">Pending</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!v.is_approved && (
                      <>
                        <Button
                          size="sm"
                          disabled={approvalMutation.isPending}
                          onClick={() => approvalMutation.mutate({ userId: v.user_id, approved: true })}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={approvalMutation.isPending}
                          onClick={() => { setRejectTarget(v); setRejectionReason(""); }}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {v.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={approvalMutation.isPending}
                        onClick={() => { setRejectTarget(v); setRejectionReason(""); }}
                      >
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
                {(v as any).rejection_reason && (
                  <div className="mb-2">
                    <p className="text-xs text-destructive font-medium">Rejection Reason</p>
                    <p className="text-sm text-bark">{(v as any).rejection_reason}</p>
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

      {/* Rejection reason dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) setRejectTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rejectTarget?.is_approved ? "Revoke Approval" : "Reject Volunteer"}</DialogTitle>
            <DialogDescription>
              Please provide a reason for {rejectTarget?.is_approved ? "revoking" : "rejecting"} {rejectTarget?.alias}'s application. This will be shared with the volunteer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Reason</Label>
            <textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value.slice(0, 500))}
              placeholder="e.g. Incomplete training prerequisites, insufficient experience…"
              className="w-full h-24 px-4 py-3 rounded-echo-md border-2 border-stone bg-background text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!rejectionReason.trim() || approvalMutation.isPending}
              onClick={handleReject}
            >
              {approvalMutation.isPending ? "Submitting…" : rejectTarget?.is_approved ? "Revoke" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminVolunteersPage;
