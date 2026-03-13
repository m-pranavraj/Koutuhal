-- FIX: enforce_application_flow references invalid enum value 'offer'
-- application_status enum uses 'selected' (and legacy 'accepted'), not 'offer'.

BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_application_flow()
RETURNS TRIGGER AS $$
BEGIN
  -- pending -> assessment/rejected
  IF OLD.status = 'pending' AND NEW.status NOT IN ('assessment','rejected') THEN
    RAISE EXCEPTION 'Invalid transition from pending';
  END IF;

  -- assessment -> interview/rejected
  IF OLD.status = 'assessment' AND NEW.status NOT IN ('interview','rejected') THEN
    RAISE EXCEPTION 'Invalid transition from assessment';
  END IF;

  -- interview -> selected/accepted/rejected
  IF OLD.status = 'interview' AND NEW.status NOT IN ('selected','accepted','rejected') THEN
    RAISE EXCEPTION 'Invalid transition from interview';
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

COMMIT;
