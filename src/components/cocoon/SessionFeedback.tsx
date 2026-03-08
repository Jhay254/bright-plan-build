import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { Database } from "@/integrations/supabase/types";

type FeedbackRole = Database["public"]["Enums"]["app_role"];

const EMOTIONAL_LABELS = [
  { value: 1, emoji: "😔", label: "Very difficult" },
  { value: 2, emoji: "😕", label: "Somewhat difficult" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Better" },
  { value: 5, emoji: "😊", label: "Much better" },
];

const ENDORSABLE_SKILLS = [
  "Good listener",
  "Empathetic",
  "Patient",
  "Non-judgmental",
  "Supportive",
  "Clear communicator",
  "Warm & caring",
  "Respectful",
];

interface SessionFeedbackProps {
  sessionId: string;
  volunteerId?: string | null;
  role: FeedbackRole;
  onComplete: () => void;
}

const SessionFeedback = ({ sessionId, volunteerId, role, onComplete }: SessionFeedbackProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [rating, setRating] = useState<number | null>(null);
  const [feltHeard, setFeltHeard] = useState<boolean | null>(null);
  const [feltSafe, setFeltSafe] = useState<boolean | null>(null);
  const [reflection, setReflection] = useState("");
  const [endorsedSkills, setEndorsedSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    setEndorsedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : prev.length < 3 ? [...prev, skill] : prev
    );
  };

  const handleSubmit = async () => {
    if (!user || rating === null) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("session_feedback").insert({
        session_id: sessionId,
        user_id: user.id,
        role,
        emotional_rating: rating,
        felt_heard: feltHeard,
        felt_safe: feltSafe,
        reflection: reflection || null,
      });
      if (error) throw error;

      // 12.1: Write endorsed skills to volunteer profile
      if (role === "seeker" && volunteerId && endorsedSkills.length > 0) {
        const { data: vp } = await supabase
          .from("volunteer_profiles")
          .select("skills_endorsed")
          .eq("user_id", volunteerId)
          .single();

        if (vp) {
          const existing = (vp.skills_endorsed as string[]) ?? [];
          const merged = Array.from(new Set([...existing, ...endorsedSkills]));
          await supabase
            .from("volunteer_profiles")
            .update({ skills_endorsed: merged })
            .eq("user_id", volunteerId);
        }
      }

      toast({ title: t("feedback.thanks") });
      onComplete();
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-md mx-auto">
      <h2 className="font-heading text-xl font-bold text-bark mb-2 text-center">
        {role === "seeker" ? t("feedback.seekerTitle") : t("feedback.volunteerTitle")}
      </h2>
      <p className="text-driftwood text-sm text-center mb-8">
        {role === "seeker" ? t("feedback.seekerDesc") : t("feedback.volunteerDesc")}
      </p>

      {/* Emotional rating */}
      <div className="mb-6">
        <p className="text-sm font-medium text-bark mb-3 text-center">
          {role === "seeker" ? t("feedback.howFeelAfter") : t("feedback.howSessionGo")}
        </p>
        <div className="flex justify-center gap-3">
          {EMOTIONAL_LABELS.map((e) => (
            <button
              key={e.value}
              onClick={() => setRating(e.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-echo-md transition-all ${
                rating === e.value ? "bg-mist scale-110" : "hover:bg-dawn"
              }`}
            >
              <span className="text-2xl">{e.emoji}</span>
              <span className="text-[10px] text-driftwood">{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Seeker-specific */}
      {role === "seeker" && (
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm font-medium text-bark mb-2">{t("feedback.feltHeard")}</p>
            <div className="flex gap-3">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  onClick={() => setFeltHeard(v)}
                  className={`flex-1 py-2.5 rounded-echo-pill text-sm font-medium border-2 transition-all ${
                    feltHeard === v
                      ? "border-forest bg-mist text-forest"
                      : "border-stone text-driftwood hover:border-fern"
                  }`}
                >
                  {v ? t("feedback.yes") : t("feedback.notReally")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-bark mb-2">{t("feedback.feltSafe")}</p>
            <div className="flex gap-3">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  onClick={() => setFeltSafe(v)}
                  className={`flex-1 py-2.5 rounded-echo-pill text-sm font-medium border-2 transition-all ${
                    feltSafe === v
                      ? "border-forest bg-mist text-forest"
                      : "border-stone text-driftwood hover:border-fern"
                  }`}
                >
                  {v ? t("feedback.yes") : t("feedback.notReally")}
                </button>
              ))}
            </div>
          </div>

          {/* Skills endorsement */}
          {volunteerId && (
            <div>
              <p className="text-sm font-medium text-bark mb-1">{t("feedback.endorseSkills")}</p>
              <p className="text-xs text-driftwood mb-3">{t("feedback.endorseDesc")}</p>
              <div className="flex flex-wrap gap-2">
                {ENDORSABLE_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-echo-pill text-xs font-medium border transition-all ${
                      endorsedSkills.includes(skill)
                        ? "border-forest bg-dawn text-forest"
                        : "border-stone text-driftwood hover:border-fern"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reflection */}
      <div className="mb-8">
        <p className="text-sm font-medium text-bark mb-2">
          {role === "seeker" ? t("feedback.anythingElse") : t("feedback.selfReflection")}
          <span className="text-driftwood font-normal"> ({t("feedback.optional")})</span>
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value.slice(0, 500))}
          placeholder={role === "seeker" ? t("feedback.seekerPlaceholder") : t("feedback.volunteerPlaceholder")}
          className="w-full h-24 px-4 py-3 rounded-echo-md border-2 border-stone bg-card text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
        />
      </div>

      <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={rating === null || submitting}>
        {submitting ? t("feedback.submitting") : t("feedback.submit")}
      </Button>
      <button onClick={onComplete} className="block mx-auto mt-3 text-sm text-driftwood hover:text-forest">
        {t("feedback.skip")}
      </button>
    </div>
  );
};

export default SessionFeedback;
