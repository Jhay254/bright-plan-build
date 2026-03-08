import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import QueryError from "@/components/ui/query-error";
import { Helmet } from "react-helmet-async";
import { MessageSquare, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Session = Database["public"]["Tables"]["cocoon_sessions"]["Row"];
type SessionStatus = Database["public"]["Enums"]["session_status"];

const STATUS_COLORS: Record<SessionStatus, string> = {
  requested: "bg-sunlight/20 text-bark",
  matched: "bg-fern/20 text-fern",
  active: "bg-forest/20 text-forest",
  wrap_up: "bg-ember/20 text-ember",
  closed: "bg-stone text-driftwood",
  cancelled: "bg-care-alert/10 text-care-alert",
};

const PAGE_SIZE = 20;

const AdminSessionsPage = () => {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data: sessions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "sessions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("cocoon_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data as Session[];
    },
    staleTime: 15_000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.topic.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.urgency.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleFilterChange = (f: SessionStatus | "all") => {
    setStatusFilter(f);
    setPage(0);
  };

  if (isLoading) return <PageSkeleton rows={5} />;
  if (isError) return <QueryError onRetry={() => refetch()} />;

  const statuses: (SessionStatus | "all")[] = ["all", "requested", "matched", "active", "wrap_up", "closed", "cancelled"];

  return (
    <>
      <Helmet><title>Sessions — Admin — Echo</title></Helmet>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-6 w-6 text-forest" />
          <h1 className="font-heading text-2xl font-bold text-bark">Sessions</h1>
          <span className="text-sm text-driftwood ml-auto">{filtered.length} session{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-driftwood" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by topic, language, urgency…"
            className="pl-9"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statuses.map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => handleFilterChange(s)}>
              {s === "all" ? "All" : s.replace("_", " ")}
            </Button>
          ))}
        </div>

        {paginated.length === 0 ? (
          <p className="text-sm text-driftwood">No sessions match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-driftwood uppercase tracking-wide">
                  <th className="pb-2 pr-4">Topic</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Urgency</th>
                  <th className="pb-2 pr-4">Language</th>
                  <th className="pb-2 pr-4">Created</th>
                  <th className="pb-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => {
                  const duration = s.started_at && s.ended_at
                    ? `${Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000)} min`
                    : s.started_at ? "Ongoing" : "—";

                  return (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-mist/10">
                      <td className="py-3 pr-4 text-bark font-medium max-w-[200px] truncate">{s.topic}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-echo-pill ${STATUS_COLORS[s.status]}`}>
                          {s.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs ${s.urgency === "high" || s.urgency === "crisis" ? "text-ember font-medium" : "text-driftwood"}`}>
                          {s.urgency}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-driftwood">{s.language.toUpperCase()}</td>
                      <td className="py-3 pr-4 text-driftwood">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-driftwood flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {duration}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
            <p className="text-xs text-driftwood">
              Page {safePage + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSessionsPage;
