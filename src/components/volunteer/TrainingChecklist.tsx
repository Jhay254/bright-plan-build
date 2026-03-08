import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TRAINING_MODULES } from "@/lib/volunteer";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const TrainingChecklist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("training_progress")
        .select("module_key")
        .eq("user_id", user.id)
        .eq("completed", true);
      if (data) setCompleted(new Set(data.map((d) => d.module_key)));
    };
    fetch();
  }, [user]);

  const toggleModule = async (key: string) => {
    if (!user) return;
    const isCompleted = completed.has(key);
    try {
      if (isCompleted) {
        await supabase
          .from("training_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("module_key", key);
        setCompleted((prev) => { const n = new Set(prev); n.delete(key); return n; });
      } else {
        await supabase.from("training_progress").upsert({
          user_id: user.id,
          module_key: key,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,module_key" });
        setCompleted((prev) => new Set(prev).add(key));
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const progress = (completed.size / TRAINING_MODULES.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-bark">Training</h2>
          <p className="text-xs text-driftwood">{completed.size}/{TRAINING_MODULES.length} modules completed</p>
        </div>
        <div className="text-sm font-semibold text-forest">{Math.round(progress)}%</div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-sand rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-forest rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {TRAINING_MODULES.map((mod) => {
          const done = completed.has(mod.key);
          return (
            <button
              key={mod.key}
              onClick={() => toggleModule(mod.key)}
              className={`w-full text-left p-4 rounded-echo-md border-2 transition-all ${
                done
                  ? "border-forest/30 bg-dawn"
                  : "border-stone bg-card hover:border-fern"
              }`}
            >
              <div className="flex items-start gap-3">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-forest shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-stone shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${done ? "text-forest" : "text-bark"}`}>
                      {mod.title}
                    </p>
                    <span className="text-[10px] text-driftwood bg-sand px-2 py-0.5 rounded-echo-pill">{mod.category}</span>
                  </div>
                  <p className="text-xs text-driftwood mt-0.5">{mod.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-driftwood" />
                    <span className="text-[10px] text-driftwood">{mod.duration}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingChecklist;
