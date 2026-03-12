-- ============================================================
-- FINAL PRODUCTION STABILIZATION CONSOLIDATION
-- ============================================================

-- 1. Optimized Indexes for Performance & Search
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_application_id ON public.offers(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id ON public.mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_student_id ON public.mentor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_date ON public.mentor_sessions(session_date);

-- 2. Data Integrity Constraints

-- Prevent duplicate applications for the same job by the same student
-- First, clean up existing duplicates if any (keep the most recent)
DELETE FROM public.applications a
WHERE a.id NOT IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY student_id, job_id ORDER BY created_at DESC) as rn
        FROM public.applications
    ) t WHERE rn = 1
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_student_job_application') THEN
        ALTER TABLE public.applications ADD CONSTRAINT unique_student_job_application UNIQUE (student_id, job_id);
    END IF;
END $$;

-- Prevent overlapping mentor sessions for the same mentor
CREATE OR REPLACE FUNCTION public.check_mentor_session_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.mentor_sessions
        WHERE mentor_id = NEW.mentor_id
        AND session_date = NEW.session_date
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status IN ('confirmed', 'pending')
        AND (
            (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
        )
    ) THEN
        RAISE EXCEPTION 'This time slot overlaps with an existing session for this mentor.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_mentor_session_overlap ON public.mentor_sessions;
CREATE TRIGGER trg_check_mentor_session_overlap
BEFORE INSERT OR UPDATE ON public.mentor_sessions
FOR EACH ROW EXECUTE FUNCTION public.check_mentor_session_overlap();

-- 3. Enhanced Analytics Views (ensure they are up to date)

-- Ensure recruiter_dashboard is comprehensive
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
    THEN ROUND((COUNT(DISTINCT CASE WHEN o.status = 'accepted' THEN o.id END)::DECIMAL / COUNT(DISTINCT a.id) * 100), 1)
    ELSE 0 
  END AS conversion_rate
FROM public.organization_profiles op
LEFT JOIN public.jobs j ON j.org_id = op.id
LEFT JOIN public.applications a ON a.job_id = j.id
LEFT JOIN public.interviews i ON i.application_id = a.id
LEFT JOIN public.offers o ON o.application_id = a.id
GROUP BY op.id, op.user_id;

-- Ensure job_match_scores handles empty skill arrays gracefully
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
