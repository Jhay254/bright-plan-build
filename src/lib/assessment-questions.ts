// PHQ-9 and GAD-7 questions in plain, human language
// Scores: 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day

export const ASSESSMENT_TYPES = ["phq9", "gad7"] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export interface AssessmentMeta {
  titleKey: string;
  descKey: string;
  questionKeys: string[];
  maxScore: number;
  bands: { min: number; max: number; labelKey: string; color: string }[];
}

export const PHQ9: AssessmentMeta = {
  titleKey: "assessment.phq9.title",
  descKey: "assessment.phq9.desc",
  questionKeys: Array.from({ length: 9 }, (_, i) => `assessment.phq9.q${i + 1}`),
  maxScore: 27,
  bands: [
    { min: 0, max: 4, labelKey: "assessment.bands.minimal", color: "hsl(var(--affirm))" },
    { min: 5, max: 9, labelKey: "assessment.bands.mild", color: "hsl(var(--fern))" },
    { min: 10, max: 14, labelKey: "assessment.bands.moderate", color: "hsl(var(--ember))" },
    { min: 15, max: 19, labelKey: "assessment.bands.moderatelySevere", color: "hsl(var(--care-alert))" },
    { min: 20, max: 27, labelKey: "assessment.bands.severe", color: "hsl(var(--destructive))" },
  ],
};

export const GAD7: AssessmentMeta = {
  titleKey: "assessment.gad7.title",
  descKey: "assessment.gad7.desc",
  questionKeys: Array.from({ length: 7 }, (_, i) => `assessment.gad7.q${i + 1}`),
  maxScore: 21,
  bands: [
    { min: 0, max: 4, labelKey: "assessment.bands.minimal", color: "hsl(var(--affirm))" },
    { min: 5, max: 9, labelKey: "assessment.bands.mild", color: "hsl(var(--fern))" },
    { min: 10, max: 14, labelKey: "assessment.bands.moderate", color: "hsl(var(--ember))" },
    { min: 15, max: 21, labelKey: "assessment.bands.severe", color: "hsl(var(--destructive))" },
  ],
};

export const ASSESSMENT_META: Record<AssessmentType, AssessmentMeta> = {
  phq9: PHQ9,
  gad7: GAD7,
};

export const ANSWER_OPTIONS_KEYS = [
  "assessment.answers.notAtAll",
  "assessment.answers.severalDays",
  "assessment.answers.moreThanHalf",
  "assessment.answers.nearlyEveryDay",
] as const;

export function getBand(meta: AssessmentMeta, score: number) {
  return meta.bands.find((b) => score >= b.min && score <= b.max) ?? meta.bands[0];
}
