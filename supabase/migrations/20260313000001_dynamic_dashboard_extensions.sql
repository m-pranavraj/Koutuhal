-- ============================================================
-- DYNAMIC DASHBOARD EXTENSIONS
-- ============================================================

-- 1. Application Activity (Timeline)
CREATE TABLE IF NOT EXISTS public.application_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status application_status NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.application_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for their applications"
ON public.application_activity FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT id FROM public.applications 
    WHERE student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    OR job_id IN (SELECT id FROM public.jobs WHERE org_id IN (SELECT id FROM public.organization_profiles WHERE user_id = auth.uid()))
  )
);

-- Trigger to auto-log status changes
CREATE OR REPLACE FUNCTION public.log_application_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.application_activity (application_id, status, title)
    VALUES (
      NEW.id, 
      NEW.status, 
      CASE 
        WHEN NEW.status = 'pending' THEN 'Application Submitted'
        WHEN NEW.status = 'screening' THEN 'Profile being reviewed'
        WHEN NEW.status = 'assessment' THEN 'Technical assessment assigned'
        WHEN NEW.status = 'interview' THEN 'Interview scheduled'
        WHEN NEW.status = 'selected' THEN 'Offer extended'
        WHEN NEW.status = 'accepted' THEN 'Offer accepted'
        WHEN NEW.status = 'rejected' THEN 'Application closed'
        ELSE 'Status updated to ' || NEW.status
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_activity_log
AFTER INSERT OR UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.log_application_activity();

-- 2. Recruiter Dashboard View
CREATE OR REPLACE VIEW public.recruiter_dashboard AS
SELECT 
  op.id AS org_id,
  op.user_id,
  COUNT(DISTINCT j.id) AS total_jobs,
  COUNT(DISTINCT a.id) AS total_applications,
  COUNT(DISTINCT i.id) AS total_interviews,
  COUNT(DISTINCT o.id) AS total_offers,
  COUNT(DISTINCT CASE WHEN o.status = 'accepted' THEN o.id END) AS total_hired,
  CASE 
    WHEN COUNT(DISTINCT a.id) > 0 
    THEN (COUNT(DISTINCT CASE WHEN o.status = 'accepted' THEN o.id END)::DECIMAL / COUNT(DISTINCT a.id) * 100)
    ELSE 0 
  END AS conversion_rate
FROM public.organization_profiles op
LEFT JOIN public.jobs j ON j.org_id = op.id
LEFT JOIN public.applications a ON a.job_id = j.id
LEFT JOIN public.interviews i ON i.application_id = a.id
LEFT JOIN public.offers o ON o.application_id = a.id
GROUP BY op.id, op.user_id;

-- 3. Job Match Scores View
-- (Simplistic version based on skill intersection, can be enhanced with AI/Vector search later)
CREATE OR REPLACE VIEW public.job_match_scores AS
SELECT 
  a.id AS application_id,
  a.student_id,
  a.job_id,
  CASE 
    WHEN j.required_skills IS NULL OR array_length(j.required_skills, 1) = 0 THEN 100
    ELSE (
      SELECT ROUND((COUNT(*)::DECIMAL / array_length(j.required_skills, 1) * 100), 0)
      FROM unnest(j.required_skills) AS req_skill
      WHERE EXISTS (
        SELECT 1 FROM unnest(sp.skills) AS stu_skill
        WHERE LOWER(stu_skill) = LOWER(req_skill)
      )
    )
  END AS match_score
FROM public.applications a
JOIN public.jobs j ON a.job_id = j.id
JOIN public.student_profiles sp ON a.student_id = sp.id;
