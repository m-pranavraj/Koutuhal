-- Student offer response RPC.
-- Ensures accepting an offer also updates application status so org hired/interview counts stay accurate.

CREATE OR REPLACE FUNCTION public.student_respond_offer(
  p_offer_id UUID,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _application_id UUID;
  _student_id UUID;
  _belongs_to_student BOOLEAN := false;
BEGIN
  IF p_status NOT IN ('accepted', 'rejected') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'Invalid offer status.');
  END IF;

  SELECT o.application_id, a.student_id
  INTO _application_id, _student_id
  FROM public.offers o
  JOIN public.applications a ON a.id = o.application_id
  WHERE o.id = p_offer_id;

  IF _application_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'Offer not found.');
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.student_profiles sp
    WHERE sp.id = _student_id
      AND sp.user_id = auth.uid()
  )
  INTO _belongs_to_student;

  IF NOT _belongs_to_student THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'You cannot modify this offer.');
  END IF;

  UPDATE public.offers
  SET status = p_status,
      updated_at = now()
  WHERE id = p_offer_id;

  IF p_status = 'accepted' THEN
    -- Keep offer acceptance durable even if strict application transition triggers reject a direct jump.
    BEGIN
      UPDATE public.applications
      SET status = 'accepted',
          updated_at = now()
      WHERE id = _application_id;
    EXCEPTION
      WHEN OTHERS THEN
        BEGIN
          UPDATE public.applications
          SET status = 'selected',
              updated_at = now()
          WHERE id = _application_id;
        EXCEPTION
          WHEN OTHERS THEN
            NULL;
        END;
    END;

    BEGIN
      INSERT INTO public.application_activity(application_id, event_type, event_description)
      VALUES (_application_id, 'Offer Accepted', 'Candidate accepted the offer.');
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END;
  ELSIF p_status = 'rejected' THEN
    BEGIN
      UPDATE public.applications
      SET status = 'rejected',
          updated_at = now()
      WHERE id = _application_id;
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_respond_offer(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_respond_offer(UUID, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
