-- ─── 1. FIX RESUMES TABLE SCHEMA ───
-- If the table existed from an old project, it might be missing these columns.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resumes' AND column_name='created_at') THEN
        ALTER TABLE public.resumes ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resumes' AND column_name='updated_at') THEN
        ALTER TABLE public.resumes ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

-- ─── 2. NORMALIZE USER ROLES TO LOWERCASE ───
-- Fixes "STUDENT" vs "student" mismatch causing navigation redirects.
UPDATE public.user_roles 
SET role = LOWER(role::text)::app_role 
WHERE role::text != LOWER(role::text);

-- ─── 3. ENSURE UPDATED_AT TRIGGER EXISTS ───
-- Shared trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at_resumes ON public.resumes;
CREATE TRIGGER set_updated_at_resumes BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
