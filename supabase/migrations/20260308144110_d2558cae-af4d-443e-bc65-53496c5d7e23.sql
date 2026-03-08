
CREATE OR REPLACE FUNCTION public.notify_volunteer_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- In-app notification: Approved
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

  -- In-app notification: Rejected
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

  -- Email notification via edge function (approval or rejection)
  IF (NEW.is_approved = true AND OLD.is_approved = false)
     OR (NEW.is_approved = false AND NEW.rejection_reason IS NOT NULL AND (OLD.rejection_reason IS NULL OR OLD.rejection_reason != NEW.rejection_reason))
  THEN
    PERFORM net.http_post(
      url := 'https://redbpniknprlcyxohysn.supabase.co/functions/v1/notify-volunteer-email',
      body := json_build_object(
        'user_id', NEW.user_id,
        'approved', NEW.is_approved,
        'rejection_reason', NEW.rejection_reason
      )::jsonb,
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$function$;
