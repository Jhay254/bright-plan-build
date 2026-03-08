import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateSession } from "@/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

const TOPIC_KEYS = [
  "anxiety", "grief", "relationships", "stress", "loneliness",
  "trauma", "selfEsteem", "transitions", "family", "other",
] as const;

const URGENCY_OPTIONS = ["low", "medium", "high"] as const;

const SessionRequest = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const createSession = useCreateSession();
  const [topic, setTopic] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [preferences, setPreferences] = useState("");

  const handleSubmit = async () => {
    if (!user || !topic) return;
    try {
      const data = await createSession.mutateAsync({
        seeker_id: user.id,
        topic,
        urgency,
        language: profile?.language ?? "en",
        preferences: preferences || null,
      });
      navigate(`/app/cocoon/${data.id}`);
    } catch (e: any) {
      toast({ title: t("session.errorCreating"), description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      <button onClick={() => navigate("/app/cocoon")} className="flex items-center gap-1 text-sm text-driftwood hover:text-forest mb-6">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </button>

      <h1 className="font-heading text-2xl font-bold text-bark mb-2">{t("session.requestTitle")}</h1>
      <p className="text-driftwood text-sm mb-8">{t("session.requestDesc")}</p>

      {/* Topic */}
      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-bark mb-3">{t("session.topicLabel")}</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("session.topicLabel")}>
          {TOPIC_KEYS.map((key) => {
            const label = t(`session.topics.${key}`);
            return (
              <button
                key={key}
                onClick={() => setTopic(label)}
                role="radio"
                aria-checked={topic === label}
                aria-label={`${t("session.topicLabel")}: ${label}`}
                className={`px-4 py-2 rounded-echo-pill text-sm font-medium border-2 transition-all ${
                  topic === label
                    ? "border-forest bg-mist text-forest"
                    : "border-stone bg-card text-driftwood hover:border-fern"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Urgency */}
      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-bark mb-3">{t("session.urgencyLabel")}</legend>
        <div className="space-y-2" role="radiogroup" aria-label={t("session.urgencyLabel")}>
          {URGENCY_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setUrgency(opt)}
              role="radio"
              aria-checked={urgency === opt}
              aria-label={`${t(`session.urgency.${opt}`)}: ${t(`session.urgency.${opt}Desc`)}`}
              className={`w-full text-left px-5 py-3.5 rounded-echo-md border-2 transition-all ${
                urgency === opt
                  ? "border-forest bg-dawn"
                  : "border-stone bg-card hover:border-fern"
              }`}
            >
              <p className={`font-medium text-sm ${urgency === opt ? "text-forest" : "text-bark"}`}>
                {t(`session.urgency.${opt}`)}
              </p>
              <p className="text-xs text-driftwood mt-0.5">{t(`session.urgency.${opt}Desc`)}</p>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Preferences */}
      <div className="mb-8">
        <p className="text-sm font-medium text-bark mb-2">{t("session.preferencesLabel")} <span className="text-driftwood font-normal">({t("session.preferencesOptional")})</span></p>
        <textarea
          value={preferences}
          onChange={(e) => setPreferences(e.target.value.slice(0, 300))}
          placeholder={t("session.preferencesPlaceholder")}
          aria-label={t("session.preferencesLabel")}
          className="w-full h-24 px-4 py-3 rounded-echo-md border-2 border-stone bg-card text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
        />
      </div>

      <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={!topic || createSession.isPending}>
        {createSession.isPending ? t("session.requesting") : t("session.requestButton")}
      </Button>
    </div>
  );
};

export default SessionRequest;