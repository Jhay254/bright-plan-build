import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateSession } from "@/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const TOPICS = [
  "Anxiety & worry",
  "Grief & loss",
  "Relationship challenges",
  "Stress & burnout",
  "Loneliness & isolation",
  "Trauma & past experiences",
  "Self-esteem",
  "Life transitions",
  "Family concerns",
  "Other",
];

const URGENCY_OPTIONS = [
  { value: "low" as const, label: "I'm okay", description: "Just want to talk when someone's available" },
  { value: "medium" as const, label: "Could use support", description: "Feeling unsettled and would appreciate help soon" },
  { value: "high" as const, label: "Struggling", description: "Having a hard time and need someone to talk to" },
];

const SessionRequest = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      toast({ title: "Error creating session", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      <button onClick={() => navigate("/app/cocoon")} className="flex items-center gap-1 text-sm text-driftwood hover:text-forest mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="font-heading text-2xl font-bold text-bark mb-2">Request a Cocoon Session</h1>
      <p className="text-driftwood text-sm mb-8">A volunteer will be matched to support you.</p>

      {/* Topic */}
      <div className="mb-6">
        <p className="text-sm font-medium text-bark mb-3">What would you like to talk about?</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`px-4 py-2 rounded-echo-pill text-sm font-medium border-2 transition-all ${
                topic === t
                  ? "border-forest bg-mist text-forest"
                  : "border-stone bg-card text-driftwood hover:border-fern"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div className="mb-6">
        <p className="text-sm font-medium text-bark mb-3">How are you feeling right now?</p>
        <div className="space-y-2">
          {URGENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setUrgency(opt.value)}
              className={`w-full text-left px-5 py-3.5 rounded-echo-md border-2 transition-all ${
                urgency === opt.value
                  ? "border-forest bg-dawn"
                  : "border-stone bg-card hover:border-fern"
              }`}
            >
              <p className={`font-medium text-sm ${urgency === opt.value ? "text-forest" : "text-bark"}`}>
                {opt.label}
              </p>
              <p className="text-xs text-driftwood mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="mb-8">
        <p className="text-sm font-medium text-bark mb-2">Anything else? <span className="text-driftwood font-normal">(optional)</span></p>
        <textarea
          value={preferences}
          onChange={(e) => setPreferences(e.target.value.slice(0, 300))}
          placeholder="Any preferences for your volunteer, or context that might help..."
          className="w-full h-24 px-4 py-3 rounded-echo-md border-2 border-stone bg-card text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
        />
      </div>

      <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={!topic || createSession.isPending}>
        {createSession.isPending ? "Requesting…" : "Request Session"}
      </Button>
    </div>
  );
};

export default SessionRequest;
