import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAvailabilitySlots, useSaveAvailability } from "@/hooks/use-volunteer-data";
import { DAY_LABELS, HOUR_LABELS } from "@/lib/volunteer";

const TIME_SLOTS = [6, 8, 10, 12, 14, 16, 18, 20];

const AvailabilityScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: savedSlots, isLoading } = useAvailabilitySlots(user?.id);
  const saveAvailability = useSaveAvailability();

  // Local editable copy of slots
  const [localSlots, setLocalSlots] = useState<Set<string> | null>(null);
  const slots = localSlots ?? savedSlots ?? new Set<string>();

  // Sync from server on first load
  if (savedSlots && !localSlots) {
    // Will trigger on next render
  }

  const slotKey = (day: number, hour: number) => `${day}-${hour}`;

  const toggleSlot = (day: number, hour: number) => {
    const base = localSlots ?? savedSlots ?? new Set<string>();
    const next = new Set(base);
    const key = slotKey(day, hour);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setLocalSlots(next);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await saveAvailability.mutateAsync({ userId: user.id, slots });
      setLocalSlots(null); // Reset to server state
      toast({ title: "Availability saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="h-48 bg-sand rounded-echo-md animate-pulse" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-bark">Availability</h2>
          <p className="text-xs text-driftwood">Select your available 2-hour blocks</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveAvailability.isPending}
          className="px-4 py-1.5 rounded-echo-pill text-sm font-medium bg-forest text-primary-foreground hover:bg-fern transition-colors disabled:opacity-50"
        >
          {saveAvailability.isPending ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="overflow-x-auto" role="grid" aria-label="Weekly availability schedule">
        <div className="grid grid-cols-8 gap-1 min-w-[500px]">
          <div role="columnheader" />
          {DAY_LABELS.map((d) => (
            <div key={d} role="columnheader" className="text-center text-xs font-medium text-driftwood py-1">{d}</div>
          ))}

          {TIME_SLOTS.map((hour) => (
            <div key={`row-${hour}`} className="contents" role="row">
              <div role="rowheader" className="text-xs text-driftwood text-right pr-2 py-2">
                {HOUR_LABELS[hour]}
              </div>
              {DAY_LABELS.map((dayLabel, day) => {
                const active = slots.has(slotKey(day, hour));
                return (
                  <button
                    key={slotKey(day, hour)}
                    onClick={() => toggleSlot(day, hour)}
                    role="gridcell"
                    aria-pressed={active}
                    aria-label={`${dayLabel} ${HOUR_LABELS[hour]}: ${active ? "available" : "unavailable"}`}
                    className={`h-8 rounded-sm transition-all ${
                      active ? "bg-forest/80 hover:bg-forest" : "bg-sand hover:bg-mist border border-stone"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityScheduler;
