-- 1. Fix Student Profiles to link to College Profiles
ALTER TABLE public.student_profiles
ADD COLUMN college_id UUID REFERENCES public.college_profiles(id) ON DELETE SET NULL;

-- 2. Create assessment_assignments table
CREATE TABLE IF NOT EXISTS public.assessment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(assessment_id, student_id, application_id)
);

ALTER TABLE public.assessment_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own assignments"
    ON public.assessment_assignments FOR SELECT
    USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Orgs can view assignments for their jobs"
    ON public.assessment_assignments FOR SELECT
    USING (assessment_id IN (
        SELECT a.id FROM public.assessments a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.organization_profiles op ON j.org_id = op.id
        WHERE op.user_id = auth.uid()
    ));

-- 3. Trigger to assign assessments when applicant reaches "assessment" stage
CREATE OR REPLACE FUNCTION public.assign_assessments_on_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If application status becomes 'assessment'
  IF NEW.status = 'assessment' AND OLD.status IS DISTINCT FROM 'assessment' THEN
    -- Insert a pending assignment for every assessment attached to this job
    INSERT INTO public.assessment_assignments (assessment_id, student_id, application_id, status)
    SELECT a.id, NEW.student_id, NEW.id, 'pending'
    FROM public.assessments a
    WHERE a.job_id = NEW.job_id
    ON CONFLICT DO NOTHING;

    -- Send a notification directly via RPC equivalent
    PERFORM public.create_notification(
        (SELECT user_id FROM public.student_profiles WHERE id = NEW.student_id),
        'New Assessment',
        'You have been assigned a new assessment.',
        'info',
        '/dashboard/assessments'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_application_assessment_stage ON public.applications;
CREATE TRIGGER on_application_assessment_stage
AFTER UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.assign_assessments_on_status();


-- 4. Trigger to notify colleges when a student is placed
CREATE OR REPLACE FUNCTION public.notify_college_on_placement()
RETURNS TRIGGER AS $$
DECLARE
  _college_user_id UUID;
  _student_name TEXT;
  _job_title TEXT;
  _company_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    -- Get college user_id, student name, job title, company name
    SELECT cp.user_id, p.full_name, j.title, op.company_name
    INTO _college_user_id, _student_name, _job_title, _company_name
    FROM public.applications a
    JOIN public.student_profiles sp ON a.student_id = sp.id
    JOIN public.profiles p ON sp.user_id = p.user_id
    JOIN public.college_profiles cp ON sp.college_id = cp.id
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.organization_profiles op ON j.org_id = op.id
    WHERE a.id = NEW.application_id;

    IF _college_user_id IS NOT NULL THEN
      PERFORM public.create_notification(
        _college_user_id, 
        'Student Placement', 
        COALESCE(_student_name, 'A student') || ' has accepted an offer for ' || COALESCE(_job_title, 'a role') || ' at ' || COALESCE(_company_name, 'a company'), 
        'info', 
        '/dashboard/students'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_offer_accepted ON public.offers;
CREATE TRIGGER on_offer_accepted
AFTER UPDATE ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.notify_college_on_placement();


-- 5. Give Organizations read access to resumes tied to their jobs
-- Applications in the new schema use `resume_url TEXT`, but if we ever use `resume_id` or need the file
-- Actually, the resumes table stores parsed resumes for the AI.
-- We must allow Orgs to see the resumes if a candidate applies.
-- Using user_id isn't directly linked through the new schema's application, but we can link via student_profiles -> user_id
DROP POLICY IF EXISTS "Orgs view resumes for applications" ON public.resumes;
CREATE POLICY "Orgs view resumes for applications" ON public.resumes 
FOR SELECT TO authenticated 
USING (
  user_id IN (
    SELECT sp.user_id
    FROM public.applications a 
    JOIN public.student_profiles sp ON a.student_id = sp.id
    JOIN public.jobs j ON a.job_id = j.id 
    JOIN public.organization_profiles op ON j.org_id = op.id 
    WHERE op.user_id = auth.uid()
  )
);

-- 6. Trigger to notify student when interview is scheduled
CREATE OR REPLACE FUNCTION public.notify_on_interview_scheduled()
RETURNS TRIGGER AS $$
DECLARE _student_user_id UUID; _job_title TEXT;
BEGIN
  SELECT sp.user_id, j.title INTO _student_user_id, _job_title
  FROM public.applications a
  JOIN public.student_profiles sp ON a.student_id = sp.id
  JOIN public.jobs j ON a.job_id = j.id
  WHERE a.id = NEW.application_id;

  PERFORM public.create_notification(_student_user_id, ''Interview Scheduled'', ''An interview has been scheduled for your application to '' || COALESCE(_job_title, ''a position''), ''interview'', ''/dashboard/interviews'');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_interview_created ON public.interviews;
CREATE TRIGGER on_interview_created
AFTER INSERT ON public.interviews
FOR EACH ROW EXECUTE FUNCTION public.notify_on_interview_scheduled();

-- 7. Trigger to notify student when offer is sent
CREATE OR REPLACE FUNCTION public.notify_on_offer_sent()
RETURNS TRIGGER AS $$
DECLARE _student_user_id UUID; _job_title TEXT;
BEGIN
  SELECT sp.user_id, j.title INTO _student_user_id, _job_title
  FROM public.applications a
  JOIN public.student_profiles sp ON a.student_id = sp.id
  JOIN public.jobs j ON a.job_id = j.id
  WHERE a.id = NEW.application_id;

  PERFORM public.create_notification(_student_user_id, ''Offer Received!'', ''You have received an offer for '' || COALESCE(_job_title, ''a position''), ''offer'', ''/dashboard/applications'');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_offer_created ON public.offers;
CREATE TRIGGER on_offer_created
AFTER INSERT ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.notify_on_offer_sent();
