-- Add configurable attempt limits and attempt tracking

BEGIN;

ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 1;

ALTER TABLE public.assessments
DROP CONSTRAINT IF EXISTS assessments_max_attempts_check;

ALTER TABLE public.assessments
ADD CONSTRAINT assessments_max_attempts_check CHECK (max_attempts >= 1);

ALTER TABLE public.assessment_submissions
ADD COLUMN IF NOT EXISTS attempt_number integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_assessment_student
ON public.assessment_submissions(assessment_id, student_id, created_at DESC);

COMMIT;
