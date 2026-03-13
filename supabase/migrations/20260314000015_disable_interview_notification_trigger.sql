-- Emergency unblock: disable interview notification side effects.
-- This guarantees interview scheduling will not fail due to notifications RLS.

-- Drop any known trigger that can fire on interview creation.
DROP TRIGGER IF EXISTS on_interview_created ON public.interviews;
DROP TRIGGER IF EXISTS notify_interview_scheduled ON public.interviews;
DROP TRIGGER IF EXISTS trg_notify_interview_scheduled ON public.interviews;

-- Keep function drop safe; trigger may have referenced any of these names.
DROP FUNCTION IF EXISTS public.notify_on_interview_scheduled();
DROP FUNCTION IF EXISTS public.notify_interview_scheduled();

-- Optional: keep create_notification function available for other modules.
-- No changes needed here for this emergency fix.
