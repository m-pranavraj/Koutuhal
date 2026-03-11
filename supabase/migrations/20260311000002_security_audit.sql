-- 1. Security Audit: Make student profiles private to tenants
DROP POLICY IF EXISTS "Student profiles viewable" ON public.student_profiles;
CREATE POLICY "Student profiles viewable" ON public.student_profiles FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR
  college_id IN (SELECT id FROM public.college_profiles WHERE user_id = auth.uid()) OR
  id IN (SELECT student_id FROM public.applications a JOIN public.jobs j ON a.job_id = j.id JOIN public.organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()) OR
  id IN (SELECT student_id FROM public.mentor_sessions ms JOIN public.mentor_profiles mp ON ms.mentor_id = mp.id WHERE mp.user_id = auth.uid()) OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Database Constraints: Prevent duplicate applications
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS unique_student_job;
ALTER TABLE public.applications ADD CONSTRAINT unique_student_job UNIQUE(student_id, job_id);

-- 3. Database Constraints: Prevent overlapping mentor sessions
CREATE OR REPLACE FUNCTION public.prevent_overlapping_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.mentor_sessions ms
    WHERE ms.mentor_id = NEW.mentor_id
      AND ms.session_date = NEW.session_date
      AND (ms.start_time, ms.end_time) OVERLAPS (NEW.start_time, NEW.end_time)
      AND ms.status IN ('pending', 'confirmed')
      AND ms.id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Double booking is not allowed for this mentor at this time.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_overlapping_sessions ON public.mentor_sessions;
CREATE TRIGGER check_overlapping_sessions BEFORE INSERT OR UPDATE ON public.mentor_sessions
FOR EACH ROW EXECUTE FUNCTION public.prevent_overlapping_sessions();

-- 4. Database Constraints: Prevent duplicate assessment submissions
ALTER TABLE public.assessment_submissions DROP CONSTRAINT IF EXISTS unique_assessment_submission;
ALTER TABLE public.assessment_submissions ADD CONSTRAINT unique_assessment_submission UNIQUE(assessment_id, student_id);

-- 5. Performance: Add missing indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_college_id ON public.student_profiles(college_id);

-- 6. Notification System: Additional triggers
-- Notify mentor when booked
CREATE OR REPLACE FUNCTION public.notify_on_mentor_booking()
RETURNS TRIGGER AS $$
DECLARE _mentor_user_id UUID; _student_name TEXT;
BEGIN
  SELECT user_id INTO _mentor_user_id FROM public.mentor_profiles WHERE id = NEW.mentor_id;
  SELECT p.full_name INTO _student_name FROM public.student_profiles sp JOIN public.profiles p ON sp.user_id = p.user_id WHERE sp.id = NEW.student_id;
  
  PERFORM public.create_notification(_mentor_user_id, 'New Mentor Session', COALESCE(_student_name, 'A student') || ' has booked a session with you.', 'mentor_session', '/dashboard/sessions');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_mentor_booking_created ON public.mentor_sessions;
CREATE TRIGGER on_mentor_booking_created AFTER INSERT ON public.mentor_sessions
FOR EACH ROW EXECUTE FUNCTION public.notify_on_mentor_booking();

-- Notify organization when offer is accepted
CREATE OR REPLACE FUNCTION public.notify_on_offer_accepted()
RETURNS TRIGGER AS $$
DECLARE _org_user_id UUID; _student_name TEXT; _job_title TEXT;
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted') OR (TG_OP = 'INSERT' AND NEW.status = 'accepted') THEN
    SELECT op.user_id, j.title INTO _org_user_id, _job_title
    FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.organization_profiles op ON j.org_id = op.id
    WHERE a.id = NEW.application_id;

    SELECT p.full_name INTO _student_name
    FROM public.applications a
    JOIN public.student_profiles sp ON a.student_id = sp.id
    JOIN public.profiles p ON sp.user_id = p.user_id
    WHERE a.id = NEW.application_id;

    PERFORM public.create_notification(_org_user_id, 'Offer Accepted', COALESCE(_student_name, 'A student') || ' accepted the offer for ' || COALESCE(_job_title, 'a position') || '.', 'offer', '/dashboard/applications');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_offer_status_changed ON public.offers;
CREATE TRIGGER on_offer_status_changed AFTER UPDATE OR INSERT ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.notify_on_offer_accepted();
