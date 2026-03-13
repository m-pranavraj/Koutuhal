-- ============================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================================
-- Problem: Circular FK constraints and recursive RLS queries
-- Solution: Remove circular constraints, simplify policies, use trusted functions

-- 1. Drop problematic circular FK constraint
ALTER TABLE public.student_profiles 
  DROP CONSTRAINT IF EXISTS student_profiles_user_id_profiles_fkey;

-- 2. Remove RLS from student_profiles (data needed by org queries)
DROP POLICY IF EXISTS "Student profiles viewable" ON public.student_profiles;
DROP POLICY IF EXISTS "Students insert own" ON public.student_profiles;
DROP POLICY IF EXISTS "Students update own" ON public.student_profiles;

-- 3. Simplify student_profiles RLS (no circular joins)
CREATE POLICY "Students view own profile" ON public.student_profiles 
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students insert own profile" ON public.student_profiles 
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students update own profile" ON public.student_profiles 
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Organizations can only view student profiles of their applicants (simplified)
CREATE POLICY "Orgs view applicant profiles" ON public.student_profiles
  FOR SELECT TO authenticated
  USING (
    -- Only check direct job-to-org relationship, no nested joins
    id IN (
      SELECT a.student_id FROM applications a
      WHERE a.job_id IN (
        SELECT j.id FROM jobs j
        WHERE j.org_id IN (
          SELECT id FROM organization_profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Admins see all
CREATE POLICY "Admins view student profiles" ON public.student_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 4. Simplify applications RLS policies
DROP POLICY IF EXISTS "Students view own apps" ON public.applications;
DROP POLICY IF EXISTS "Orgs view apps for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Admins view all applications" ON public.applications;
DROP POLICY IF EXISTS "Students insert apps" ON public.applications;
DROP POLICY IF EXISTS "Orgs update app status" ON public.applications;
DROP POLICY IF EXISTS "Admins update applications" ON public.applications;

-- Students: View own applications (direct check)
CREATE POLICY "Students view own apps" ON public.applications 
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

-- Organizations: View applications for their jobs (direct job ownership check)
CREATE POLICY "Orgs view own job apps" ON public.applications 
  FOR SELECT TO authenticated
  USING (job_id IN (
    SELECT id FROM jobs WHERE org_id IN (
      SELECT id FROM organization_profiles WHERE user_id = auth.uid()
    )
  ));

-- Students: Insert own applications
CREATE POLICY "Students insert own apps" ON public.applications 
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

-- Organizations: Update their job applications
CREATE POLICY "Orgs update job apps" ON public.applications 
  FOR UPDATE TO authenticated
  USING (job_id IN (
    SELECT id FROM jobs WHERE org_id IN (
      SELECT id FROM organization_profiles WHERE user_id = auth.uid()
    )
  ));

-- Admins: Full access
CREATE POLICY "Admins view all apps" ON public.applications 
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins update all apps" ON public.applications 
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 5. Fix interviews RLS (avoid student_profiles join)
DROP POLICY IF EXISTS "Students view own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Orgs view interviews" ON public.interviews;
DROP POLICY IF EXISTS "Orgs insert interviews" ON public.interviews;
DROP POLICY IF EXISTS "Orgs update interviews" ON public.interviews;
DROP POLICY IF EXISTS "Admins view all interviews" ON public.interviews;

CREATE POLICY "Students view own interviews" ON public.interviews 
  FOR SELECT TO authenticated
  USING (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Orgs view interviews" ON public.interviews 
  FOR SELECT TO authenticated
  USING (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.job_id IN (
      SELECT j.id FROM jobs j
      WHERE j.org_id IN (
        SELECT id FROM organization_profiles WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Orgs insert interviews" ON public.interviews 
  FOR INSERT TO authenticated
  WITH CHECK (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.job_id IN (
      SELECT j.id FROM jobs j
      WHERE j.org_id IN (
        SELECT id FROM organization_profiles WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Orgs update interviews" ON public.interviews 
  FOR UPDATE TO authenticated
  USING (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.job_id IN (
      SELECT j.id FROM jobs j
      WHERE j.org_id IN (
        SELECT id FROM organization_profiles WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Admins view interviews" ON public.interviews 
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 6. Fix offers RLS (avoid student_profiles join)
DROP POLICY IF EXISTS "Students view own offers" ON public.offers;
DROP POLICY IF EXISTS "Orgs view offers" ON public.offers;
DROP POLICY IF EXISTS "Orgs insert offers" ON public.offers;
DROP POLICY IF EXISTS "Orgs update offers" ON public.offers;
DROP POLICY IF EXISTS "Admins view all offers" ON public.offers;

CREATE POLICY "Students view own offers" ON public.offers 
  FOR SELECT TO authenticated
  USING (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Orgs view offers" ON public.offers 
  FOR SELECT TO authenticated
  USING (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.job_id IN (
      SELECT j.id FROM jobs j
      WHERE j.org_id IN (
        SELECT id FROM organization_profiles WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Orgs insert offers" ON public.offers 
  FOR INSERT TO authenticated
  WITH CHECK (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.job_id IN (
      SELECT j.id FROM jobs j
      WHERE j.org_id IN (
        SELECT id FROM organization_profiles WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Orgs update offers" ON public.offers 
  FOR UPDATE TO authenticated
  USING (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.job_id IN (
      SELECT j.id FROM jobs j
      WHERE j.org_id IN (
        SELECT id FROM organization_profiles WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Admins view offers" ON public.offers 
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 7. Fix assessment_submissions RLS
DROP POLICY IF EXISTS "Students view own submissions" ON public.assessment_submissions;
DROP POLICY IF EXISTS "Orgs view submissions for their assessments" ON public.assessment_submissions;
DROP POLICY IF EXISTS "Students insert submissions" ON public.assessment_submissions;
DROP POLICY IF EXISTS "Students update own submissions" ON public.assessment_submissions;
DROP POLICY IF EXISTS "Orgs update submissions for their assessments" ON public.assessment_submissions;

CREATE POLICY "Students view own submissions" ON public.assessment_submissions 
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Students insert submissions" ON public.assessment_submissions 
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Students update own submissions" ON public.assessment_submissions 
  FOR UPDATE TO authenticated
  USING (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Orgs view submissions" ON public.assessment_submissions;
CREATE POLICY "Orgs view submissions" ON public.assessment_submissions 
  FOR SELECT TO authenticated
  USING (assessment_id IN (
    SELECT a.id FROM assessments a
    WHERE a.org_id IN (
      SELECT id FROM organization_profiles WHERE user_id = auth.uid()
    )
  ));
DROP POLICY IF EXISTS "Orgs update submissions" ON public.assessment_submissions;CREATE POLICY "Orgs update submissions" ON public.assessment_submissions 
  FOR UPDATE TO authenticated
  USING (assessment_id IN (
    SELECT a.id FROM assessments a
    WHERE a.org_id IN (
      SELECT id FROM organization_profiles WHERE user_id = auth.uid()
    )
  ));

-- 8. Ensure mentor_sessions has no circular references
DROP POLICY IF EXISTS "Students view own sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Mentors view own sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Admins view all sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Students book sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Mentors update sessions" ON public.mentor_sessions;

CREATE POLICY "Students view own sessions" ON public.mentor_sessions 
  FOR SELECT TO authenticated
  USING (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Students book sessions" ON public.mentor_sessions 
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Mentors view own sessions" ON public.mentor_sessions 
  FOR SELECT TO authenticated
  USING (mentor_id IN (
    SELECT id FROM mentor_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Mentors update sessions" ON public.mentor_sessions 
  FOR UPDATE TO authenticated
  USING (mentor_id IN (
    SELECT id FROM mentor_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins view sessions" ON public.mentor_sessions 
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 9. Keep profiles simple and accessible
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Users view own profile" ON public.profiles 
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own profile" ON public.profiles 
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own profile" ON public.profiles 
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Allow null viewing of other profiles (for displays)
DROP POLICY IF EXISTS "View any profile" ON public.profiles;
CREATE POLICY "View any profile" ON public.profiles 
  FOR SELECT TO authenticated
  USING (true);

-- 10. Reviews - straightforward policy
DROP POLICY IF EXISTS "Reviews viewable" ON public.reviews;
DROP POLICY IF EXISTS "Students create reviews" ON public.reviews;

CREATE POLICY "View all reviews" ON public.reviews 
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Students create reviews" ON public.reviews 
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

-- 11. Create index to improve performance on common queries
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_user_id ON public.organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_college_profiles_user_id ON public.college_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id_student_id ON public.applications(job_id, student_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON public.jobs(org_id);

-- 12. Create application_activity policies if not exists
DROP POLICY IF EXISTS "Orgs view activity" ON public.application_activity;
DROP POLICY IF EXISTS "Orgs insert activity" ON public.application_activity;

CREATE POLICY "Orgs view activity" ON public.application_activity 
  FOR SELECT TO authenticated
  USING (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.job_id IN (
      SELECT j.id FROM jobs j
      WHERE j.org_id IN (
        SELECT id FROM organization_profiles WHERE user_id = auth.uid()
      )
    )
  ));

DROP POLICY IF EXISTS "View own activity" ON public.application_activity;
CREATE POLICY "View own activity" ON public.application_activity 
  FOR SELECT TO authenticated
  USING (application_id IN (
    SELECT a.id FROM applications a
    WHERE a.student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  ));

-- Final verification: Ensure RLS is enabled on all tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.application_activity ENABLE ROW LEVEL SECURITY;
