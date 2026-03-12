import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ANSWER_OPTIONS_KEYS, getBand, type AssessmentMeta } from "@/lib/assessment-questions";

interface Props {
  meta: AssessmentMeta;
  onSubmit: (answers: number[], totalScore: number) => void;
  saving?: boolean;
}

const AssessmentQuestionnaire = ({ meta, onSubmit, saving }: Props) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(meta.questionKeys.length).fill(null)
  );

  const total = meta.questionKeys.length;
  const allAnswered = answers.every((a) => a !== null);

  const select = useCallback((value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = value;
      return next;
    });
  }, [current]);

  const handleSubmit = useCallback(() => {
    if (!allAnswered) return;
    const nums = answers as number[];
    const score = nums.reduce((a, b) => a + b, 0);
    onSubmit(nums, score);
  }, [answers, allAnswered, onSubmit]);

  // Results view after submission would be handled by the parent page
  const score = allAnswered ? (answers as number[]).reduce((a, b) => a + b, 0) : null;
  const band = score !== null ? getBand(meta, score) : null;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {meta.questionKeys.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              answers[i] !== null ? "bg-forest" : i === current ? "bg-fern" : "bg-stone"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <p className="text-xs text-driftwood mb-1">
        {current + 1} / {total}
      </p>
      <h2 className="font-heading text-lg font-semibold text-bark mb-1">
        {t("assessment.overPastTwoWeeks")}
      </h2>
      <p className="text-bark mb-6 leading-relaxed">
        {t(meta.questionKeys[current])}
      </p>

      {/* Options */}
      <div className="space-y-2 mb-8">
        {ANSWER_OPTIONS_KEYS.map((key, value) => (
          <button
            key={value}
            onClick={() => select(value)}
            className={`w-full text-left px-5 py-3.5 rounded-echo-md border-2 transition-all font-medium text-sm ${
              answers[current] === value
                ? "border-forest bg-dawn text-forest"
                : "border-stone bg-card text-bark hover:border-fern"
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {current > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setCurrent(current - 1)}>
            <ChevronLeft className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> {t("common.back")}
          </Button>
        ) : (
          <div />
        )}

        {current < total - 1 ? (
          <Button
            variant="hero"
            size="sm"
            disabled={answers[current] === null}
            onClick={() => setCurrent(current + 1)}
          >
            {t("onboarding.continue")} <ChevronRight className="h-4 w-4 ltr:ml-1 rtl:mr-1" />
          </Button>
        ) : (
          <Button variant="hero" disabled={!allAnswered || saving} onClick={handleSubmit}>
            {saving ? t("common.loading") : t("assessment.seeResults")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AssessmentQuestionnaire;
