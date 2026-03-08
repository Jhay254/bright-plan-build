
-- Admin stats function
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT json_build_object(
    'active_sessions', (SELECT COUNT(*) FROM cocoon_sessions WHERE status IN ('requested','matched','active','wrap_up')),
    'total_sessions', (SELECT COUNT(*) FROM cocoon_sessions),
    'total_seekers', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'seeker'),
    'approved_volunteers', (SELECT COUNT(*) FROM volunteer_profiles WHERE is_approved = true),
    'pending_approvals', (SELECT COUNT(*) FROM volunteer_profiles WHERE is_approved = false),
    'unresolved_crisis', (SELECT COUNT(*) FROM crisis_flags WHERE resolved = false)
  ) INTO _result;

  RETURN _result;
END;
$$;

-- Admin function to approve/reject volunteer
CREATE OR REPLACE FUNCTION public.admin_set_volunteer_approval(_volunteer_user_id UUID, _approved BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  UPDATE volunteer_profiles
  SET is_approved = _approved,
      updated_at = now()
  WHERE user_id = _volunteer_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Volunteer profile not found';
  END IF;

  RETURN TRUE;
END;
$$;

-- Admin function to set user role
CREATE OR REPLACE FUNCTION public.admin_set_user_role(_target_user_id UUID, _new_role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Upsert role
  INSERT INTO user_roles (user_id, role)
  VALUES (_target_user_id, _new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;
