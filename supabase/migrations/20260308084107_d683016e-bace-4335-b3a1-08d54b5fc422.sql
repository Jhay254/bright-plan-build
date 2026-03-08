
-- Session status enum
CREATE TYPE public.session_status AS ENUM ('requested', 'matched', 'active', 'wrap_up', 'closed', 'cancelled');

-- Urgency level enum
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'high', 'crisis');

-- Cocoon sessions table
CREATE TABLE public.cocoon_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status session_status NOT NULL DEFAULT 'requested',
  topic TEXT NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'medium',
  language TEXT NOT NULL DEFAULT 'en',
  preferences TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session messages table
CREATE TABLE public.session_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.cocoon_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session feedback table
CREATE TABLE public.session_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.cocoon_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  emotional_rating INT NOT NULL CHECK (emotional_rating >= 1 AND emotional_rating <= 5),
  felt_heard BOOLEAN,
  felt_safe BOOLEAN,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)
);

-- Enable RLS
ALTER TABLE public.cocoon_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_sessions_seeker ON public.cocoon_sessions(seeker_id);
CREATE INDEX idx_sessions_volunteer ON public.cocoon_sessions(volunteer_id);
CREATE INDEX idx_sessions_status ON public.cocoon_sessions(status);
CREATE INDEX idx_messages_session ON public.session_messages(session_id);
CREATE INDEX idx_messages_created ON public.session_messages(session_id, created_at);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cocoon_sessions;

-- RLS Policies for cocoon_sessions

-- Seekers can view their own sessions
CREATE POLICY "Seekers view own sessions"
  ON public.cocoon_sessions FOR SELECT
  USING (auth.uid() = seeker_id);

-- Volunteers can view sessions they're matched to
CREATE POLICY "Volunteers view matched sessions"
  ON public.cocoon_sessions FOR SELECT
  USING (auth.uid() = volunteer_id);

-- Volunteers can view requested sessions (for matching)
CREATE POLICY "Volunteers view requested sessions"
  ON public.cocoon_sessions FOR SELECT
  USING (
    status = 'requested'
    AND public.has_role(auth.uid(), 'volunteer')
  );

-- Seekers can create sessions
CREATE POLICY "Seekers create sessions"
  ON public.cocoon_sessions FOR INSERT
  WITH CHECK (auth.uid() = seeker_id);

-- Session participants can update (for status changes)
CREATE POLICY "Participants update sessions"
  ON public.cocoon_sessions FOR UPDATE
  USING (auth.uid() = seeker_id OR auth.uid() = volunteer_id);

-- Admins can view all sessions
CREATE POLICY "Admins view all sessions"
  ON public.cocoon_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for session_messages

-- Session participants can view messages
CREATE POLICY "Participants view messages"
  ON public.session_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cocoon_sessions
      WHERE id = session_id
      AND (seeker_id = auth.uid() OR volunteer_id = auth.uid())
    )
  );

-- Session participants can send messages
CREATE POLICY "Participants send messages"
  ON public.session_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.cocoon_sessions
      WHERE id = session_id
      AND (seeker_id = auth.uid() OR volunteer_id = auth.uid())
      AND status IN ('active', 'wrap_up')
    )
  );

-- RLS Policies for session_feedback

-- Users can view their own feedback
CREATE POLICY "Users view own feedback"
  ON public.session_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users insert own feedback"
  ON public.session_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.cocoon_sessions
      WHERE id = session_id
      AND (seeker_id = auth.uid() OR volunteer_id = auth.uid())
      AND status = 'closed'
    )
  );

-- Admins can view all feedback
CREATE POLICY "Admins view all feedback"
  ON public.session_feedback FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.cocoon_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to match a volunteer to a session
CREATE OR REPLACE FUNCTION public.volunteer_accept_session(_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _volunteer_id UUID;
BEGIN
  _volunteer_id := auth.uid();
  
  -- Verify caller is a volunteer
  IF NOT public.has_role(_volunteer_id, 'volunteer') THEN
    RAISE EXCEPTION 'Only volunteers can accept sessions';
  END IF;
  
  -- Atomically claim the session
  UPDATE public.cocoon_sessions
  SET volunteer_id = _volunteer_id,
      status = 'matched',
      updated_at = now()
  WHERE id = _session_id
    AND status = 'requested'
    AND volunteer_id IS NULL;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to transition session status
CREATE OR REPLACE FUNCTION public.transition_session(_session_id UUID, _new_status session_status)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_status session_status;
  _caller UUID;
  _seeker UUID;
  _volunteer UUID;
BEGIN
  _caller := auth.uid();
  
  SELECT status, seeker_id, volunteer_id
  INTO _current_status, _seeker, _volunteer
  FROM public.cocoon_sessions
  WHERE id = _session_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  -- Verify caller is a participant
  IF _caller != _seeker AND _caller != _volunteer THEN
    RAISE EXCEPTION 'Not a session participant';
  END IF;
  
  -- Validate transitions
  IF NOT (
    (_current_status = 'matched' AND _new_status = 'active') OR
    (_current_status = 'active' AND _new_status = 'wrap_up') OR
    (_current_status = 'wrap_up' AND _new_status = 'closed') OR
    (_current_status = 'requested' AND _new_status = 'cancelled' AND _caller = _seeker) OR
    (_current_status IN ('matched', 'active') AND _new_status = 'cancelled')
  ) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', _current_status, _new_status;
  END IF;
  
  UPDATE public.cocoon_sessions
  SET status = _new_status,
      started_at = CASE WHEN _new_status = 'active' THEN now() ELSE started_at END,
      ended_at = CASE WHEN _new_status IN ('closed', 'cancelled') THEN now() ELSE ended_at END,
      updated_at = now()
  WHERE id = _session_id;
  
  RETURN TRUE;
END;
$$;
