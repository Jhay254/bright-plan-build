import type { Database } from "@/integrations/supabase/types";
import { Award, Clock, MessageCircle, Star } from "lucide-react";

type VolunteerProfile = Database["public"]["Tables"]["volunteer_profiles"]["Row"];

interface ImpactPortfolioProps {
  profile: VolunteerProfile;
}

const ImpactPortfolio = ({ profile }: ImpactPortfolioProps) => {
  const stats = [
    { icon: MessageCircle, label: "Sessions", value: profile.total_sessions, color: "text-forest" },
    { icon: Clock, label: "Hours", value: profile.total_hours.toFixed(1), color: "text-fern" },
    { icon: Star, label: "Skills", value: profile.skills_endorsed?.length ?? 0, color: "text-sunlight" },
  ];

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-bark mb-4">Impact Portfolio</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-echo-md p-4 border border-border text-center">
            <s.icon className={`h-6 w-6 mx-auto mb-1.5 ${s.color}`} />
            <p className="font-heading text-xl font-bold text-bark">{s.value}</p>
            <p className="text-[10px] text-driftwood uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Specialisations */}
      {profile.specialisations && profile.specialisations.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-driftwood uppercase tracking-wide mb-2">Specialisations</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.specialisations.map((s) => (
              <span key={s} className="px-3 py-1 rounded-echo-pill text-xs font-medium bg-mist text-forest border border-sage/30">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills endorsed */}
      {profile.skills_endorsed && profile.skills_endorsed.length > 0 && (
        <div>
          <p className="text-xs text-driftwood uppercase tracking-wide mb-2">Skills Endorsed</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills_endorsed.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-echo-pill text-xs font-medium bg-sunlight/15 text-bark border border-sunlight/30">
                <Award className="h-3 w-3" /> {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {profile.total_sessions === 0 && (
        <div className="bg-dawn rounded-echo-md p-6 text-center mt-4">
          <p className="text-sm text-driftwood">Complete your training and start sessions to build your portfolio.</p>
        </div>
      )}
    </div>
  );
};

export default ImpactPortfolio;
