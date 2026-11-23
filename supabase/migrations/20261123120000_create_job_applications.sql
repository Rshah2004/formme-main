-- Private store for public job applications and resumes.
-- Security model: browsers never touch this table or bucket. The job-application
-- edge function validates input and uses the service role. RLS is enabled with
-- no policies, and the bucket is private with no storage policies, so API roles
-- are denied by default.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-application-resumes',
  'job-application-resumes',
  false,
  5242880,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_slug text NOT NULL CHECK (job_slug IN ('independent-business-development-partner')),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email = lower(email)),
  location text CHECK (location IS NULL OR char_length(location) <= 120),
  linkedin_url text CHECK (linkedin_url IS NULL OR char_length(linkedin_url) <= 300),
  resume_path text NOT NULL UNIQUE CHECK (
    resume_path ~ '^independent-business-development-partner/[0-9a-f-]{36}\.(pdf|docx)$'
  ),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'accepted', 'rejected')),
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_slug, email)
);

CREATE INDEX job_applications_rate_limit_idx ON public.job_applications (ip_hash, created_at DESC);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.job_applications FROM PUBLIC, anon, authenticated, service_role;

-- Runs before upload so duplicate or rate-limited requests never reach storage.
CREATE FUNCTION public.check_job_application(p_job_slug text, p_email text, p_ip_hash text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN (
      SELECT count(*) FROM public.job_applications
      WHERE ip_hash = p_ip_hash AND created_at > now() - interval '1 hour'
    ) >= 5 THEN 'rate_limited'
    WHEN EXISTS (
      SELECT 1 FROM public.job_applications WHERE job_slug = p_job_slug AND email = p_email
    ) THEN 'duplicate'
    ELSE 'ok'
  END;
$$;

CREATE FUNCTION public.submit_job_application(
  p_job_slug text,
  p_full_name text,
  p_email text,
  p_location text,
  p_linkedin_url text,
  p_resume_path text,
  p_ip_hash text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  inserted_count integer;
BEGIN
  -- Serialize per client so concurrent requests cannot exceed the limit.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));

  IF (
    SELECT count(*) FROM public.job_applications
    WHERE ip_hash = p_ip_hash AND created_at > now() - interval '1 hour'
  ) >= 5 THEN
    RETURN 'rate_limited';
  END IF;

  INSERT INTO public.job_applications (
    job_slug, full_name, email, location, linkedin_url, resume_path, ip_hash
  ) VALUES (
    p_job_slug, p_full_name, p_email, p_location, p_linkedin_url, p_resume_path, p_ip_hash
  )
  ON CONFLICT (job_slug, email) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN CASE WHEN inserted_count = 1 THEN 'created' ELSE 'duplicate' END;
END;
$$;

REVOKE ALL ON FUNCTION public.check_job_application(text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_job_application(text, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.submit_job_application(text, text, text, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_job_application(text, text, text, text, text, text, text)
  TO service_role;
