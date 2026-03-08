-- Fix security definer view by recreating with security_invoker
DROP VIEW IF EXISTS public.visible_encouragements;

CREATE VIEW public.visible_encouragements
WITH (security_invoker = true)
AS
SELECT id, content, created_at
FROM public.peer_encouragements
WHERE is_visible = true;

GRANT SELECT ON public.visible_encouragements TO authenticated;
GRANT SELECT ON public.visible_encouragements TO anon;