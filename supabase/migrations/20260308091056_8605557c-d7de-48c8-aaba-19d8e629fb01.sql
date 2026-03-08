
-- 7.1: Matching score function
-- Scores a volunteer against a session request (0-100)
CREATE OR REPLACE FUNCTION public.match_volunteer_score(
  _volunteer_id UUID,
  _session_language TEXT,
  _session_topic TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _score INTEGER := 0;
  _vp volunteer_profiles%ROWTYPE;
  _avail_count INTEGER;
  _current_dow INTEGER;
  _current_hour INTEGER;
BEGIN
  -- Get volunteer profile
  SELECT * INTO _vp FROM volunteer_profiles WHERE user_id = _volunteer_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- Must be approved
  IF NOT _vp.is_approved THEN RETURN 0; END IF;

  -- Language match (40 points)
  IF _vp.languages IS NOT NULL AND _session_language = ANY(_vp.languages) THEN
    _score := _score + 40;
  END IF;

  -- Specialisation overlap (25 points)
  IF _vp.specialisations IS NOT NULL AND array_length(_vp.specialisations, 1) > 0 THEN
    IF _session_topic ILIKE ANY(
      SELECT '%' || unnest || '%' FROM unnest(_vp.specialisations)
    ) THEN
      _score := _score + 25;
    END IF;
  END IF;

  -- Current availability (25 points)
  _current_dow := EXTRACT(DOW FROM now())::INTEGER;
  _current_hour := EXTRACT(HOUR FROM now())::INTEGER;
  SELECT COUNT(*) INTO _avail_count
  FROM volunteer_availability
  WHERE user_id = _volunteer_id
    AND day_of_week = _current_dow
    AND start_hour <= _current_hour
    AND end_hour > _current_hour;
  IF _avail_count > 0 THEN
    _score := _score + 25;
  END IF;

  -- Load balancing (10 points — fewer sessions = higher score)
  IF _vp.total_sessions <= 5 THEN
    _score := _score + 10;
  ELSIF _vp.total_sessions <= 20 THEN
    _score := _score + 5;
  END IF;

  RETURN _score;
END;
$$;

-- 7.2: Auto-match function called by trigger
CREATE OR REPLACE FUNCTION public.auto_match_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _best_volunteer UUID;
  _best_score INTEGER := 0;
  _vol RECORD;
BEGIN
  -- Only run on new sessions with 'requested' status
  IF NEW.status != 'requested' THEN
    RETURN NEW;
  END IF;

  -- Find the best matching approved volunteer
  FOR _vol IN
    SELECT vp.user_id, public.match_volunteer_score(vp.user_id, NEW.language, NEW.topic) AS score
    FROM volunteer_profiles vp
    WHERE vp.is_approved = TRUE
      AND vp.user_id != NEW.seeker_id
      -- Exclude volunteers already in an active session
      AND NOT EXISTS (
        SELECT 1 FROM cocoon_sessions cs
        WHERE cs.volunteer_id = vp.user_id
          AND cs.status IN ('matched', 'active', 'wrap_up')
      )
    ORDER BY score DESC, vp.total_sessions ASC
    LIMIT 1
  LOOP
    IF _vol.score >= 40 THEN
      _best_volunteer := _vol.user_id;
      _best_score := _vol.score;
    END IF;
  END LOOP;

  -- Auto-assign if score meets threshold
  IF _best_volunteer IS NOT NULL THEN
    NEW.volunteer_id := _best_volunteer;
    NEW.status := 'matched';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for auto-matching
CREATE TRIGGER trg_auto_match_session
  BEFORE INSERT ON public.cocoon_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_match_session();

-- 7.5: Update volunteer_accept_session to enforce is_approved
CREATE OR REPLACE FUNCTION public.volunteer_accept_session(_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _volunteer_id UUID;
  _is_approved BOOLEAN;
BEGIN
  _volunteer_id := auth.uid();

  -- Verify caller is a volunteer
  IF NOT public.has_role(_volunteer_id, 'volunteer') THEN
    RAISE EXCEPTION 'Only volunteers can accept sessions';
  END IF;

  -- Verify volunteer is approved
  SELECT is_approved INTO _is_approved
  FROM public.volunteer_profiles
  WHERE user_id = _volunteer_id;

  IF _is_approved IS NOT TRUE THEN
    RAISE EXCEPTION 'Your volunteer profile must be approved before accepting sessions';
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
