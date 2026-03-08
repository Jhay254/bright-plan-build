
-- 16.1: Rate limit session creation — max 3 active sessions per seeker
CREATE OR REPLACE FUNCTION public.enforce_session_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO _active_count
  FROM cocoon_sessions
  WHERE seeker_id = NEW.seeker_id
    AND status IN ('requested', 'matched', 'active', 'wrap_up');

  IF _active_count >= 3 THEN
    RAISE EXCEPTION 'Session limit reached. You can have at most 3 active sessions.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_session_limit
  BEFORE INSERT ON cocoon_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_session_limit();

-- 16.2: Rate limit messages — max 60 per minute per user
CREATE OR REPLACE FUNCTION public.enforce_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO _recent_count
  FROM session_messages
  WHERE sender_id = NEW.sender_id
    AND created_at > now() - INTERVAL '1 minute';

  IF _recent_count >= 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending more messages.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_message_rate_limit
  BEFORE INSERT ON session_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_message_rate_limit();
