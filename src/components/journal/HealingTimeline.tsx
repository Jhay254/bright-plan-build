import { useMemo, useCallback, memo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { MOOD_OPTIONS } from "@/lib/journal";
import type { Database } from "@/integrations/supabase/types";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

const MOOD_SCORE: Record<string, number> = {
  joyful: 5,
  calm: 4,
  hopeful: 4,
  neutral: 3,
  anxious: 2,
  sad: 2,
  angry: 1,
  overwhelmed: 1,
};

const Y_LABELS: Record<number, string> = { 1: "😤", 2: "😰", 3: "😐", 4: "😌", 5: "😊" };
const yTickFormatter = (v: number) => Y_LABELS[v] ?? "";

interface HealingTimelineProps {
  entries: JournalEntry[];
}

/* ── Memoised custom tooltip ── */
const TimelineTooltip = memo(({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-echo-md px-3 py-2 shadow-echo-2 text-xs">
      <p className="font-medium text-bark">{d.date}</p>
      <p className="text-driftwood">
        {d.mood?.emoji} {d.mood?.label}
      </p>
      {d.title && <p className="text-driftwood truncate max-w-[150px]">{d.title}</p>}
      {d.isMilestone && (
        <p className="text-dusk font-medium mt-1">🏴 {d.milestoneLabel || "Milestone"}</p>
      )}
    </div>
  );
});
TimelineTooltip.displayName = "TimelineTooltip";

const HealingTimeline = memo(({ entries }: HealingTimelineProps) => {
  const data = useMemo(() => {
    const withMood = entries
      .filter((e) => e.mood)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return withMood.map((e) => ({
      date: new Date(e.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      score: MOOD_SCORE[e.mood!] ?? 3,
      mood: MOOD_OPTIONS.find((m) => m.value === e.mood),
      isMilestone: e.is_milestone,
      milestoneLabel: e.milestone_label,
      title: e.title,
    }));
  }, [entries]);

  const milestones = useMemo(() => data.filter((d) => d.isMilestone), [data]);

  const renderTooltip = useCallback((props: any) => <TimelineTooltip {...props} />, []);

  if (data.length < 2) return null;

  return (
    <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border mb-6">
      <h3 className="font-heading text-sm font-semibold text-bark mb-1">Healing Timeline</h3>
      <p className="text-xs text-driftwood mb-4">Your mood trends over time</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(153, 40%, 30%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(153, 40%, 30%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(20, 4%, 40%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 6]}
              tick={{ fontSize: 10, fill: "hsl(20, 4%, 40%)" }}
              axisLine={false}
              tickLine={false}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={yTickFormatter}
            />
            <Tooltip content={renderTooltip} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(153, 40%, 30%)"
              strokeWidth={2}
              fill="url(#moodGradient)"
            />
            {milestones.map((m, i) => (
              <ReferenceDot
                key={i}
                x={m.date}
                y={m.score}
                r={6}
                fill="hsl(268, 28%, 51%)"
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {milestones.length > 0 && (
        <div className="flex items-center gap-2 mt-3 text-[10px] text-driftwood">
          <span className="w-3 h-3 rounded-full bg-dusk inline-block" />
          Milestones
        </div>
      )}
    </div>
  );
});
HealingTimeline.displayName = "HealingTimeline";

export default HealingTimeline;
