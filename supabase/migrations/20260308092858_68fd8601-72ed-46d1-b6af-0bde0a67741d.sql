
-- Edge function for account deletion (uses service role key)
-- Data retention: auto-delete message content 90 days after session closes
CREATE OR REPLACE FUNCTION public.purge_old_message_content()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _count INTEGER;
BEGIN
  UPDATE session_messages sm
  SET content = '[message removed — retention policy]'
  FROM cocoon_sessions cs
  WHERE sm.session_id = cs.id
    AND cs.status = 'closed'
    AND cs.ended_at < now() - INTERVAL '90 days'
    AND sm.content != '[message removed — retention policy]';
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

-- Schedule purge to run daily at 3am UTC (if pg_cron available)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('purge-old-messages', '0 3 * * *', 'SELECT public.purge_old_message_content()');
  END IF;
END;
$$;

-- Function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid UUID;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete all user data (order matters for FK constraints)
  DELETE FROM session_messages WHERE sender_id = _uid;
  DELETE FROM session_feedback WHERE user_id = _uid;
  DELETE FROM crisis_flags WHERE session_id IN (SELECT id FROM cocoon_sessions WHERE seeker_id = _uid);
  DELETE FROM cocoon_sessions WHERE seeker_id = _uid;
  DELETE FROM journal_entries WHERE user_id = _uid;
  DELETE FROM training_progress WHERE user_id = _uid;
  DELETE FROM cpd_entries WHERE user_id = _uid;
  DELETE FROM volunteer_availability WHERE user_id = _uid;
  DELETE FROM volunteer_profiles WHERE user_id = _uid;
  DELETE FROM user_roles WHERE user_id = _uid;
  DELETE FROM profiles WHERE user_id = _uid;

  -- Delete the auth user (this is allowed in security definer context)
  DELETE FROM auth.users WHERE id = _uid;

  RETURN TRUE;
END;
$$;
