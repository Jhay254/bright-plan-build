import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import echoLogo from "@/assets/echo-logo.png";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "signin" | "signup" | "anonymous";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("anonymous");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, signInAnonymously } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnonymous = async () => {
    setSubmitting(true);
    try {
      await signInAnonymously();
      navigate("/onboarding");
    } catch (e: any) {
      toast({ title: "Something went wrong", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
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
          <h1 className="font-heading text-2xl font-bold text-bark">Welcome to Echo</h1>
          <p className="text-driftwood mt-1 text-sm">A safe space for healing</p>
        </div>

        <div className="bg-card rounded-echo-lg shadow-echo-2 p-8">
          {/* Anonymous entry — the primary path */}
          <Button
            variant="hero"
            className="w-full mb-6"
            onClick={handleAnonymous}
            disabled={submitting}
          >
            Enter Anonymously
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-driftwood">or use email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" variant="outline" className="w-full" disabled={submitting}>
              {mode === "signup" ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-driftwood mt-4">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-forest font-medium hover:underline">Sign in</button>
              </>
            ) : (
              <>Want to create an account?{" "}
                <button onClick={() => setMode("signup")} className="text-forest font-medium hover:underline">Sign up</button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-driftwood mt-6">
          Your identity is protected. Anonymous sessions leave no trace.
        </p>
      </div>
    </div>
  );
};

export default Auth;
