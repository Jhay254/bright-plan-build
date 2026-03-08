import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { generateAvatarSvg } from "@/lib/avatar";
import { Award, Clock, MessageCircle, Star, ArrowLeft, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PortfolioPublic = () => {
  const { volunteerId } = useParams<{ volunteerId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-portfolio", volunteerId],
    queryFn: async () => {
      // Fetch volunteer profile
      const { data: vp, error: vpErr } = await supabase
        .from("volunteer_profiles")
        .select("*")
        .eq("user_id", volunteerId)
        .eq("is_approved", true)
        .single();
      if (vpErr || !vp) throw new Error("Portfolio not found or volunteer not approved");

      // Fetch profile for alias/avatar
      const { data: profile } = await supabase
        .from("profiles")
        .select("alias, avatar_seed")
        .eq("user_id", volunteerId)
        .single();

      // Fetch training progress
      const { data: tp } = await supabase
        .from("training_progress")
        .select("completed")
        .eq("user_id", volunteerId);
      const completedModules = tp?.filter((t) => t.completed).length ?? 0;
      const totalModules = 5; // matches TRAINING_MODULES in lib/volunteer.ts

      // Fetch CPD total hours
      const { data: cpd } = await supabase
        .from("cpd_entries")
        .select("hours")
        .eq("user_id", volunteerId);
      const cpdHours = cpd?.reduce((s, e) => s + Number(e.hours), 0) ?? 0;

      return {
        vp,
        alias: profile?.alias ?? "Volunteer",
        avatarSeed: profile?.avatar_seed ?? volunteerId,
        trainingPct: Math.round((completedModules / totalModules) * 100),
        cpdHours,
      };
    },
    enabled: !!volunteerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto space-y-6">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Portfolio not found</p>
          <p className="text-sm text-muted-foreground mb-4">This volunteer's portfolio is private or does not exist.</p>
          <Link to="/" className="text-primary underline text-sm">Back to home</Link>
        </div>
      </div>
    );
  }

  const { vp, alias, avatarSeed, trainingPct, cpdHours } = data;
  const avatar = generateAvatarSvg(avatarSeed, 96);

  const stats = [
    { icon: MessageCircle, label: "Sessions", value: vp.total_sessions, color: "text-forest" },
    { icon: Clock, label: "Hours", value: vp.total_hours.toFixed(1), color: "text-fern" },
    { icon: Star, label: "Skills", value: vp.skills_endorsed?.length ?? 0, color: "text-sunlight" },
  ];

  return (
    <>
      <Helmet>
        <title>{alias}'s Portfolio — Echo</title>
        <meta name="description" content={`${alias} is a verified Echo volunteer with ${vp.total_sessions} sessions and ${vp.total_hours} hours of peer support.`} />
        <meta property="og:title" content={`${alias}'s Portfolio — Echo`} />
        <meta property="og:description" content={`${alias} is a verified Echo volunteer with ${vp.total_sessions} sessions and ${vp.total_hours} hours of peer support.`} />
        <meta property="og:type" content="profile" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-6 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <img src={avatar} alt={alias} className="h-24 w-24 rounded-full mx-auto mb-4 ring-4 ring-mist" />
            <h1 className="font-heading text-2xl font-bold text-foreground">{alias}</h1>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-forest/10 text-forest rounded-full text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Volunteer
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-echo-md p-4 border border-border text-center">
                <s.icon className={`h-6 w-6 mx-auto mb-1.5 ${s.color}`} />
                <p className="font-heading text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Training & CPD */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-card rounded-echo-md p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Training</p>
              <p className="font-heading text-lg font-bold text-foreground">{trainingPct}%</p>
            </div>
            <div className="bg-card rounded-echo-md p-4 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CPD Hours</p>
              <p className="font-heading text-lg font-bold text-foreground">{cpdHours.toFixed(1)}</p>
            </div>
          </div>

          {/* Specialisations */}
          {vp.specialisations && vp.specialisations.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Specialisations</p>
              <div className="flex flex-wrap gap-1.5">
                {vp.specialisations.map((s: string) => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-mist text-forest border border-sage/30">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {vp.skills_endorsed && vp.skills_endorsed.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Skills Endorsed</p>
              <div className="flex flex-wrap gap-1.5">
                {vp.skills_endorsed.map((s: string) => (
                  <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-sunlight/15 text-foreground border border-sunlight/30">
                    <Award className="h-3 w-3" /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-10">
            This is a verified public portfolio. The volunteer's identity is protected.
          </p>
        </div>
      </div>
    </>
  );
};

export default PortfolioPublic;
