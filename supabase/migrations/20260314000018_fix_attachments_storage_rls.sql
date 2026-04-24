-- Secure offer creation RPC and notification hardening.
-- Fixes:
-- 1) 403 on direct INSERT into public.offers
-- 2) notifications RLS failure blocking offer insert triggers

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

CREATE OR REPLACE FUNCTION public.notify_on_offer_sent()
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
      'Offer Received!',
      'You have received an offer for ' || COALESCE(_job_title, 'a position'),
      'offer',
      '/dashboard/applications'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_offer_created ON public.offers;
CREATE TRIGGER on_offer_created
AFTER INSERT ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_offer_sent();

CREATE OR REPLACE FUNCTION public.org_issue_offer(
  p_application_id UUID,
  p_salary TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_offer_letter_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id UUID;
  _offer_id UUID;
BEGIN
  SELECT id INTO _org_id
  FROM public.organization_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF _org_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'Only organization users can issue offers.');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id
      AND j.org_id = _org_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'You do not have access to this application.');
  END IF;

  INSERT INTO public.offers (application_id, salary, start_date, offer_letter_url, status)
  VALUES (p_application_id, NULLIF(p_salary, ''), p_start_date, NULLIF(p_offer_letter_url, ''), 'issued')
  RETURNING id INTO _offer_id;

  BEGIN
    INSERT INTO public.application_activity(application_id, event_type, event_description)
    VALUES (
      p_application_id,
      'Offer Issued',
      'A formal offer has been issued with a salary of ' || COALESCE(NULLIF(p_salary, ''), 'negotiable') || '.'
    );
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;

  RETURN jsonb_build_object('ok', true, 'offer_id', _offer_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.org_issue_offer(UUID, TEXT, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_issue_offer(UUID, TEXT, DATE, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
