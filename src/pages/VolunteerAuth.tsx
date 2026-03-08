import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import echoLogo from "@/assets/echo-logo.png";
import { useToast } from "@/hooks/use-toast";

const VolunteerAuth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        toast({ title: "Check your email", description: "Confirm your account to start volunteering." });
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
    <div className="min-h-screen bg-dawn flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={echoLogo} alt="Echo" className="h-12 w-12 mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold text-bark">Volunteer with Echo</h1>
          <p className="text-driftwood mt-1 text-sm">Make a meaningful difference</p>
        </div>

        <div className="bg-card rounded-echo-lg shadow-echo-2 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
              {mode === "signup" ? "Apply to Volunteer" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-driftwood mt-4">
            {mode === "signup" ? (
              <>Already a volunteer?{" "}
                <button onClick={() => setMode("signin")} className="text-forest font-medium hover:underline">Sign in</button>
              </>
            ) : (
              <>New volunteer?{" "}
                <button onClick={() => setMode("signup")} className="text-forest font-medium hover:underline">Apply here</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerAuth;
