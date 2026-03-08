import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJournalEntries } from "@/hooks/use-journal";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Flag } from "lucide-react";
import { getMoodOption } from "@/lib/journal";
import { PageSkeleton } from "@/components/ui/skeleton-card";
import QueryError from "@/components/ui/query-error";
import { Helmet } from "react-helmet-async";
import HealingTimeline from "@/components/journal/HealingTimeline";

const JournalPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "milestones">("all");
  const { data: entries = [], isLoading } = useJournalEntries(user?.id, filter);

  // Group entries by date
  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const date = new Date(entry.created_at).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    (acc[date] ??= []).push(entry);
    return acc;
  }, {});

  const milestoneCount = entries.filter((e) => e.is_milestone).length;

  if (isLoading) return <PageSkeleton rows={4} />;

  return (
    <>
      <Helmet>
        <title>Healing Journal — Echo</title>
        <meta name="description" content="Private reflections on your healing journey." />
      </Helmet>
      <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-journal text-2xl font-semibold text-bark">Healing Journal</h1>
          <p className="text-driftwood text-sm">Private reflections on your journey</p>
        </div>
        <Button variant="default" size="sm" onClick={() => navigate("/app/journal/new")}>
          <Plus className="h-4 w-4 mr-1" /> New Entry
        </Button>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-4 my-5 text-xs text-driftwood">
        <span>{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Flag className="h-3 w-3 text-dusk" /> {milestoneCount} {milestoneCount === 1 ? "milestone" : "milestones"}
        </span>
      </div>

      {/* Healing Timeline */}
      <HealingTimeline entries={entries} />

      {/* Filter */}
      <div className="flex gap-2 mb-6" role="tablist" aria-label="Journal filter">
        {(["all", "milestones"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
            className={`px-4 py-1.5 rounded-echo-pill text-sm font-medium border-2 transition-all capitalize ${
              filter === f
                ? "border-dusk bg-dusk/10 text-dusk"
                : "border-stone text-driftwood hover:border-dusk/50"
            }`}
          >
            {f === "all" ? "All Entries" : "Milestones"}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="bg-sand rounded-echo-lg p-8 text-center border border-stone">
          <BookOpen className="h-10 w-10 text-dusk mx-auto mb-3" />
          <p className="font-journal font-semibold text-bark mb-1">Your journal is empty</p>
          <p className="text-xs text-driftwood mb-4">Start capturing your thoughts, feelings, and milestones.</p>
          <Button variant="hero" onClick={() => navigate("/app/journal/new")}>
            Write Your First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayEntries]) => (
            <div key={date}>
              <p className="text-xs text-driftwood font-medium uppercase tracking-wide mb-2">{date}</p>
              <div className="space-y-2">
                {dayEntries.map((entry) => {
                  const mood = getMoodOption(entry.mood);
                  return (
                    <button
                      key={entry.id}
                      onClick={() => navigate(`/app/journal/${entry.id}`)}
                      className="w-full text-left bg-card rounded-echo-md p-4 border border-stone hover:border-dusk/50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        {mood && (
                          <div className={`w-9 h-9 rounded-full ${mood.color} border flex items-center justify-center text-lg shrink-0`}>
                            {mood.emoji}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-journal font-medium text-bark text-sm truncate">
                              {entry.title || "Untitled"}
                            </p>
                            {entry.is_milestone && <Flag className="h-3.5 w-3.5 text-dusk shrink-0" />}
                          </div>
                          <p className="text-xs text-driftwood mt-0.5 line-clamp-2">
                            {entry.content.slice(0, 120)}
                          </p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-echo-pill bg-sand text-dusk border border-stone">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-driftwood shrink-0">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default JournalPage;
