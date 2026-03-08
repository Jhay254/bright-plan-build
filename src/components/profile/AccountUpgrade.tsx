import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Mail, Lock, ShieldCheck } from "lucide-react";

const AccountUpgrade = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user?.is_anonymous) return null;

  const handleUpgrade = async () => {
    if (!email.trim() || !password.trim()) return;
    if (password.length < 6) {
      toast({ title: t("common.error"), description: t("profile.upgrade.passwordMin"), variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ email, password });
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      // Update profile to mark as non-anonymous
      await supabase.from("profiles").update({ is_anonymous: false }).eq("user_id", user.id);
      toast({ title: t("profile.upgrade.success"), description: t("profile.upgrade.successDesc") });
      await refreshProfile();
    }
    setSaving(false);
  };

  return (
    <div className="bg-dawn rounded-echo-lg p-5 border border-mist">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="h-4 w-4 text-forest" />
        <p className="text-xs text-forest uppercase tracking-wide font-semibold">{t("profile.upgrade.title")}</p>
      </div>
      <p className="text-sm text-driftwood mb-4">{t("profile.upgrade.desc")}</p>
      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-driftwood" />
          <Input
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ltr:pl-10 rtl:pr-10 h-10"
          />
        </div>
        <div className="relative">
          <Lock className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-driftwood" />
          <Input
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ltr:pl-10 rtl:pr-10 h-10"
          />
        </div>
        <Button onClick={handleUpgrade} disabled={saving || !email.trim() || !password.trim()} size="sm" className="w-full">
          {saving ? t("common.loading") : t("profile.upgrade.button")}
        </Button>
      </div>
    </div>
  );
};

export default AccountUpgrade;
