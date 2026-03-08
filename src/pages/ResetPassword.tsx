import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import echoLogo from "@/assets/echo-logo.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the auth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check if we already have a session with recovery type from hash fragment
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: t("common.error"), description: t("auth.resetPassword.minLength"), variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: t("common.error"), description: t("auth.resetPassword.mismatch"), variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({ title: t("auth.resetPassword.success"), description: t("auth.resetPassword.successDesc") });
      navigate("/app", { replace: true });
    } catch (e: any) {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isRecovery) {
    return (
      <>
        <Helmet>
          <title>{t("auth.resetPassword.title")} — Echo</title>
        </Helmet>
        <div className="min-h-screen bg-dawn flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <img src={echoLogo} alt="Echo" className="h-12 w-12 mx-auto mb-3" />
            <h1 className="font-heading text-2xl font-bold text-bark mb-2">{t("auth.resetPassword.title")}</h1>
            <p className="text-sm text-driftwood mb-6">{t("auth.resetPassword.invalidLink")}</p>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              {t("auth.resetPassword.backToSignIn")}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("auth.resetPassword.title")} — Echo</title>
        <meta name="description" content="Set a new password for your Echo account." />
      </Helmet>
      <div className="min-h-screen bg-dawn flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={echoLogo} alt="Echo" className="h-12 w-12 mx-auto mb-3" />
            <h1 className="font-heading text-2xl font-bold text-bark">{t("auth.resetPassword.title")}</h1>
            <p className="text-driftwood mt-1 text-sm">{t("auth.resetPassword.subtitle")}</p>
          </div>

          <div className="bg-card rounded-echo-lg shadow-echo-2 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("auth.resetPassword.newPassword")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("auth.resetPassword.confirmPassword")}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                {submitting ? t("common.loading") : t("auth.resetPassword.updateButton")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
