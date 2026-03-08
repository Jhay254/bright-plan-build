import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateAvatarSvg } from "@/lib/avatar";
import { LogOut, RefreshCw, Shield, Edit2, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import AccountUpgrade from "@/components/profile/AccountUpgrade";
import DataExport from "@/components/profile/DataExport";
import AccountDeletion from "@/components/profile/AccountDeletion";


const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
];

const ProfilePage = () => {
  const { profile, role, user, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [editingAlias, setEditingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(profile?.alias ?? "");
  const [saving, setSaving] = useState(false);
  const [localAvatarSeed, setLocalAvatarSeed] = useState<string | null>(null);

  const avatarSeed = localAvatarSeed ?? profile?.avatar_seed ?? "default";
  const avatarSrc = generateAvatarSvg(avatarSeed, 96);

  const regenerateAvatar = async () => {
    if (!user) return;
    const newSeed = crypto.randomUUID();
    setLocalAvatarSeed(newSeed);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_seed: newSeed })
      .eq("user_id", user.id);
    if (error) {
      setLocalAvatarSeed(null);
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("profile.avatarUpdated") });
      await refreshProfile();
    }
  };

  const saveAlias = async () => {
    if (!user || !aliasValue.trim()) return;
    setSaving(true);
    const trimmed = aliasValue.trim().slice(0, 30);
    const { error } = await supabase
      .from("profiles")
      .update({ alias: trimmed })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      setEditingAlias(false);
      toast({ title: t("profile.aliasUpdated") });
      await refreshProfile();
    }
    setSaving(false);
  };

  const updateLanguage = async (code: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ language: code })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      i18n.changeLanguage(code);
      document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = code;
      toast({ title: t("profile.languageUpdated") });
      await refreshProfile();
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile — Echo</title>
        <meta name="description" content="Manage your Echo profile, language, and account settings." />
      </Helmet>
      <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      <h1 className="font-heading text-2xl font-bold text-bark mb-6">{t("profile.title")}</h1>

      {/* Avatar + Alias */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img src={avatarSrc} alt="Avatar" className="w-16 h-16 rounded-echo-lg" />
          <button
            onClick={regenerateAvatar}
            className="absolute -bottom-1 ltr:-right-1 rtl:-left-1 w-7 h-7 rounded-full bg-forest text-primary-foreground flex items-center justify-center shadow-echo-1 hover:bg-fern transition-colors"
            aria-label={t("profile.regenerateAvatar")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1">
          {editingAlias ? (
            <div className="flex items-center gap-2">
              <Input
                value={aliasValue}
                onChange={(e) => setAliasValue(e.target.value.slice(0, 30))}
                className="h-9 text-sm"
                autoFocus
              />
              <button onClick={saveAlias} disabled={saving} aria-label="Save alias" className="text-affirm hover:opacity-80">
                <Check className="h-5 w-5" />
              </button>
              <button onClick={() => { setEditingAlias(false); setAliasValue(profile?.alias ?? ""); }} aria-label="Cancel editing alias" className="text-driftwood hover:opacity-80">
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-heading font-semibold text-bark text-lg">{profile?.alias ?? "—"}</p>
              <button onClick={() => setEditingAlias(true)} aria-label="Edit alias" className="text-driftwood hover:text-forest">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-driftwood capitalize">{role ?? "—"} · {user?.is_anonymous ? t("profile.anonymous") : user?.email}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
        {/* Language */}
        <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
          <p className="text-xs text-driftwood uppercase tracking-wide mb-3">{t("profile.language")}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => updateLanguage(lang.code)}
                aria-label={`Language: ${lang.label}`}
                aria-pressed={profile?.language === lang.code}
                className={`px-3 py-1.5 rounded-echo-pill text-sm font-medium border transition-all ${
                  profile?.language === lang.code
                    ? "border-forest bg-mist text-forest"
                    : "border-stone text-driftwood hover:border-fern"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <ThemeToggle />

        {/* Healing Goals */}
        {profile?.healing_goals && profile.healing_goals.length > 0 && (
          <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
            <p className="text-xs text-driftwood uppercase tracking-wide mb-3">{t("profile.healingGoals")}</p>
            <div className="flex flex-wrap gap-2">
              {profile.healing_goals.map((goal) => (
                <span key={goal} className="px-3 py-1.5 rounded-echo-pill text-xs font-medium bg-dawn text-forest border border-mist">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cultural Context */}
        {profile?.cultural_context && (
          <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
            <p className="text-xs text-driftwood uppercase tracking-wide mb-2">{t("profile.culturalContext")}</p>
            <p className="text-sm text-bark">{profile.cultural_context}</p>
          </div>
        )}

        {/* Account Upgrade (anonymous users only) */}
        <AccountUpgrade />

        {/* Data Export */}
        <DataExport />

        {/* Safety Plan */}
        <div className="bg-dawn rounded-echo-lg p-5 border border-mist">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-forest" />
            <p className="text-xs text-forest uppercase tracking-wide font-semibold">{t("profile.safetyResources")}</p>
          </div>
          <p className="text-sm text-driftwood mb-3">
            {t("profile.safetyDesc")}
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-bark font-medium">🇺🇸 988 Suicide & Crisis Lifeline: <span className="text-forest">988</span></p>
            <p className="text-bark font-medium">🌍 Crisis Text Line: Text <span className="text-forest">HELLO to 741741</span></p>
            <p className="text-bark font-medium">🇬🇧 Samaritans: <span className="text-forest">116 123</span></p>
          </div>
        </div>

        {/* Data Retention Notice */}
        <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
          <p className="text-xs text-driftwood uppercase tracking-wide mb-2">{t("profile.retention.title")}</p>
          <p className="text-sm text-driftwood">{t("profile.retention.desc")}</p>
        </div>

        {/* Account Deletion */}
        <AccountDeletion />
      </div>

      <Button variant="ghost" className="mt-8 text-care-alert" onClick={signOut}>
        <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t("profile.signOut")}
      </Button>
    </div>
    </>
  );
};

export default ProfilePage;
