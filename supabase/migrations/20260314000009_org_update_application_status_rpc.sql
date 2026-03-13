-- Reliable org status update via security-definer RPC (bypasses fragile RLS update path)
-- Still enforces org ownership in function logic.

BEGIN;

CREATE OR REPLACE FUNCTION public.org_update_application_status(
  p_app_id uuid,
  p_status public.application_status
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed boolean;
BEGIN
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
    RETURN false;
  END IF;

  UPDATE public.applications
  SET status = p_status,
      updated_at = now()
  WHERE id = p_app_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.org_update_application_status(uuid, public.application_status) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.org_update_application_status(uuid, public.application_status) TO authenticated;

COMMIT;
