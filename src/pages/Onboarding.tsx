import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, Heart, ChevronRight, ChevronLeft, Globe, Compass, Target } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
];

const HEALING_GOALS = [
  "Coping with stress",
  "Processing grief",
  "Managing anxiety",
  "Building resilience",
  "Healing from trauma",
  "Improving relationships",
  "Finding purpose",
  "Self-acceptance",
  "Emotional regulation",
  "Overcoming isolation",
];

const WELCOME_STEPS = [
  {
    icon: Shield,
    title: "You are safe here",
    description: "Echo is a confidential space. Your conversations are private, encrypted, and never shared. You control what you share and when.",
  },
  {
    icon: Eye,
    title: "You are anonymous",
    description: "No real names required. Your identity is protected by a generated alias. You can explore freely without fear of being identified.",
  },
  {
    icon: Heart,
    title: "How Echo works",
    description: "When you're ready, you'll be matched with a trained volunteer for a private conversation called a Cocoon session. You can also journal, join community circles, and track your healing journey.",
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0); // 0-2: welcome, 3: language, 4: cultural, 5: goals
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      toast({ title: "Error saving preferences", description: e.message, variant: "destructive" });
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
                const Icon = WELCOME_STEPS[step].icon;
                return (
                  <div className="mx-auto w-16 h-16 rounded-full bg-mist flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-forest" />
                  </div>
                );
              })()}
              <h1 className="font-heading text-2xl font-bold text-bark mb-4">
                {WELCOME_STEPS[step].title}
              </h1>
              <p className="text-driftwood leading-relaxed">
                {WELCOME_STEPS[step].description}
              </p>
            </div>
          )}

          {/* Language selection (3) */}
          {step === 3 && (
            <div>
              <div className="mx-auto w-16 h-16 rounded-full bg-mist flex items-center justify-center mb-6 text-center">
                <Globe className="h-8 w-8 text-forest" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-bark mb-2 text-center">Choose your language</h1>
              <p className="text-driftwood text-sm mb-6 text-center">You can change this anytime in settings.</p>
              <div className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
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
              <h1 className="font-heading text-2xl font-bold text-bark mb-2 text-center">Cultural context</h1>
              <p className="text-driftwood text-sm mb-6 text-center">
                Optional — helps us match you with a volunteer who understands your background.
              </p>
              <textarea
                value={culturalContext}
                onChange={(e) => setCulturalContext(e.target.value.slice(0, 500))}
                placeholder="Share anything about your cultural background, faith, community, or identity that might help us support you better..."
                className="w-full h-32 px-4 py-3 rounded-echo-md border-2 border-stone bg-card text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
              />
              <p className="text-xs text-driftwood mt-2">{culturalContext.length}/500 · This is completely optional</p>
            </div>
          )}

          {/* Goal setting (5) */}
          {step === 5 && (
            <div>
              <div className="mx-auto w-16 h-16 rounded-full bg-mist flex items-center justify-center mb-6 text-center">
                <Target className="h-8 w-8 text-forest" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-bark mb-2 text-center">Your healing goals</h1>
              <p className="text-driftwood text-sm mb-6 text-center">
                Select up to 5 areas you'd like to focus on.
              </p>
              <div className="flex flex-wrap gap-2">
                {HEALING_GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`px-4 py-2 rounded-echo-pill text-sm font-medium border-2 transition-all ${
                      selectedGoals.includes(goal)
                        ? "border-forest bg-mist text-forest"
                        : "border-stone bg-card text-driftwood hover:border-fern"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <p className="text-xs text-driftwood mt-3">{selectedGoals.length}/5 selected</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 flex items-center justify-between max-w-md mx-auto w-full">
        {step > 0 ? (
          <Button variant="ghost" onClick={back} size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        ) : (
          <div />
        )}
        <Button variant="hero" onClick={next} disabled={saving}>
          {step === totalSteps - 1 ? (saving ? "Saving…" : "Get Started") : "Continue"}
          {step < totalSteps - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
