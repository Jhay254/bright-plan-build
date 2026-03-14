import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { SPECIALISATIONS } from "@/lib/volunteer";
import { Heart, BookOpen, Send, ChevronRight, CheckCircle2 } from "lucide-react";

const PREREQ_MODULES = [
  { key: "active-listening", label: "Active Listening" },
  { key: "empathy-boundaries", label: "Empathy & Boundaries" },
  { key: "crisis-recognition", label: "Crisis Recognition" },
];

type Step = "intro" | "training" | "apply" | "submitted";

const SeekerToVolunteerPathway = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>("intro");
  const [motivation, setMotivation] = useState("");
  const [background, setBackground] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  // Only show for seekers
  if (role !== "seeker") return null;

  const toggleSpec = (s: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 5 ? [...prev, s] : prev
    );
  };

  const markModuleRead = (key: string) => {
    setCompletedModules((prev) => new Set(prev).add(key));
  };

  const allPrereqsDone = PREREQ_MODULES.every((m) => completedModules.has(m.key));

  const handleSubmit = async () => {
    if (!user || !motivation.trim()) return;
    setSubmitting(true);
    try {
      // Create volunteer profile
      const { error: profileError } = await supabase.from("volunteer_profiles").insert({
        user_id: user.id,
        motivation: motivation.trim(),
        background: background.trim() || null,
        specialisations: selectedSpecs,
      });
      if (profileError) throw profileError;

      // Claim volunteer role
      const { error: roleError } = await supabase.rpc("claim_volunteer_role");
      if (roleError) throw roleError;

      setStep("submitted");
      toast({ title: t("pathway.submitted") });
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-echo-lg shadow-echo-1 border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-forest/10 to-fern/10 p-5 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="h-4 w-4 text-forest" />
          <p className="text-xs text-forest uppercase tracking-wide font-semibold">
            {t("pathway.title")}
          </p>
        </div>
        <p className="text-sm text-driftwood">{t("pathway.subtitle")}</p>
      </div>

      <div className="p-5">
        {/* Step: Intro */}
        {step === "intro" && (
          <div className="space-y-4">
            <p className="text-sm text-bark leading-relaxed">{t("pathway.introDesc")}</p>
            <ul className="space-y-2 text-sm text-driftwood">
              <li className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-fern mt-0.5 shrink-0" />
                {t("pathway.step1")}
              </li>
              <li className="flex items-start gap-2">
                <Send className="h-4 w-4 text-fern mt-0.5 shrink-0" />
                {t("pathway.step2")}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-fern mt-0.5 shrink-0" />
                {t("pathway.step3")}
              </li>
            </ul>
            <Button variant="hero" size="sm" onClick={() => setStep("training")} className="w-full">
              {t("pathway.beginButton")} <ChevronRight className="h-4 w-4 ltr:ml-1 rtl:mr-1" />
            </Button>
          </div>
        )}

        {/* Step: Training prerequisites */}
        {step === "training" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-bark mb-2">{t("pathway.trainingTitle")}</p>
              <Progress value={(completedModules.size / PREREQ_MODULES.length) * 100} className="h-2" />
              <p className="text-xs text-driftwood mt-1">
                {completedModules.size}/{PREREQ_MODULES.length} {t("pathway.completed")}
              </p>
            </div>
            <div className="space-y-2">
              {PREREQ_MODULES.map((mod) => {
                const done = completedModules.has(mod.key);
                return (
                  <button
                    key={mod.key}
                    onClick={() => markModuleRead(mod.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-echo-md border-2 text-left text-sm transition-all ${
                      done
                        ? "border-fern bg-mist text-forest"
                        : "border-stone text-bark hover:border-fern"
                    }`}
                  >
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${done ? "text-fern" : "text-stone"}`} />
                    <span className="flex-1">{mod.label}</span>
                    {!done && <span className="text-xs text-driftwood">{t("pathway.tapToComplete")}</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("intro")} className="flex-1">
                {t("common.back")}
              </Button>
              <Button variant="hero" size="sm" disabled={!allPrereqsDone} onClick={() => setStep("apply")} className="flex-1">
                {t("pathway.continueToApply")} <ChevronRight className="h-4 w-4 ltr:ml-1 rtl:mr-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Application form */}
        {step === "apply" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("pathway.whyVolunteer")}</Label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value.slice(0, 500))}
                placeholder={t("pathway.motivationPlaceholder")}
                className="w-full h-24 px-4 py-3 rounded-echo-md border-2 border-stone bg-background text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("pathway.backgroundLabel")} <span className="text-driftwood font-normal">({t("feedback.optional")})</span></Label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value.slice(0, 500))}
                placeholder={t("pathway.backgroundPlaceholder")}
                className="w-full h-20 px-4 py-3 rounded-echo-md border-2 border-stone bg-background text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("pathway.areasOfInterest")} <span className="text-driftwood font-normal">(max 5)</span></Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALISATIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSpec(s)}
                    className={`px-3 py-1.5 rounded-echo-pill text-xs font-medium border-2 transition-all ${
                      selectedSpecs.includes(s)
                        ? "border-forest bg-mist text-forest"
                        : "border-stone text-driftwood hover:border-fern"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("training")} className="flex-1">
                {t("common.back")}
              </Button>
              <Button variant="hero" size="sm" disabled={!motivation.trim() || submitting} onClick={handleSubmit} className="flex-1">
                {submitting ? t("common.loading") : t("pathway.submitApplication")}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Submitted */}
        {step === "submitted" && (
          <div className="text-center space-y-3 py-2">
            <CheckCircle2 className="h-12 w-12 text-fern mx-auto" />
            <p className="font-heading font-bold text-bark">{t("pathway.submittedTitle")}</p>
            <p className="text-sm text-driftwood">{t("pathway.submittedDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerToVolunteerPathway;
