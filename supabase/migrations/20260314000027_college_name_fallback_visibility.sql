-- Improve college-side visibility when legacy student rows have college_name but missing college_id.

-- 1) Stronger backfill using normalized college names.
UPDATE public.student_profiles sp
SET college_id = cp.id,
    updated_at = now()
FROM public.college_profiles cp
WHERE sp.college_id IS NULL
  AND sp.college_name IS NOT NULL
  AND btrim(sp.college_name) <> ''
  AND lower(regexp_replace(btrim(sp.college_name), '\\s+', ' ', 'g')) = lower(regexp_replace(btrim(cp.college_name), '\\s+', ' ', 'g'));

-- 2) Expand student_profiles read policy for colleges with name fallback.
DROP POLICY IF EXISTS "Student profiles viewable" ON public.student_profiles;
CREATE POLICY "Student profiles viewable" ON public.student_profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR college_id IN (SELECT id FROM public.college_profiles WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.college_profiles cp
    WHERE cp.user_id = auth.uid()
      AND college_name IS NOT NULL
      AND btrim(college_name) <> ''
      AND lower(regexp_replace(btrim(college_name), '\\s+', ' ', 'g')) = lower(regexp_replace(btrim(cp.college_name), '\\s+', ' ', 'g'))
  )
  OR id IN (
    SELECT student_id
    FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.organization_profiles op ON j.org_id = op.id
    WHERE op.user_id = auth.uid()
  )
  OR id IN (
    SELECT student_id
    FROM public.mentor_sessions ms
    JOIN public.mentor_profiles mp ON ms.mentor_id = mp.id
    WHERE mp.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3) Recreate college read policies with college_name fallback.
DROP POLICY IF EXISTS "Colleges view student applications" ON public.applications;
CREATE POLICY "Colleges view student applications"
ON public.applications
FOR SELECT TO authenticated
USING (
  student_id IN (
    SELECT sp.id
    FROM public.student_profiles sp
    JOIN public.college_profiles cp
      ON cp.user_id = auth.uid()
     AND (
       cp.id = sp.college_id
       OR (
         sp.college_name IS NOT NULL
         AND btrim(sp.college_name) <> ''
         AND lower(regexp_replace(btrim(sp.college_name), '\\s+', ' ', 'g')) = lower(regexp_replace(btrim(cp.college_name), '\\s+', ' ', 'g'))
       )
     )
  )
);

DROP POLICY IF EXISTS "Colleges view student interviews" ON public.interviews;
CREATE POLICY "Colleges view student interviews"
ON public.interviews
FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT a.id
    FROM public.applications a
    JOIN public.student_profiles sp ON sp.id = a.student_id
    JOIN public.college_profiles cp
      ON cp.user_id = auth.uid()
     AND (
       cp.id = sp.college_id
       OR (
         sp.college_name IS NOT NULL
         AND btrim(sp.college_name) <> ''
         AND lower(regexp_replace(btrim(sp.college_name), '\\s+', ' ', 'g')) = lower(regexp_replace(btrim(cp.college_name), '\\s+', ' ', 'g'))
       )
     )
  )
);

DROP POLICY IF EXISTS "Colleges view student offers" ON public.offers;
CREATE POLICY "Colleges view student offers"
ON public.offers
FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT a.id
    FROM public.applications a
    JOIN public.student_profiles sp ON sp.id = a.student_id
    JOIN public.college_profiles cp
      ON cp.user_id = auth.uid()
     AND (
       cp.id = sp.college_id
       OR (
         sp.college_name IS NOT NULL
         AND btrim(sp.college_name) <> ''
         AND lower(regexp_replace(btrim(sp.college_name), '\\s+', ' ', 'g')) = lower(regexp_replace(btrim(cp.college_name), '\\s+', ' ', 'g'))
       )
     )
  )
);

DROP POLICY IF EXISTS "Colleges view application activity" ON public.application_activity;
CREATE POLICY "Colleges view application activity"
ON public.application_activity
FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT a.id
    FROM public.applications a
    JOIN public.student_profiles sp ON sp.id = a.student_id
    JOIN public.college_profiles cp
      ON cp.user_id = auth.uid()
     AND (
       cp.id = sp.college_id
       OR (
         sp.college_name IS NOT NULL
         AND btrim(sp.college_name) <> ''
         AND lower(regexp_replace(btrim(sp.college_name), '\\s+', ' ', 'g')) = lower(regexp_replace(btrim(cp.college_name), '\\s+', ' ', 'g'))
       )
     )
  )
);

NOTIFY pgrst, 'reload schema';
