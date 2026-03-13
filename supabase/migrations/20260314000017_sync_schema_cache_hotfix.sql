-- Emergency sync for remote Supabase schema cache and missing objects.
-- Fixes:
-- 1) resumes.content missing in remote DB
-- 2) org_schedule_interview RPC missing in remote DB

ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS content JSONB;

CREATE OR REPLACE FUNCTION public.org_schedule_interview(
  p_application_id UUID,
  p_scheduled_at TIMESTAMPTZ,
  p_meeting_link TEXT DEFAULT NULL,
  p_interviewer_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id UUID;
  _interview_id UUID;
BEGIN
  SELECT id INTO _org_id
  FROM public.organization_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF _org_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'Only organization users can schedule interviews.');
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

  INSERT INTO public.interviews (application_id, scheduled_at, meeting_link, interviewer_name)
  VALUES (p_application_id, p_scheduled_at, NULLIF(p_meeting_link, ''), NULLIF(p_interviewer_name, ''))
  RETURNING id INTO _interview_id;

  RETURN jsonb_build_object('ok', true, 'interview_id', _interview_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.org_schedule_interview(UUID, TIMESTAMPTZ, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_schedule_interview(UUID, TIMESTAMPTZ, TEXT, TEXT) TO service_role;

-- Force PostgREST/Supabase schema cache refresh so new column/function are visible immediately.
NOTIFY pgrst, 'reload schema';
