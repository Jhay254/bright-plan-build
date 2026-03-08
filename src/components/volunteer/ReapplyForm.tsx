import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SPECIALISATIONS } from "@/lib/volunteer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

interface ReapplyFormProps {
  userId: string;
  currentMotivation: string | null;
  currentBackground: string | null;
  currentSpecialisations: string[] | null;
  onSuccess: () => void;
}

const ReapplyForm = ({ userId, currentMotivation, currentBackground, currentSpecialisations, onSuccess }: ReapplyFormProps) => {
  const [motivation, setMotivation] = useState(currentMotivation ?? "");
  const [background, setBackground] = useState(currentBackground ?? "");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(currentSpecialisations ?? []);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const toggleSpec = (s: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 5 ? [...prev, s] : prev
    );
  };

  const handleReapply = async () => {
    if (!motivation.trim()) {
      toast({ title: "Required", description: "Please explain your motivation.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("volunteer_profiles")
        .update({
          motivation,
          background: background || null,
          specialisations: selectedSpecs,
          rejection_reason: null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({ title: "Application resubmitted", description: "Your updated application is now under review." });
      onSuccess();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-2">
        <Label>Why do you want to volunteer?</Label>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value.slice(0, 500))}
          placeholder="Tell us what motivates you to support others…"
          className="w-full h-24 px-4 py-3 rounded-echo-md border-2 border-stone bg-background text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label>Relevant background <span className="text-driftwood font-normal">(optional)</span></Label>
        <textarea
          value={background}
          onChange={(e) => setBackground(e.target.value.slice(0, 500))}
          placeholder="Any counselling, psychology, social work, or peer support experience…"
          className="w-full h-20 px-4 py-3 rounded-echo-md border-2 border-stone bg-background text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none resize-none text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label>Areas of interest <span className="text-driftwood font-normal">(up to 5)</span></Label>
        <div className="flex flex-wrap gap-2">
          {SPECIALISATIONS.map((s) => (
            <button
              key={s}
              type="button"
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
      <Button
        variant="hero"
        className="w-full"
        onClick={handleReapply}
        disabled={!motivation.trim() || submitting}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        {submitting ? "Resubmitting…" : "Resubmit Application"}
      </Button>
    </div>
  );
};

export default ReapplyForm;
