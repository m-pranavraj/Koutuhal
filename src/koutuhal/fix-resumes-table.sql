-- Copy into Supabase Dashboard → SQL Editor → Run
-- Then wait ~30 seconds for schema cache to refresh before uploading again.

ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS resume_text TEXT;
