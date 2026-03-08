
-- Table for verifiable CPD certificates
CREATE TABLE public.cpd_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cert_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  total_hours numeric NOT NULL,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  entry_ids uuid[] NOT NULL DEFAULT '{}'
);

ALTER TABLE public.cpd_certificates ENABLE ROW LEVEL SECURITY;

-- Volunteers manage own certs
CREATE POLICY "Volunteers manage own certs" ON public.cpd_certificates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Anyone can verify a cert (public read by cert_code)
CREATE POLICY "Anyone can verify certs" ON public.cpd_certificates
  FOR SELECT USING (true);

-- Public read policy for approved volunteer profiles (portfolio)
CREATE POLICY "Public can view approved volunteer profiles" ON public.volunteer_profiles
  FOR SELECT USING (is_approved = true);
