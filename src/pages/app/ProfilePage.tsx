import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateAvatarSvg } from "@/lib/avatar";
import { LogOut, RefreshCw, Shield, Edit2, Check, X } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
];

const ProfilePage = () => {
  const { profile, role, user, signOut } = useAuth();
  const { toast } = useToast();
  const [editingAlias, setEditingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(profile?.alias ?? "");
  const [saving, setSaving] = useState(false);

  const avatarSrc = generateAvatarSvg(profile?.avatar_seed ?? "default", 96);

  const regenerateAvatar = async () => {
    if (!user) return;
    const newSeed = crypto.randomUUID();
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_seed: newSeed })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Avatar updated!" });
      // Force reload profile
      window.location.reload();
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEditingAlias(false);
      toast({ title: "Alias updated!" });
      window.location.reload();
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Language updated!" });
      window.location.reload();
    }
  };

  return (
    <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      <h1 className="font-heading text-2xl font-bold text-bark mb-6">Profile</h1>

      {/* Avatar + Alias */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img src={avatarSrc} alt="Avatar" className="w-16 h-16 rounded-echo-lg" />
          <button
            onClick={regenerateAvatar}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-forest text-primary-foreground flex items-center justify-center shadow-echo-1 hover:bg-fern transition-colors"
            title="Regenerate avatar"
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
              <button onClick={saveAlias} disabled={saving} className="text-affirm hover:opacity-80">
                <Check className="h-5 w-5" />
              </button>
              <button onClick={() => { setEditingAlias(false); setAliasValue(profile?.alias ?? ""); }} className="text-driftwood hover:opacity-80">
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-heading font-semibold text-bark text-lg">{profile?.alias ?? "—"}</p>
              <button onClick={() => setEditingAlias(true)} className="text-driftwood hover:text-forest">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-driftwood capitalize">{role ?? "—"} · {user?.is_anonymous ? "Anonymous" : user?.email}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
        {/* Language */}
        <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
          <p className="text-xs text-driftwood uppercase tracking-wide mb-3">Language</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => updateLanguage(lang.code)}
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

        {/* Healing Goals */}
        {profile?.healing_goals && profile.healing_goals.length > 0 && (
          <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
            <p className="text-xs text-driftwood uppercase tracking-wide mb-3">Healing Goals</p>
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
            <p className="text-xs text-driftwood uppercase tracking-wide mb-2">Cultural Context</p>
            <p className="text-sm text-bark">{profile.cultural_context}</p>
          </div>
        )}

        {/* Safety Plan */}
        <div className="bg-dawn rounded-echo-lg p-5 border border-mist">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-forest" />
            <p className="text-xs text-forest uppercase tracking-wide font-semibold">Safety Resources</p>
          </div>
          <p className="text-sm text-driftwood mb-3">
            If you or someone you know is in immediate danger, please reach out to local emergency services.
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-bark font-medium">🇺🇸 988 Suicide & Crisis Lifeline: <span className="text-forest">988</span></p>
            <p className="text-bark font-medium">🌍 Crisis Text Line: Text <span className="text-forest">HELLO to 741741</span></p>
            <p className="text-bark font-medium">🇬🇧 Samaritans: <span className="text-forest">116 123</span></p>
          </div>
        </div>
      </div>

      <Button variant="ghost" className="mt-8 text-care-alert" onClick={signOut}>
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
};

export default ProfilePage;
