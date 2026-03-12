
-- Wellbeing assessments table (PHQ-9, GAD-7)
CREATE TABLE public.wellbeing_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('phq9', 'gad7')),
  answers integer[] NOT NULL,
  total_score integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.wellbeing_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own assessments"
  ON public.wellbeing_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own assessments"
  ON public.wellbeing_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_wellbeing_assessments_user_type ON public.wellbeing_assessments (user_id, type, created_at DESC);
