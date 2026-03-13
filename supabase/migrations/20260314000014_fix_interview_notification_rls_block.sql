-- Prevent interview scheduling from failing due to notifications RLS.
-- If notification insert fails, the interview should still be created.

CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT DEFAULT 'info',
  _link TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (_user_id, _title, _message, _type, _link);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'create_notification skipped: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_on_interview_scheduled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _student_user_id UUID;
  _job_title TEXT;
BEGIN
  SELECT sp.user_id, j.title
  INTO _student_user_id, _job_title
  FROM public.applications a
  JOIN public.student_profiles sp ON a.student_id = sp.id
  JOIN public.jobs j ON a.job_id = j.id
  WHERE a.id = NEW.application_id;

  IF _student_user_id IS NOT NULL THEN
    PERFORM public.create_notification(
      _student_user_id,
      'Interview Scheduled',
      'An interview has been scheduled for your application to ' || COALESCE(_job_title, 'a position'),
      'interview',
      '/dashboard/interviews'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_interview_created ON public.interviews;
CREATE TRIGGER on_interview_created
AFTER INSERT ON public.interviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_interview_scheduled();
