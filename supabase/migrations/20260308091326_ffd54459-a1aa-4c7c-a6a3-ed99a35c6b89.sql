
CREATE OR REPLACE FUNCTION public.close_stale_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _count1 INTEGER;
  _count2 INTEGER;
BEGIN
  -- Close sessions stuck in 'requested' for >24h
  UPDATE cocoon_sessions
  SET status = 'cancelled',
      ended_at = now(),
      updated_at = now()
  WHERE status = 'requested'
    AND created_at < now() - INTERVAL '24 hours';
  GET DIAGNOSTICS _count1 = ROW_COUNT;

  -- Close sessions 'active' for >4h with no recent messages
  UPDATE cocoon_sessions cs
  SET status = 'closed',
      ended_at = now(),
      updated_at = now()
  WHERE cs.status IN ('active', 'wrap_up')
    AND NOT EXISTS (
      SELECT 1 FROM session_messages sm
      WHERE sm.session_id = cs.id
        AND sm.created_at > now() - INTERVAL '4 hours'
    )
    AND cs.started_at < now() - INTERVAL '4 hours';
  GET DIAGNOSTICS _count2 = ROW_COUNT;

  RETURN _count1 + _count2;
END;
$$;
