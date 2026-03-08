import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTrainingProgress, useToggleTrainingModule } from "@/hooks/use-volunteer-data";
import { TRAINING_MODULES, TRAINING_CONTENT } from "@/lib/volunteer";
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const TrainingChecklist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: completed = new Set<string>(), isLoading } = useTrainingProgress(user?.id);
  const toggleModule = useToggleTrainingModule();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});

  const handleToggle = async (key: string) => {
    if (!user) return;
    const content = TRAINING_CONTENT[key];
    // If module has assessment, must answer correctly before completing
    if (!completed.has(key) && content?.assessment) {
      const answer = assessmentAnswers[key];
      if (answer === undefined) {
        setExpandedModule(key);
        toast({ title: "Read the module", description: "Complete the self-assessment to mark this module done.", variant: "destructive" });
        return;
      }
      if (answer !== content.assessment.correctIndex) {
        toast({ title: "Incorrect answer", description: "Review the material and try again.", variant: "destructive" });
        return;
      }
    }
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
          const isExpanded = expandedModule === mod.key;
          const content = TRAINING_CONTENT[mod.key];

          return (
            <div key={mod.key} className={`rounded-echo-md border-2 transition-all ${done ? "border-forest/30 bg-dawn" : "border-stone bg-card"}`}>
              <button
                onClick={() => setExpandedModule(isExpanded ? null : mod.key)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start gap-3">
                  {done ? <CheckCircle2 className="h-5 w-5 text-forest shrink-0 mt-0.5" /> : <Circle className="h-5 w-5 text-stone shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${done ? "text-forest" : "text-bark"}`}>{mod.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-driftwood bg-sand px-2 py-0.5 rounded-echo-pill">{mod.category}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-driftwood" /> : <ChevronDown className="h-4 w-4 text-driftwood" />}
                      </div>
                    </div>
                    <p className="text-xs text-driftwood mt-0.5">{mod.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-driftwood" />
                      <span className="text-[10px] text-driftwood">{mod.duration}</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && content && (
                <div className="px-4 pb-4 border-t border-stone/50 pt-4 space-y-4">
                  {/* Reading material */}
                  <div>
                    <h4 className="text-xs font-semibold text-bark uppercase tracking-wide mb-2">Reading Material</h4>
                    <div className="text-sm text-driftwood leading-relaxed space-y-2">
                      {content.material.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>

                  {/* Key takeaways */}
                  <div>
                    <h4 className="text-xs font-semibold text-bark uppercase tracking-wide mb-2">Key Takeaways</h4>
                    <ul className="space-y-1">
                      {content.takeaways.map((t, i) => (
                        <li key={i} className="text-sm text-driftwood flex items-start gap-2">
                          <span className="text-forest mt-0.5">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Self-assessment */}
                  {content.assessment && (
                    <div className="bg-sand rounded-echo-md p-4">
                      <h4 className="text-xs font-semibold text-bark uppercase tracking-wide mb-2">Self-Assessment</h4>
                      <p className="text-sm text-bark mb-3">{content.assessment.question}</p>
                      <div className="space-y-2">
                        {content.assessment.options.map((opt, i) => {
                          const selected = assessmentAnswers[mod.key] === i;
                          const isCorrect = i === content.assessment!.correctIndex;
                          const answered = assessmentAnswers[mod.key] !== undefined;
                          return (
                            <button
                              key={i}
                              onClick={() => setAssessmentAnswers((prev) => ({ ...prev, [mod.key]: i }))}
                              className={`w-full text-left px-3 py-2 rounded-echo-md text-sm border-2 transition-all ${
                                selected
                                  ? answered && isCorrect
                                    ? "border-forest bg-dawn text-forest"
                                    : answered && !isCorrect
                                    ? "border-care-alert bg-care-alert/10 text-care-alert"
                                    : "border-forest bg-dawn text-forest"
                                  : "border-stone text-driftwood hover:border-fern"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {assessmentAnswers[mod.key] !== undefined && assessmentAnswers[mod.key] === content.assessment.correctIndex && (
                        <p className="text-xs text-forest mt-2 font-medium">✓ Correct! You can now mark this module complete.</p>
                      )}
                      {assessmentAnswers[mod.key] !== undefined && assessmentAnswers[mod.key] !== content.assessment.correctIndex && (
                        <p className="text-xs text-care-alert mt-2">Not quite — review the material above and try again.</p>
                      )}
                    </div>
                  )}

                  {/* Mark complete button */}
                  <Button
                    variant={done ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleToggle(mod.key)}
                    disabled={
                      !done &&
                      content.assessment !== undefined &&
                      assessmentAnswers[mod.key] !== content.assessment.correctIndex
                    }
                  >
                    {done ? "Mark Incomplete" : "Mark Complete"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingChecklist;
