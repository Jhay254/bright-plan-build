
-- Add onboarding fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN cultural_context TEXT,
  ADD COLUMN healing_goals TEXT[] DEFAULT '{}';
