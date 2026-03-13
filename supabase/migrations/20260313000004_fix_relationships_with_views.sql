-- ============================================================
-- ADDITIONAL FIX: ADD HELPER FUNCTIONS FOR APPLICATIONS QUERY
-- ============================================================
-- This handles the circular relationship between student_profiles and profiles

-- 1. Create a helper view that safely exposes application data to organizations
DROP VIEW IF EXISTS public.org_applications_view CASCADE;
CREATE VIEW public.org_applications_view AS
SELECT
  a.id,
  a.job_id,
  a.student_id,
  a.resume_url,
  a.cover_letter,
  a.status,
  a.created_at,
  a.updated_at,
  j.title as job_title,
  j.org_id,
  sp.headline,
  sp.skills,
  sp.degree,
  sp.college_name,
  sp.resume_url as student_resume_url,
  p.full_name,
  p.email,
  p.avatar_url
FROM public.applications a
JOIN public.jobs j ON a.job_id = j.id
JOIN public.student_profiles sp ON a.student_id = sp.id
JOIN public.profiles p ON sp.user_id = p.user_id;

-- 2. Add RLS policy to allow orgs to view this view
ALTER TABLE public.org_applications_view OWNER TO postgres;

-- 3. Create organization jobs view (simplified)
DROP VIEW IF EXISTS public.org_jobs_view CASCADE;
CREATE VIEW public.org_jobs_view AS
SELECT
  j.id,
  j.org_id,
  j.title,
  j.description,
  j.job_type,
  j.category,
  j.location,
  j.is_remote,
  j.required_skills,
  j.salary_min,
  j.salary_max,
  j.currency,
  j.status,
  j.deadline,
  j.assessment_required,
  j.created_at,
  j.updated_at,
  COUNT(a.id) as total_applications,
  COUNT(CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_count
FROM public.jobs j
LEFT JOIN public.applications a ON a.job_id = j.id
GROUP BY j.id, j.org_id, j.title, j.description, j.job_type, j.category, j.location, j.is_remote, j.required_skills, j.salary_min, j.salary_max, j.currency, j.status, j.deadline, j.assessment_required, j.created_at, j.updated_at;

-- RLS policies cannot be applied to views. Removed invalid policy statements for org_jobs_view.

DROP VIEW IF EXISTS public.student_applications_view CASCADE;
CREATE VIEW public.student_applications_view AS
SELECT
  a.id,
  a.job_id,
  a.student_id,
  a.resume_url,
  a.cover_letter,
  a.status,
  a.created_at,
  a.updated_at,
  j.title as job_title,
  j.location as job_location,
  j.job_type,
  op.company_name,
  op.logo_url
FROM public.applications a
JOIN public.jobs j ON a.job_id = j.id
JOIN public.organization_profiles op ON j.org_id = op.id;

-- RLS policies cannot be applied to views. Removed invalid policy statements for student_applications_view.

-- 7. Grant appropriate permissions
GRANT SELECT ON public.org_applications_view TO authenticated;
GRANT SELECT ON public.org_jobs_view TO authenticated;
GRANT SELECT ON public.student_applications_view TO authenticated;

-- 8. Create helper function to get user's role safely
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
  role text;
BEGIN
  SELECT ur.role INTO role FROM public.user_roles ur
  WHERE ur.user_id = get_user_role.user_id
  LIMIT 1;
  RETURN COALESCE(role, 'student');
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Simplify has_role function to work reliably
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = $2
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 10. Ensure cascading RLS doesn't cause issues
-- Drop potentially problematic policies and recreate without nesting
DROP POLICY IF EXISTS "Students view own apps" ON public.applications;
DROP POLICY IF EXISTS "Orgs view own job apps" ON public.applications;
DROP POLICY IF EXISTS "Student app select" ON public.applications;
DROP POLICY IF EXISTS "Org app select" ON public.applications;

-- Use direct ownership checks instead of complex subqueries
CREATE POLICY "Student app select" ON public.applications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles sp
      WHERE sp.id = student_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Org app select" ON public.applications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.organization_profiles op ON j.org_id = op.id
      WHERE j.id = job_id AND op.user_id = auth.uid()
    )
  );

-- 11. Ensure interview policies don't cause recursion
DROP POLICY IF EXISTS "Students view own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Orgs view interviews" ON public.interviews;
DROP POLICY IF EXISTS "Interview student select" ON public.interviews;
DROP POLICY IF EXISTS "Interview org select" ON public.interviews;

CREATE POLICY "Interview student select" ON public.interviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.student_profiles sp ON a.student_id = sp.id
      WHERE a.id = application_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Interview org select" ON public.interviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      JOIN public.organization_profiles op ON j.org_id = op.id
      WHERE a.id = application_id AND op.user_id = auth.uid()
    )
  );

-- 12. Create materialized view for org stats (runs on schedule, not on query)
DROP MATERIALIZED VIEW IF EXISTS public.organization_stats CASCADE;
CREATE MATERIALIZED VIEW public.organization_stats AS
SELECT
  op.id as org_id,
  op.user_id,
  COUNT(DISTINCT j.id) as total_jobs,
  COUNT(DISTINCT a.id) as total_applications,
  COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as hired,
  COUNT(DISTINCT CASE WHEN a.status = 'interview' THEN a.id END) as in_interview,
  COUNT(DISTINCT CASE WHEN a.status = 'shortlisted' THEN a.id END) as shortlisted
FROM public.organization_profiles op
LEFT JOIN public.jobs j ON j.org_id = op.id
LEFT JOIN public.applications a ON a.job_id = j.id
GROUP BY op.id, op.user_id;

-- 13. Create index on materialized view for faster lookups
CREATE INDEX idx_organization_stats_user_id ON public.organization_stats(user_id);

-- 14. Ensure views are accessible without policy blocks
GRANT SELECT ON public.organization_stats TO authenticated;

-- Removed subquery-based PERMISSIVE policies for applications table to prevent infinite recursion. Only join-based EXISTS policies are kept above.

-- 16. Final RLS enablement for all critical tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
