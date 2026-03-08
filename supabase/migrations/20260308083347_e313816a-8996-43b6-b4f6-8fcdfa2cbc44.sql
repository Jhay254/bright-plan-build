
-- Fix search_path for generate_alias
CREATE OR REPLACE FUNCTION public.generate_alias()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  adjectives TEXT[] := ARRAY['Gentle', 'Quiet', 'Bright', 'Calm', 'Kind', 'Warm', 'Brave', 'Soft', 'True', 'Deep', 'Still', 'Free', 'Pure', 'Wild', 'Bold'];
  nouns TEXT[] := ARRAY['Oak', 'River', 'Star', 'Moon', 'Wind', 'Cloud', 'Leaf', 'Stone', 'Wave', 'Rain', 'Light', 'Dawn', 'Fern', 'Sky', 'Sage'];
  adj TEXT;
  noun TEXT;
  num INT;
BEGIN
  adj := adjectives[1 + floor(random() * array_length(adjectives, 1))::int];
  noun := nouns[1 + floor(random() * array_length(nouns, 1))::int];
  num := floor(random() * 100)::int;
  RETURN adj || noun || num::text;
END;
$$;
