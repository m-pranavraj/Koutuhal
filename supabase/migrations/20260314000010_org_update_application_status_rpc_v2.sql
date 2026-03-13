-- Debuggable and reliable org status update RPC
-- Returns structured result so frontend can show exact failure reason.

BEGIN;

CREATE OR REPLACE FUNCTION public.org_update_application_status_v2(
  p_app_id uuid,
  p_status public.application_status
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed boolean;
  v_before public.application_status;
  v_after public.application_status;
BEGIN
  SELECT a.status INTO v_before
  FROM public.applications a
  WHERE a.id = p_app_id;

  IF v_before IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'application_not_found',
      'app_id', p_app_id
    );
  END IF;

  -- Ensure caller owns the job tied to this application
  SELECT EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    JOIN public.organization_profiles op ON op.id = j.org_id
    WHERE a.id = p_app_id
      AND op.user_id = auth.uid()
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'org_ownership_check_failed',
      'app_id', p_app_id,
      'before_status', v_before
    );
  END IF;

  UPDATE public.applications
  SET status = p_status,
      updated_at = now()
  WHERE id = p_app_id;

  SELECT a.status INTO v_after
  FROM public.applications a
  WHERE a.id = p_app_id;

  IF v_after = p_status THEN
    RETURN jsonb_build_object(
      'ok', true,
      'reason', 'updated',
      'app_id', p_app_id,
      'before_status', v_before,
      'after_status', v_after
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', false,
    'reason', 'status_unchanged_after_update',
    'app_id', p_app_id,
    'before_status', v_before,
    'after_status', v_after
  );
END;
$$;

REVOKE ALL ON FUNCTION public.org_update_application_status_v2(uuid, public.application_status) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.org_update_application_status_v2(uuid, public.application_status) TO authenticated;

COMMIT;
