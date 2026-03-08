
-- Volunteer profiles (extended info beyond base profile)
CREATE TABLE public.volunteer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation TEXT,
  background TEXT,
  specialisations TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT ARRAY['en'],
  is_approved BOOLEAN NOT NULL DEFAULT false,
  total_sessions INT NOT NULL DEFAULT 0,
  total_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  skills_endorsed TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Weekly availability (slots stored as day + hour ranges)
CREATE TABLE public.volunteer_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sun
  start_hour INT NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INT NOT NULL CHECK (end_hour >= 1 AND end_hour <= 24),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_of_week, start_hour)
);

-- Training modules progress
CREATE TABLE public.training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_key)
);

-- CPD (Continuing Professional Development) entries
CREATE TABLE public.cpd_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hours NUMERIC(5,2) NOT NULL CHECK (hours > 0),
  category TEXT NOT NULL DEFAULT 'training',
  certificate_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_entries ENABLE ROW LEVEL SECURITY;

-- Volunteer profiles policies
CREATE POLICY "Volunteers view own profile"
  ON public.volunteer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Volunteers insert own profile"
  ON public.volunteer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Volunteers update own profile"
  ON public.volunteer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all volunteer profiles"
  ON public.volunteer_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Availability policies
CREATE POLICY "Volunteers manage own availability"
  ON public.volunteer_availability FOR ALL
  USING (auth.uid() = user_id);

-- Training progress policies
CREATE POLICY "Volunteers manage own training"
  ON public.training_progress FOR ALL
  USING (auth.uid() = user_id);

-- CPD policies
CREATE POLICY "Volunteers manage own cpd"
  ON public.cpd_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all cpd"
  ON public.cpd_entries FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_volunteer_profiles_user ON public.volunteer_profiles(user_id);
CREATE INDEX idx_availability_user ON public.volunteer_availability(user_id);
CREATE INDEX idx_training_user ON public.training_progress(user_id);
CREATE INDEX idx_cpd_user ON public.cpd_entries(user_id);

-- Triggers
CREATE TRIGGER update_volunteer_profiles_updated_at
  BEFORE UPDATE ON public.volunteer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: after a session closes, update volunteer stats
CREATE OR REPLACE FUNCTION public.update_volunteer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _duration NUMERIC;
BEGIN
  IF NEW.status = 'closed' AND OLD.status != 'closed' AND NEW.volunteer_id IS NOT NULL THEN
    _duration := EXTRACT(EPOCH FROM (COALESCE(NEW.ended_at, now()) - COALESCE(NEW.started_at, NEW.created_at))) / 3600.0;
    _duration := LEAST(_duration, 4); -- cap at 4 hours
    
    UPDATE public.volunteer_profiles
    SET total_sessions = total_sessions + 1,
        total_hours = total_hours + ROUND(_duration::numeric, 2),
        updated_at = now()
    WHERE user_id = NEW.volunteer_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_session_closed_update_stats
  AFTER UPDATE ON public.cocoon_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_volunteer_stats();
