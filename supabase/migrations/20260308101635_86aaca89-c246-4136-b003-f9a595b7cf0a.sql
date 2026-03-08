
-- Community resources (admin-managed)
CREATE TABLE public.community_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  emoji TEXT DEFAULT '📌',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_resources ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active resources
CREATE POLICY "Anyone can view active resources"
  ON public.community_resources FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage resources
CREATE POLICY "Admins manage resources"
  ON public.community_resources FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Peer encouragements (anonymous wall)
CREATE TABLE public.peer_encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.peer_encouragements ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read visible encouragements
CREATE POLICY "Anyone can view visible encouragements"
  ON public.peer_encouragements FOR SELECT
  TO authenticated
  USING (is_visible = true);

-- Users can post encouragements
CREATE POLICY "Users can post encouragements"
  ON public.peer_encouragements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all encouragements (moderation)
CREATE POLICY "Admins manage encouragements"
  ON public.peer_encouragements FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed some default resources
INSERT INTO public.community_resources (category, title, description, url, emoji, sort_order) VALUES
  ('crisis', '988 Suicide & Crisis Lifeline', 'Free 24/7 support in the US. Call or text 988.', 'https://988lifeline.org', '🆘', 1),
  ('crisis', 'Crisis Text Line', 'Text HELLO to 741741 for free crisis support.', 'https://www.crisistextline.org', '💬', 2),
  ('crisis', 'Samaritans (UK)', 'Free emotional support 24/7. Call 116 123.', 'https://www.samaritans.org', '🇬🇧', 3),
  ('learning', 'Understanding Trauma', 'NIMH guide to understanding and coping with trauma.', 'https://www.nimh.nih.gov/health/topics/coping-with-traumatic-events', '📖', 4),
  ('learning', 'Mindfulness for Beginners', 'Simple mindfulness exercises from Mindful.org.', 'https://www.mindful.org/how-to-meditate/', '🧘', 5),
  ('learning', 'Grief & Loss Resources', 'Practical guidance for navigating grief.', 'https://www.grief.com', '💛', 6),
  ('self-care', 'Grounding Techniques', '5-4-3-2-1 technique and other grounding exercises.', NULL, '🌿', 7),
  ('self-care', 'Sleep Hygiene Tips', 'Evidence-based tips for better sleep.', NULL, '😴', 8),
  ('community', 'NAMI Support Groups', 'Find local and online peer support groups.', 'https://www.nami.org/Support-Education/Support-Groups', '🤝', 9);
