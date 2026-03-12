import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Heart, Brain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ASSESSMENT_META, getBand, type AssessmentType } from "@/lib/assessment-questions";
import { useAssessments, useLatestAssessment, useSubmitAssessment } from "@/hooks/use-assessments";
import AssessmentQuestionnaire from "@/components/assessment/AssessmentQuestionnaire";
import AssessmentChart from "@/components/assessment/AssessmentChart";
import { format } from "date-fns";

type View = "overview" | "take-phq9" | "take-gad7";

const WellbeingPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [view, setView] = useState<View>("overview");

  const { data: phq9History = [] } = useAssessments(user?.id, "phq9");
  const { data: gad7History = [] } = useAssessments(user?.id, "gad7");
  const { data: latestPhq9 } = useLatestAssessment(user?.id, "phq9");
  const { data: latestGad7 } = useLatestAssessment(user?.id, "gad7");
  const submitMutation = useSubmitAssessment();

  const handleSubmit = useCallback(
    (type: AssessmentType) => (answers: number[], totalScore: number) => {
      if (!user) return;
      submitMutation.mutate(
        { user_id: user.id, type, answers, total_score: totalScore },
        {
          onSuccess: () => {
            toast({ title: t("assessment.saved") });
            setView("overview");
          },
          onError: (e: any) => {
            toast({ title: t("common.error"), description: e.message, variant: "destructive" });
          },
        }
      );
    },
    [user, submitMutation, toast, t]
  );

  if (view === "take-phq9") {
    return (
      <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setView("overview")}>
          {t("common.back")}
        </Button>
        <h1 className="font-heading text-xl font-bold text-bark mb-2">{t("assessment.phq9.title")}</h1>
        <p className="text-sm text-driftwood mb-6">{t("assessment.phq9.desc")}</p>
        <AssessmentQuestionnaire
          meta={ASSESSMENT_META.phq9}
          onSubmit={handleSubmit("phq9")}
          saving={submitMutation.isPending}
        />
      </div>
    );
  }

  if (view === "take-gad7") {
    return (
      <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setView("overview")}>
          {t("common.back")}
        </Button>
        <h1 className="font-heading text-xl font-bold text-bark mb-2">{t("assessment.gad7.title")}</h1>
        <p className="text-sm text-driftwood mb-6">{t("assessment.gad7.desc")}</p>
        <AssessmentQuestionnaire
          meta={ASSESSMENT_META.gad7}
          onSubmit={handleSubmit("gad7")}
          saving={submitMutation.isPending}
        />
      </div>
    );
  }

  // Overview
  const renderCard = (
    type: AssessmentType,
    icon: React.ReactNode,
    latest: any | null,
    history: any[],
    onTake: () => void
  ) => {
    const meta = ASSESSMENT_META[type];
    const band = latest ? getBand(meta, latest.total_score) : null;

    return (
      <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <div>
            <h2 className="font-heading font-semibold text-bark">{t(meta.titleKey)}</h2>
            <p className="text-xs text-driftwood">{t(meta.descKey)}</p>
          </div>
        </div>

        {latest ? (
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-bark">{latest.total_score}</span>
              <span className="text-sm text-driftwood">/ {meta.maxScore}</span>
              <span className="text-sm font-medium" style={{ color: band?.color }}>
                {t(band?.labelKey ?? "")}
              </span>
            </div>
            <p className="text-xs text-driftwood">
              {t("assessment.lastTaken")}: {format(new Date(latest.created_at), "MMM d, yyyy")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-driftwood mb-4">{t("assessment.neverTaken")}</p>
        )}

        {history.length > 1 && <AssessmentChart data={history} meta={meta} />}

        <Button variant="outline" className="w-full mt-3" onClick={onTake}>
          {latest ? t("assessment.retake") : t("assessment.takeNow")}
          <ChevronRight className="h-4 w-4 ltr:ml-1 rtl:mr-1" />
        </Button>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{t("assessment.pageTitle")} — Echo</title>
        <meta name="description" content="Track your mental wellbeing with validated assessments." />
      </Helmet>
      <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
        <h1 className="font-heading text-2xl font-bold text-bark mb-1">{t("assessment.pageTitle")}</h1>
        <p className="text-sm text-driftwood mb-6">{t("assessment.pageDesc")}</p>

        <div className="space-y-4">
          {renderCard(
            "phq9",
            <div className="w-10 h-10 rounded-full bg-mist flex items-center justify-center">
              <Heart className="h-5 w-5 text-forest" />
            </div>,
            latestPhq9,
            phq9History,
            () => setView("take-phq9")
          )}

          {renderCard(
            "gad7",
            <div className="w-10 h-10 rounded-full bg-mist flex items-center justify-center">
              <Brain className="h-5 w-5 text-forest" />
            </div>,
            latestGad7,
            gad7History,
            () => setView("take-gad7")
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-dawn rounded-echo-lg p-4 border border-mist">
          <p className="text-xs text-driftwood leading-relaxed">
            {t("assessment.disclaimer")}
          </p>
        </div>
      </div>
    </>
  );
};

export default WellbeingPage;
