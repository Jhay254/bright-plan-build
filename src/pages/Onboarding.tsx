import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, Heart, ChevronRight, ChevronLeft, Globe, Compass, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
];

const GOAL_KEYS = [
  "stress", "grief", "anxiety", "resilience", "trauma",
  "relationships", "purpose", "selfAcceptance", "emotionalRegulation", "isolation",
] as const;

const WELCOME_ICONS = [Shield, Eye, Heart];
const WELCOME_KEYS = ["safe", "anonymous", "howItWorks"] as const;

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(profile?.language ?? "en");
  const [culturalContext, setCulturalContext] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const totalSteps = 6;

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : prev.length < 5 ? [...prev, goal] : prev
    );
  };

  const handleLanguageSelect = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = code;
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          language,
          cultural_context: culturalContext || null,
          healing_goals: selectedGoals,
          onboarding_complete: true,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      navigate("/app", { replace: true });
    } catch (e: any) {
      toast({ title: t("onboarding.errorSaving"), description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step === totalSteps - 1) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };
  const back = () => step > 0 && setStep(step - 1);

  return (
    <>
      <Helmet>
        <title>Welcome — Echo</title>
        <meta name="description" content="Set up your Echo profile. Choose your language, goals, and preferences." />
      </Helmet>
      <div className="min-h-screen bg-dawn flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-forest" : "bg-stone"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-fade-in-up" key={step}>
          {/* Welcome screens (0-2) */}
          {step < 3 && (
            <div className="text-center">
              {(() => {
                const Icon = WELCOME_ICONS[step];
                return (
                  <div className="mx-auto w-16 h-16 rounded-full bg-mist flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-forest" />
                  </div>
                );
              })()}
              <h1 className="font-heading text-2xl font-bold text-bark mb-4">
                {t(`onboarding.${WELCOME_KEYS[step]}`)}
              </h1>
              <p className="text-driftwood leading-relaxed">
                {t(`onboarding.${WELCOME_KEYS[step]}Desc`)}
              </p>
            </div>
          )}

          {/* Language selection (3) */}
          {step === 3 && (
            <div>
              <div className="mx-auto w-16 h-16 rounded-full bg-mist flex items-center justify-center mb-6 text-center">
                <Globe className="h-8 w-8 text-forest" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-bark mb-2 text-center">{t("onboarding.chooseLanguage")}</h1>
              <p className="text-driftwood text-sm mb-6 text-center">{t("onboarding.changeAnytime")}</p>
              <div className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full text-left px-5 py-3.5 rounded-echo-md border-2 transition-all font-medium ${
                      language === lang.code
                        ? "border-forest bg-dawn text-forest"
                        : "border-stone bg-card text-bark hover:border-fern"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cultural context (4) */}
          {step === 4 && (
            <div>
              <div className="mx-auto w-16 h-16 rounded-full bg-mist flex items-center justify-center mb-6 text-center">
                <Compass className="h-8 w-8 text-forest" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-bark mb-2 text-center">{t("onboarding.culturalContext")}</h1>
              <p className="text-driftwood text-sm mb-6 text-center">
                {t("onboarding.culturalContextDesc")}
              </p>
              <textarea
                value={culturalContext}
                onChange={(e) => setCulturalContext(e.target.value.slice(0, 500))}
                placeholder={t("onboarding.culturalPlaceholder")}
                className="w-full h-32 px-4 py-3 rounded-echo-md border-2 border-stone bg-card text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
              />
              <p className="text-xs text-driftwood mt-2">{culturalContext.length}/500 · {t("onboarding.optional")}</p>
            </div>
          )}

          {/* Goal setting (5) */}
          {step === 5 && (
            <div>
              <div className="mx-auto w-16 h-16 rounded-full bg-mist flex items-center justify-center mb-6 text-center">
                <Target className="h-8 w-8 text-forest" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-bark mb-2 text-center">{t("onboarding.healingGoals")}</h1>
              <p className="text-driftwood text-sm mb-6 text-center">
                {t("onboarding.selectGoals")}
              </p>
              <div className="flex flex-wrap gap-2">
                {GOAL_KEYS.map((key) => {
                  const label = t(`onboarding.goals.${key}`);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleGoal(label)}
                      className={`px-4 py-2 rounded-echo-pill text-sm font-medium border-2 transition-all ${
                        selectedGoals.includes(label)
                          ? "border-forest bg-mist text-forest"
                          : "border-stone bg-card text-driftwood hover:border-fern"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-driftwood mt-3">{selectedGoals.length}/5 {t("onboarding.selected")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 flex items-center justify-between max-w-md mx-auto w-full">
        {step > 0 ? (
          <Button variant="ghost" onClick={back} size="sm">
            <ChevronLeft className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> {t("onboarding.back")}
          </Button>
        ) : (
          <div />
        )}
        <Button variant="hero" onClick={next} disabled={saving}>
          {step === totalSteps - 1 ? (saving ? t("onboarding.saving") : t("onboarding.getStarted")) : t("onboarding.continue")}
          {step < totalSteps - 1 && <ChevronRight className="h-4 w-4 ltr:ml-1 rtl:mr-1" />}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
