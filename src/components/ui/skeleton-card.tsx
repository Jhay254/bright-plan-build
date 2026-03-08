import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton for a full page with heading + cards */
export const PageSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="px-6 pt-8 pb-24 max-w-lg mx-auto animate-in fade-in duration-300">
    <Skeleton className="h-7 w-40 mb-2" />
    <Skeleton className="h-4 w-56 mb-6" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-echo-md" />
      ))}
    </div>
  </div>
);

/** Skeleton for a card list */
export const CardListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-echo-md" />
    ))}
  </div>
);

/** Skeleton for a stat grid */
export const StatsSkeleton = ({ cols = 2 }: { cols?: number }) => (
  <div className={`grid grid-cols-${cols} gap-3`}>
    {Array.from({ length: cols }).map((_, i) => (
      <Skeleton key={i} className="h-24 w-full rounded-echo-md" />
    ))}
  </div>
);

/** Skeleton for the dashboard page */
export const DashboardSkeleton = () => (
  <div className="px-6 pt-8 pb-24 max-w-lg mx-auto animate-in fade-in duration-300">
    <Skeleton className="h-4 w-24 mb-1" />
    <Skeleton className="h-7 w-36 mb-6" />
    <StatsSkeleton cols={2} />
    <div className="mt-6 space-y-3">
      <Skeleton className="h-10 w-full rounded-echo-md" />
      <Skeleton className="h-32 w-full rounded-echo-md" />
    </div>
  </div>
);

/** Skeleton for journal detail */
export const DetailSkeleton = () => (
  <div className="px-6 pt-8 pb-24 max-w-lg mx-auto animate-in fade-in duration-300">
    <Skeleton className="h-5 w-16 mb-6" />
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-4 w-40" />
    </div>
    <Skeleton className="h-6 w-48 mb-4" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);
