CREATE TABLE public.crisis_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.cocoon_sessions(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES public.session_messages(id) ON DELETE CASCADE,
  flagged_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid,
  resolved_at timestamptz,
  notes text
);

ALTER TABLE public.crisis_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage crisis flags"
  ON public.crisis_flags FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Participants can insert crisis flags"
  ON public.crisis_flags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cocoon_sessions cs
      WHERE cs.id = crisis_flags.session_id
        AND (cs.seeker_id = auth.uid() OR cs.volunteer_id = auth.uid())
    )
  );

CREATE POLICY "Participants can view crisis flags for their sessions"
  ON public.crisis_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cocoon_sessions cs
      WHERE cs.id = crisis_flags.session_id
        AND (cs.seeker_id = auth.uid() OR cs.volunteer_id = auth.uid())
    )
  );