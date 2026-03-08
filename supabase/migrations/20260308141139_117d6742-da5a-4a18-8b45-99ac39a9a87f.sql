-- 1. Add rejection_reason column
ALTER TABLE public.volunteer_profiles ADD COLUMN rejection_reason TEXT DEFAULT NULL;

-- 2. Update admin_set_volunteer_approval to accept optional rejection reason
CREATE OR REPLACE FUNCTION public.admin_set_volunteer_approval(
  _volunteer_user_id uuid,
  _approved boolean,
  _rejection_reason text DEFAULT NULL
)
RETURNS boolean
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
      rejection_reason = CASE WHEN _approved THEN NULL ELSE _rejection_reason END,
      updated_at = now()
  WHERE user_id = _volunteer_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Volunteer profile not found';
  END IF;

  RETURN TRUE;
END;
$$;

-- 3. Update notify_volunteer_approved to also handle rejections
CREATE OR REPLACE FUNCTION public.notify_volunteer_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Approved
  IF NEW.is_approved = true AND OLD.is_approved = false THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.user_id,
      'volunteer_approved',
      'You''re approved!',
      'Your volunteer profile has been approved. You can now accept sessions.',
      '/app/volunteer'
    );
  END IF;

  -- Rejected
  IF NEW.is_approved = false AND OLD.is_approved = false AND NEW.rejection_reason IS NOT NULL AND (OLD.rejection_reason IS NULL OR OLD.rejection_reason != NEW.rejection_reason) THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.user_id,
      'volunteer_rejected',
      'Application update',
      'Your volunteer application was not approved: ' || NEW.rejection_reason,
      '/app/volunteer'
    );
  END IF;

  RETURN NEW;
END;
$$;