CREATE OR REPLACE FUNCTION public.claim_volunteer_role()
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

  -- Only allow if user has a volunteer_profile
  IF NOT EXISTS (SELECT 1 FROM volunteer_profiles WHERE user_id = _uid) THEN
    RAISE EXCEPTION 'No volunteer profile found. Create one first.';
  END IF;

  -- Upsert the volunteer role
  INSERT INTO user_roles (user_id, role)
  VALUES (_uid, 'volunteer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;