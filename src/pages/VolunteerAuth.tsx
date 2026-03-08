import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import echoLogo from "@/assets/echo-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SPECIALISATIONS } from "@/lib/volunteer";
import CookieBanner from "@/components/CookieBanner";

const VolunteerAuth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [motivation, setMotivation] = useState("");
  const [background, setBackground] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleSpec = (s: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 5 ? [...prev, s] : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && step === 0) {
      if (!consent) {
        toast({ title: "Error", description: "Please agree to the Privacy Policy to continue.", variant: "destructive" });
        return;
      }
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        localStorage.setItem("echo_volunteer_pending", JSON.stringify({
          motivation, background, specialisations: selectedSpecs,
        }));
        // Check if session was created immediately (auto-confirm enabled)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/app/volunteer");
        } else {
          toast({ title: "Check your email", description: "Confirm your account, then sign in to complete volunteer setup." });
        }
      } else {
        await signIn(email, password);
        navigate("/app");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-dawn flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={echoLogo} alt="Echo" className="h-12 w-12 mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold text-bark">Volunteer with Echo</h1>
          <p className="text-driftwood mt-1 text-sm">Make a meaningful difference</p>
        </div>

        <div className="bg-card rounded-echo-lg shadow-echo-2 p-8">
          {mode === "signup" && step === 1 ? (
            <div className="space-y-4">
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
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button variant="hero" className="flex-1" onClick={handleSubmit} disabled={!motivation.trim() || submitting}>
                  {submitting ? "Submitting…" : "Apply to Volunteer"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
              </div>

              {mode === "signup" && (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="vol-consent"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    aria-required="true"
                  />
                  <Label htmlFor="vol-consent" className="text-xs text-driftwood leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link to="/privacy" className="text-forest underline" target="_blank" rel="noopener">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={submitting || (mode === "signup" && !consent)}
              >
                {mode === "signup" ? "Continue" : submitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-driftwood mt-4">
            {mode === "signup" ? (
              <>Already a volunteer?{" "}
                <button onClick={() => { setMode("signin"); setStep(0); }} className="text-forest font-medium hover:underline">Sign in</button>
              </>
            ) : (
              <>New volunteer?{" "}
                <button onClick={() => { setMode("signup"); setStep(0); }} className="text-forest font-medium hover:underline">Apply here</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
    <CookieBanner />
    </>
  );
};

export default VolunteerAuth;
