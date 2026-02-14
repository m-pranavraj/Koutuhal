-- Run this in Supabase Dashboard → SQL Editor
-- Creates/updates tables and storage bucket for Koutuhal resume upload

-- 1) Users table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Resumes table – ensure required columns exist
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  resume_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- If resumes table already exists but is missing file_url, add it:
-- ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_url TEXT;
-- ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS resume_text TEXT;
-- ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- 3) Analyses table (for /api/analyze)
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  role TEXT,
  job_description TEXT,
  score INTEGER,
  strengths JSONB,
  gaps JSONB,
  better_roles JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4) Storage bucket "resumes" (create manually in Dashboard → Storage → New bucket, name: resumes, Public: ON)
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: allow service role to upload (API uses service role key)
CREATE POLICY "Service role full access on resumes bucket"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');

-- 5) RLS (optional – enable if you use anon key elsewhere)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Policy: allow service role full access (API uses service_role key)
CREATE POLICY "Service role all users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role all resumes" ON public.resumes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role all analyses" ON public.analyses FOR ALL TO service_role USING (true) WITH CHECK (true);
