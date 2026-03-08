-- 1. Restrict cpd_certificates to owner-only (public verification uses RPC)
DROP POLICY IF EXISTS "Authenticated users can view certs" ON public.cpd_certificates;

CREATE POLICY "Owners and admins can view certs"
ON public.cpd_certificates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Remove broad public SELECT on peer_encouragements (use the view instead)
DROP POLICY IF EXISTS "Anyone can view visible encouragements" ON public.peer_encouragements;