import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, Activity, X } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useAssessmentReminder } from "@/hooks/use-assessment-reminder";
import { useState } from "react";

const HomePage = () => {
  const { user, profile, role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: shouldRemind } = useAssessmentReminder(user?.id);
  const [dismissed, setDismissed] = useState(false);

  if (role === "volunteer") {
    return <Navigate to="/app/volunteer" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Home — Echo</title>
        <meta name="description" content="Your safe space for healing. Start a session or open your journal." />
      </Helmet>
      <div className="px-6 pt-8">
      <div className="mb-8">
        <p className="text-sm text-driftwood font-medium">{t("home.welcomeBack")}</p>
        <h1 className="font-heading text-2xl font-bold text-bark">
          {profile?.alias ?? "Friend"}
        </h1>
      </div>

      {/* Wellbeing reminder nudge */}
      {shouldRemind && !dismissed && (
        <div className="relative mb-4 bg-accent/40 border border-accent rounded-echo-lg p-4 flex items-start gap-3">
          <Activity className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{t("assessment.reminderTitle")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("assessment.reminderDesc")}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs h-7"
              onClick={() => navigate("/app/wellbeing")}
            >
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              {t("assessment.takeNow")}
            </Button>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            aria-label={t("common.dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-dawn rounded-echo-lg p-6 shadow-echo-1">
          <h2 className="font-heading text-lg font-semibold text-bark mb-2">{t("home.howFeeling")}</h2>
          <p className="text-sm text-driftwood mb-4">{t("home.reachOut")}</p>
          <Button variant="hero" onClick={() => navigate("/app/cocoon")}>
            <MessageCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t("home.startSession")}
          </Button>
        </div>

        <div className="bg-card rounded-echo-lg p-6 shadow-echo-1 border border-border">
          <h2 className="font-heading text-lg font-semibold text-bark mb-2">{t("home.healingJournal")}</h2>
          <p className="text-sm text-driftwood mb-4">{t("home.journalDesc")}</p>
          <Button variant="outline" onClick={() => navigate("/app/journal")}>
            <BookOpen className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t("home.openJournal")}
          </Button>
        </div>

        <div className="bg-card rounded-echo-lg p-6 shadow-echo-1 border border-border">
          <h2 className="font-heading text-lg font-semibold text-bark mb-2">{t("assessment.pageTitle")}</h2>
          <p className="text-sm text-driftwood mb-4">{t("assessment.pageDesc")}</p>
          <Button variant="outline" onClick={() => navigate("/app/wellbeing")}>
            <Activity className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t("assessment.takeNow")}
          </Button>
        </div>
      </div>
      </div>
    </>
  );
};

export default HomePage;
