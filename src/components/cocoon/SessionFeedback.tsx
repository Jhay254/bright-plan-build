import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type FeedbackRole = Database["public"]["Enums"]["app_role"];

const EMOTIONAL_LABELS = [
  { value: 1, emoji: "😔", label: "Very difficult" },
  { value: 2, emoji: "😕", label: "Somewhat difficult" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Better" },
  { value: 5, emoji: "😊", label: "Much better" },
];

interface SessionFeedbackProps {
  sessionId: string;
  role: FeedbackRole;
  onComplete: () => void;
}

const SessionFeedback = ({ sessionId, role, onComplete }: SessionFeedbackProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [feltHeard, setFeltHeard] = useState<boolean | null>(null);
  const [feltSafe, setFeltSafe] = useState<boolean | null>(null);
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      toast({ title: "Thank you for your feedback" });
      onComplete();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-md mx-auto">
      <h2 className="font-heading text-xl font-bold text-bark mb-2 text-center">
        {role === "seeker" ? "How are you feeling?" : "Session Reflection"}
      </h2>
      <p className="text-driftwood text-sm text-center mb-8">
        {role === "seeker"
          ? "Your feedback helps us improve and supports your healing journey."
          : "Reflect on this session for your own growth."}
      </p>

      {/* Emotional rating */}
      <div className="mb-6">
        <p className="text-sm font-medium text-bark mb-3 text-center">
          {role === "seeker" ? "How do you feel after this session?" : "How did the session go?"}
        </p>
        <div className="flex justify-center gap-3">
          {EMOTIONAL_LABELS.map((e) => (
            <button
              key={e.value}
              onClick={() => setRating(e.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-echo-md transition-all ${
                rating === e.value
                  ? "bg-mist scale-110"
                  : "hover:bg-dawn"
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
            <p className="text-sm font-medium text-bark mb-2">Did you feel heard?</p>
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
                  {v ? "Yes" : "Not really"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-bark mb-2">Did you feel safe?</p>
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
                  {v ? "Yes" : "Not really"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reflection */}
      <div className="mb-8">
        <p className="text-sm font-medium text-bark mb-2">
          {role === "seeker" ? "Anything else you'd like to share?" : "Self-reflection notes"}
          <span className="text-driftwood font-normal"> (optional)</span>
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value.slice(0, 500))}
          placeholder={role === "seeker" ? "How could we improve your experience?" : "What went well? What could you improve?"}
          className="w-full h-24 px-4 py-3 rounded-echo-md border-2 border-stone bg-card text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
        />
      </div>

      <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={rating === null || submitting}>
        {submitting ? "Submitting…" : "Submit Feedback"}
      </Button>
      <button onClick={onComplete} className="block mx-auto mt-3 text-sm text-driftwood hover:text-forest">
        Skip for now
      </button>
    </div>
  );
};

export default SessionFeedback;
