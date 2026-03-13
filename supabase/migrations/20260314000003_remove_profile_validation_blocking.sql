-- ============================================================
-- EMERGENCY FIX: Remove ALL profile validation blocking applications insert
-- ============================================================

-- 1. Drop ALL triggers on applications table
DROP TRIGGER IF EXISTS set_updated_at_applications ON public.applications;
DROP TRIGGER IF EXISTS on_application_created ON public.applications;
DROP TRIGGER IF EXISTS on_application_activity_log ON public.applications;
DROP TRIGGER IF EXISTS check_student_profile_complete ON public.applications;
DROP TRIGGER IF EXISTS validate_profile_before_application ON public.applications;
DROP TRIGGER IF EXISTS check_profile_complete ON public.applications;
DROP TRIGGER IF EXISTS trg_validate_student_profile ON public.applications;
DROP TRIGGER IF EXISTS check_profile_complete_before_insert ON public.applications;

-- 2. Drop ALL functions that might validate applications
DROP FUNCTION IF EXISTS public.check_application_prerequisites() CASCADE;
DROP FUNCTION IF EXISTS public.validate_student_profile() CASCADE;
DROP FUNCTION IF EXISTS public.validate_profile_before_apply() CASCADE;
DROP FUNCTION IF EXISTS public.check_student_profile_complete() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_profile_completion() CASCADE;

-- 3. Drop ALL existing policies on applications
DROP POLICY IF EXISTS "Students insert own apps" ON public.applications;
DROP POLICY IF EXISTS "Students insert applications" ON public.applications;
DROP POLICY IF EXISTS "Students insert" ON public.applications;
DROP POLICY IF EXISTS "Students view own apps" ON public.applications;
DROP POLICY IF EXISTS "Orgs view apps for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Orgs view own job apps" ON public.applications;
DROP POLICY IF EXISTS "Orgs update job apps" ON public.applications;
DROP POLICY IF EXISTS "Admins view all apps" ON public.applications;
DROP POLICY IF EXISTS "Admins update all apps" ON public.applications;
DROP POLICY IF EXISTS "Students can insert applications" ON public.applications;

-- 4. RE-ENABLE RLS (in case it was disabled)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 5. Create MINIMAL policies - only basics, no validation
-- Students can view their own applications
CREATE POLICY "Students view own applications" ON public.applications
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

-- Students can INSERT applications (NO validation)
CREATE POLICY "Students insert own applications" ON public.applications
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

-- Organizations can view applications for their jobs
CREATE POLICY "Organizations view applications for their jobs" ON public.applications
  FOR SELECT TO authenticated
  USING (job_id IN (SELECT id FROM jobs WHERE org_id IN (SELECT id FROM organization_profiles WHERE user_id = auth.uid())));

-- Organizations can update application status
CREATE POLICY "Organizations update applications" ON public.applications
  FOR UPDATE TO authenticated
  USING (job_id IN (SELECT id FROM jobs WHERE org_id IN (SELECT id FROM organization_profiles WHERE user_id = auth.uid())));

-- Admins have full access
CREATE POLICY "Admin management" ON public.applications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 6. Re-add ONLY the timestamp trigger (safe, non-blocking)
CREATE TRIGGER set_updated_at_applications_safe
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Re-add notification triggers (AFTER INSERT, so non-blocking)
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER AS $$
DECLARE org_user uuid;
BEGIN
  SELECT user_id INTO org_user
  FROM organization_profiles
  WHERE id = (SELECT org_id FROM jobs WHERE id = NEW.job_id);
  INSERT INTO notifications(user_id, title, message, type)
  VALUES(org_user, 'New Application', 'A student applied to your job.', 'info');
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_new_application ON public.applications;
CREATE TRIGGER notify_new_application 
  AFTER INSERT ON public.applications 
  FOR EACH ROW 
  EXECUTE FUNCTION public.notify_new_application();

-- 8. Re-add application activity logging (non-blocking)
CREATE OR REPLACE FUNCTION public.log_application_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO application_activity(application_id, event_type, event_description)
  VALUES(NEW.id, 'application_created', 'Student applied to job');
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_application_creation ON public.applications;
CREATE TRIGGER log_application_creation 
  AFTER INSERT ON public.applications 
  FOR EACH ROW 
  EXECUTE FUNCTION public.log_application_creation();

-- 9. Enforcement status update flow (non-blocking - AFTER UPDATE)
CREATE OR REPLACE FUNCTION public.enforce_application_flow()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status NOT IN ('assessment','rejected') THEN
    RAISE EXCEPTION 'Invalid transition from pending';
  END IF;
  IF OLD.status = 'assessment' AND NEW.status NOT IN ('interview','rejected') THEN
    RAISE EXCEPTION 'Invalid transition from assessment';
  END IF;
  IF OLD.status = 'interview' AND NEW.status NOT IN ('offer','rejected') THEN
    RAISE EXCEPTION 'Invalid transition from interview';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_application_flow ON public.applications;
CREATE TRIGGER enforce_application_flow 
  BEFORE UPDATE ON public.applications 
  FOR EACH ROW 
  EXECUTE FUNCTION public.enforce_application_flow();

-- Done. Applications insert is now ONLY blocked by:
-- 1. FK constraints (student_id, job_id must exist)
-- 2. UNIQUE constraint (prevent duplicate applications)
-- 3. RLS policy checking student_id ownership
-- NO profile completeness validation allowed.
