import { useCommunityResources, type CommunityResource } from "@/hooks/use-community";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import QueryError from "@/components/ui/query-error";

const CATEGORY_LABELS: Record<string, string> = {
  crisis: "Crisis & Emergency",
  learning: "Learning & Education",
  "self-care": "Self-Care",
  community: "Community & Support",
  general: "General",
};

const CATEGORY_ORDER = ["crisis", "learning", "self-care", "community", "general"];

const ResourceBoard = () => {
  const { data: resources, isLoading, isError, refetch } = useCommunityResources();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-echo-lg" />
        ))}
      </div>
    );
  }

  if (isError) return <QueryError message="Failed to load resources." onRetry={() => refetch()} />;


  const grouped = (resources ?? []).reduce<Record<string, CommunityResource[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const sortedCategories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  if (!sortedCategories.length) {
    return <p className="text-sm text-muted-foreground">No resources available yet.</p>;
  }

  return (
    <div className="space-y-6">
      {sortedCategories.map((cat) => (
        <div key={cat}>
          <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            {CATEGORY_LABELS[cat] ?? cat}
          </h3>
          <div className="grid gap-3">
            {grouped[cat].map((r) => (
              <div
                key={r.id}
                className="bg-card rounded-echo-lg p-4 border border-border shadow-echo-1 flex items-start gap-3"
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{r.title}</p>
                  {r.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                  )}
                </div>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                    aria-label={`Visit ${r.title}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceBoard;
