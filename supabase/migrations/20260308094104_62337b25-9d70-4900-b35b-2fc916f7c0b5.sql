
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System inserts notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Index for fast unread count
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, read) WHERE read = false;

-- Trigger: notify seeker when session is matched
CREATE OR REPLACE FUNCTION public.notify_session_matched()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Notify seeker when status changes to matched
  IF NEW.status = 'matched' AND OLD.status = 'requested' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.seeker_id,
      'session_matched',
      'Volunteer matched!',
      'A volunteer has been matched to your session: ' || NEW.topic,
      '/app/cocoon/' || NEW.id
    );
  END IF;

  -- Notify volunteer when session becomes active
  IF NEW.status = 'active' AND OLD.status = 'matched' AND NEW.volunteer_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.volunteer_id,
      'session_active',
      'Session started',
      'The session "' || NEW.topic || '" is now active.',
      '/app/cocoon/' || NEW.id
    );
  END IF;

  -- Notify both when session closes
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.seeker_id,
      'session_closed',
      'Session ended',
      'Your session "' || NEW.topic || '" has been closed.',
      '/app/cocoon/' || NEW.id
    );
    IF NEW.volunteer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (
        NEW.volunteer_id,
        'session_closed',
        'Session ended',
        'The session "' || NEW.topic || '" has been closed.',
        '/app/cocoon/' || NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_session_matched
  AFTER UPDATE ON public.cocoon_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_session_matched();

-- Trigger: notify volunteer when approved
CREATE OR REPLACE FUNCTION public.notify_volunteer_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_volunteer_approved
  AFTER UPDATE ON public.volunteer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_volunteer_approved();
