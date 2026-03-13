
-- Forum posts table with threading support
CREATE TABLE public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'general',
  title text,
  content text NOT NULL,
  parent_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  is_hidden boolean NOT NULL DEFAULT false,
  hidden_by uuid,
  hidden_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_posts_parent ON public.forum_posts(parent_id);
CREATE INDEX idx_forum_posts_user ON public.forum_posts(user_id);
CREATE INDEX idx_forum_posts_created ON public.forum_posts(created_at DESC);

-- Enable RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can view non-hidden posts (or their own hidden posts)
CREATE POLICY "Users view visible posts"
  ON public.forum_posts FOR SELECT
  TO authenticated
  USING (is_hidden = false OR auth.uid() = user_id);

-- RLS: Authenticated users create their own posts
CREATE POLICY "Users create own posts"
  ON public.forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update their own posts
CREATE POLICY "Users update own posts"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS: Admins and volunteers can see all posts (including hidden) for moderation
CREATE POLICY "Moderators view all posts"
  ON public.forum_posts FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'volunteer')
  );

-- RLS: Admins and volunteers can update any post (for moderation)
CREATE POLICY "Moderators update posts"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'volunteer')
  );

-- RLS: Admins can delete posts
CREATE POLICY "Admins delete posts"
  ON public.forum_posts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- View for anonymous forum posts (strips user_id, shows alias)
CREATE OR REPLACE VIEW public.forum_posts_anonymous AS
SELECT
  fp.id,
  fp.category,
  fp.title,
  fp.content,
  fp.parent_id,
  fp.is_hidden,
  fp.created_at,
  fp.updated_at,
  p.alias AS author_alias,
  p.avatar_seed AS author_avatar_seed,
  fp.user_id
FROM public.forum_posts fp
LEFT JOIN public.profiles p ON p.user_id = fp.user_id;
