-- Keep offers status in sync when acceptance is recorded via activity/application.

CREATE OR REPLACE FUNCTION public.sync_offer_status_from_acceptance_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.event_type = 'Offer Accepted' THEN
    UPDATE public.offers
    SET status = 'accepted',
        updated_at = now()
    WHERE application_id = NEW.application_id
      AND status <> 'accepted';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_offer_accepted_activity ON public.application_activity;
CREATE TRIGGER on_offer_accepted_activity
AFTER INSERT ON public.application_activity
FOR EACH ROW
EXECUTE FUNCTION public.sync_offer_status_from_acceptance_activity();

-- Backfill rows already accepted via applications but not reflected on offers.
UPDATE public.offers o
SET status = 'accepted',
    updated_at = now()
FROM public.applications a
WHERE a.id = o.application_id
  AND a.status = 'accepted'
  AND o.status <> 'accepted';

-- Backfill rows already accepted via activity but not reflected on offers.
UPDATE public.offers o
SET status = 'accepted',
    updated_at = now()
FROM public.application_activity aa
WHERE aa.application_id = o.application_id
  AND aa.event_type = 'Offer Accepted'
  AND o.status <> 'accepted';

NOTIFY pgrst, 'reload schema';
