import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DAY_LABELS, HOUR_LABELS } from "@/lib/volunteer";
import type { Database } from "@/integrations/supabase/types";

type Slot = Database["public"]["Tables"]["volunteer_availability"]["Row"];

// Time slots from 6am to 10pm in 2-hour blocks
const TIME_SLOTS = [6, 8, 10, 12, 14, 16, 18, 20];

const AvailabilityScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const slotKey = (day: number, hour: number) => `${day}-${hour}`;

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("volunteer_availability")
        .select("*")
        .eq("user_id", user.id);
      if (data) {
        const set = new Set<string>();
        data.forEach((s) => set.add(slotKey(s.day_of_week, s.start_hour)));
        setSlots(set);
      }
    };
    fetch();
  }, [user]);

  const toggleSlot = (day: number, hour: number) => {
    const key = slotKey(day, hour);
    const next = new Set(slots);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSlots(next);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Delete all existing, then insert current
      await supabase.from("volunteer_availability").delete().eq("user_id", user.id);

      const rows = Array.from(slots).map((key) => {
        const [day, hour] = key.split("-").map(Number);
        return { user_id: user.id, day_of_week: day, start_hour: hour, end_hour: hour + 2 };
      });

      if (rows.length > 0) {
        const { error } = await supabase.from("volunteer_availability").insert(rows);
        if (error) throw error;
      }
      toast({ title: "Availability saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-bark">Availability</h2>
          <p className="text-xs text-driftwood">Select your available 2-hour blocks</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-echo-pill text-sm font-medium bg-forest text-primary-foreground hover:bg-fern transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-1 min-w-[500px]">
          {/* Header */}
          <div />
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-driftwood py-1">{d}</div>
          ))}

          {/* Rows */}
          {TIME_SLOTS.map((hour) => (
            <>
              <div key={`label-${hour}`} className="text-xs text-driftwood text-right pr-2 py-2">
                {HOUR_LABELS[hour]}
              </div>
              {DAY_LABELS.map((_, day) => {
                const active = slots.has(slotKey(day, hour));
                return (
                  <button
                    key={slotKey(day, hour)}
                    onClick={() => toggleSlot(day, hour)}
                    className={`h-8 rounded-sm transition-all ${
                      active
                        ? "bg-forest/80 hover:bg-forest"
                        : "bg-sand hover:bg-mist border border-stone"
                    }`}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityScheduler;
