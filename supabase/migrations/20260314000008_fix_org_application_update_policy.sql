-- Ensure organizations can update application status for their own jobs
-- This fixes bulk move showing 0/N moved due to RLS policy block.

BEGIN;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Remove older/conflicting update policies
DROP POLICY IF EXISTS "Organizations update applications" ON public.applications;
DROP POLICY IF EXISTS "Orgs update job apps" ON public.applications;
DROP POLICY IF EXISTS "Orgs update app status" ON public.applications;

-- Recreate strict org update policy with both USING and WITH CHECK
CREATE POLICY "Organizations update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT j.id
    FROM public.jobs j
    JOIN public.organization_profiles op ON op.id = j.org_id
    WHERE op.user_id = auth.uid()
  )
)
WITH CHECK (
  job_id IN (
    SELECT j.id
    FROM public.jobs j
    JOIN public.organization_profiles op ON op.id = j.org_id
    WHERE op.user_id = auth.uid()
  )
);

-- Keep/ensure org select policy exists for own jobs
DROP POLICY IF EXISTS "Organizations view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Orgs view own job apps" ON public.applications;
DROP POLICY IF EXISTS "Org app select" ON public.applications;

CREATE POLICY "Organizations view applications for their jobs"
ON public.applications
FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT j.id
    FROM public.jobs j
    JOIN public.organization_profiles op ON op.id = j.org_id
    WHERE op.user_id = auth.uid()
  )
);

-- Ensure table privileges are present (RLS still limits actual rows)
GRANT SELECT, UPDATE ON public.applications TO authenticated;

COMMIT;
