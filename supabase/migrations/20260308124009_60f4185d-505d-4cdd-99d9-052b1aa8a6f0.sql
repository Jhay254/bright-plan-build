-- 1. Replace overly broad public cert SELECT with authenticated-only
DROP POLICY IF EXISTS "Anyone can verify certs" ON public.cpd_certificates;

CREATE POLICY "Authenticated users can view certs"
ON public.cpd_certificates
FOR SELECT
TO authenticated
USING (true);

-- Create a narrow public RPC for cert verification by code
CREATE OR REPLACE FUNCTION public.verify_certificate(_cert_code text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'valid', EXISTS (SELECT 1 FROM cpd_certificates WHERE cert_code = _cert_code),
    'total_hours', (SELECT total_hours FROM cpd_certificates WHERE cert_code = _cert_code),
    'issued_at', (SELECT issued_at FROM cpd_certificates WHERE cert_code = _cert_code)
  )
$$;

-- 2. Restrict volunteer_profiles public policy to authenticated users
DROP POLICY IF EXISTS "Public can view approved volunteer profiles" ON public.volunteer_profiles;

CREATE POLICY "Authenticated view approved volunteer profiles"
ON public.volunteer_profiles
FOR SELECT
TO authenticated
USING (is_approved = true);

-- 3. Create a view for encouragements that hides user_id
CREATE OR REPLACE VIEW public.visible_encouragements AS
SELECT id, content, created_at
FROM public.peer_encouragements
WHERE is_visible = true;

-- Grant access to the view
GRANT SELECT ON public.visible_encouragements TO authenticated;
GRANT SELECT ON public.visible_encouragements TO anon;