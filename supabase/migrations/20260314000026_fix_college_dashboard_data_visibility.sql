-- Fix college dashboard visibility and legacy student-college mapping.

-- 1) Backfill missing college_id using legacy college_name matches.
UPDATE public.student_profiles sp
SET college_id = cp.id,
    updated_at = now()
FROM public.college_profiles cp
WHERE sp.college_id IS NULL
  AND sp.college_name IS NOT NULL
  AND btrim(sp.college_name) <> ''
  AND lower(btrim(sp.college_name)) = lower(btrim(cp.college_name));

-- 2) Let colleges read applications for their students.
DROP POLICY IF EXISTS "Colleges view student applications" ON public.applications;
CREATE POLICY "Colleges view student applications"
ON public.applications
FOR SELECT TO authenticated
USING (
  student_id IN (
    SELECT sp.id
    FROM public.student_profiles sp
    JOIN public.college_profiles cp ON cp.id = sp.college_id
    WHERE cp.user_id = auth.uid()
  )
);

-- 3) Let colleges read interviews for their students' applications.
DROP POLICY IF EXISTS "Colleges view student interviews" ON public.interviews;
CREATE POLICY "Colleges view student interviews"
ON public.interviews
FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT a.id
    FROM public.applications a
    JOIN public.student_profiles sp ON sp.id = a.student_id
    JOIN public.college_profiles cp ON cp.id = sp.college_id
    WHERE cp.user_id = auth.uid()
  )
);

-- 4) Let colleges read offers for their students' applications.
DROP POLICY IF EXISTS "Colleges view student offers" ON public.offers;
CREATE POLICY "Colleges view student offers"
ON public.offers
FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT a.id
    FROM public.applications a
    JOIN public.student_profiles sp ON sp.id = a.student_id
    JOIN public.college_profiles cp ON cp.id = sp.college_id
    WHERE cp.user_id = auth.uid()
  )
);

-- 5) Let colleges read activity for their students' applications.
DROP POLICY IF EXISTS "Colleges view application activity" ON public.application_activity;
CREATE POLICY "Colleges view application activity"
ON public.application_activity
FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT a.id
    FROM public.applications a
    JOIN public.student_profiles sp ON sp.id = a.student_id
    JOIN public.college_profiles cp ON cp.id = sp.college_id
    WHERE cp.user_id = auth.uid()
  )
);

GRANT SELECT ON public.applications TO authenticated;
GRANT SELECT ON public.interviews TO authenticated;
GRANT SELECT ON public.offers TO authenticated;
GRANT SELECT ON public.application_activity TO authenticated;

NOTIFY pgrst, 'reload schema';
