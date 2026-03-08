import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import echoLogo from "@/assets/echo-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import CookieBanner from "@/components/CookieBanner";

type AuthMode = "signin" | "signup" | "anonymous";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("anonymous");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const failCount = useRef(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval>>();
  const { signIn, signUp, signInAnonymously } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleFailure = useCallback((e: any) => {
    failCount.current += 1;
    if (failCount.current >= 5) {
      startCooldown(30);
    } else if (failCount.current >= 3) {
      startCooldown(10);
    }
    toast({ title: t("auth.error"), description: e.message, variant: "destructive" });
  }, [startCooldown, toast, t]);

  const isDisabled = submitting || cooldown > 0;

  const recordConsent = async (userId: string) => {
    await supabase
      .from("profiles")
      .update({ consent_given_at: new Date().toISOString() } as any)
      .eq("user_id", userId);
  };

  const handleAnonymous = async () => {
    if (!consent) {
      toast({ title: t("auth.error"), description: t("auth.consentRequired"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await signInAnonymously();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await recordConsent(user.id);
      navigate("/onboarding");
    } catch (e: any) {
      toast({ title: t("auth.somethingWrong"), description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    if (mode === "signup" && !consent) {
      toast({ title: t("auth.error"), description: t("auth.consentRequired"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        failCount.current = 0;
        toast({ title: t("auth.checkEmail"), description: t("auth.confirmLink") });
      } else {
        await signIn(email, password);
        failCount.current = 0;
        navigate("/onboarding");
      }
    } catch (e: any) {
      handleFailure(e);
    } finally {
      setSubmitting(false);
    }
  };

  const needsConsent = mode === "signup" || mode === "anonymous";

  return (
    <>
      <Helmet>
        <title>Sign In — Echo</title>
        <meta name="description" content="Sign in or enter anonymously to access Echo's safe, dignified mental health support." />
      </Helmet>
      <div className="min-h-screen bg-dawn flex items-center justify-center px-4">
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={echoLogo} alt="Echo" className="h-12 w-12 mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold text-bark">{t("auth.welcome")}</h1>
          <p className="text-driftwood mt-1 text-sm">{t("auth.safeSpace")}</p>
        </div>

        <div className="bg-card rounded-echo-lg shadow-echo-2 p-8">
          {/* Consent checkbox — shown for anonymous + signup */}
          {needsConsent && (
            <div className="flex items-start gap-2 mb-6">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                aria-required="true"
              />
              <Label htmlFor="consent" className="text-xs text-driftwood leading-relaxed cursor-pointer">
                {t("auth.consentLabel")}{" "}
                <Link to="/privacy" className="text-forest underline" target="_blank" rel="noopener">
                  {t("auth.privacyPolicy")}
                </Link>
              </Label>
            </div>
          )}

          <Button
            variant="hero"
            className="w-full mb-6"
            onClick={handleAnonymous}
            disabled={isDisabled || !consent}
          >
            {t("auth.enterAnonymously")}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-driftwood">{t("auth.orUseEmail")}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
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
              <Label htmlFor="password">{t("auth.password")}</Label>
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

            {cooldown > 0 && (
              <p className="text-sm text-ember text-center">
                Too many attempts. Try again in {cooldown}s.
              </p>
            )}
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isDisabled || (mode === "signup" && !consent)}
            >
              {mode === "signup" ? t("auth.createAccount") : t("auth.signIn")}
            </Button>
          </form>

          <p className="text-center text-sm text-driftwood mt-4">
            {mode === "signup" ? (
              <>{t("auth.alreadyHaveAccount")}{" "}
                <button onClick={() => setMode("signin")} className="text-forest font-medium hover:underline">{t("auth.signInLink")}</button>
              </>
            ) : (
              <>{t("auth.wantToCreate")}{" "}
                <button onClick={() => setMode("signup")} className="text-forest font-medium hover:underline">{t("auth.signUp")}</button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-driftwood mt-6">
          {t("auth.identityProtected")}
        </p>
      </div>
    </div>
    <CookieBanner />
    </>
  );
};

export default Auth;
