
-- Mood enum for journal entries
CREATE TYPE public.journal_mood AS ENUM ('joyful', 'calm', 'hopeful', 'neutral', 'anxious', 'sad', 'angry', 'overwhelmed');

-- Journal entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood journal_mood,
  tags TEXT[] DEFAULT '{}',
  is_milestone BOOLEAN NOT NULL DEFAULT false,
  milestone_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS — private by default, NO admin/volunteer access
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- ONLY the owning user can access their own entries
CREATE POLICY "Users view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- NOTE: No admin policy — journal is strictly private

-- Indexes
CREATE INDEX idx_journal_user ON public.journal_entries(user_id);
CREATE INDEX idx_journal_created ON public.journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_mood ON public.journal_entries(user_id, mood);
CREATE INDEX idx_journal_tags ON public.journal_entries USING GIN(tags);

-- Updated_at trigger
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
