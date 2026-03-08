import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTrainingProgress, useToggleTrainingModule } from "@/hooks/use-volunteer-data";
import { TRAINING_MODULES } from "@/lib/volunteer";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const TrainingChecklist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: completed = new Set<string>(), isLoading } = useTrainingProgress(user?.id);
  const toggleModule = useToggleTrainingModule();

  const handleToggle = async (key: string) => {
    if (!user) return;
    try {
      await toggleModule.mutateAsync({ userId: user.id, moduleKey: key, isCompleted: completed.has(key) });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const progress = (completed.size / TRAINING_MODULES.length) * 100;

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-sand rounded-echo-md animate-pulse" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-bark">Training</h2>
          <p className="text-xs text-driftwood">{completed.size}/{TRAINING_MODULES.length} modules completed</p>
        </div>
        <div className="text-sm font-semibold text-forest">{Math.round(progress)}%</div>
      </div>

      <div className="h-2 bg-sand rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-forest rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-2">
        {TRAINING_MODULES.map((mod) => {
          const done = completed.has(mod.key);
          return (
            <button
              key={mod.key}
              onClick={() => handleToggle(mod.key)}
              className={`w-full text-left p-4 rounded-echo-md border-2 transition-all ${
                done ? "border-forest/30 bg-dawn" : "border-stone bg-card hover:border-fern"
              }`}
            >
              <div className="flex items-start gap-3">
                {done ? <CheckCircle2 className="h-5 w-5 text-forest shrink-0 mt-0.5" /> : <Circle className="h-5 w-5 text-stone shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${done ? "text-forest" : "text-bark"}`}>{mod.title}</p>
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
