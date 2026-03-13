-- Remove duplicate triggers causing repeated timeline entries
-- These triggers are firing for the same events, creating duplicate activity logs

-- Drop the redundant application creation trigger
DROP TRIGGER IF EXISTS trg_application_created ON applications;

-- Drop the redundant notification trigger
DROP TRIGGER IF EXISTS notify_new_application_trigger ON applications;

-- Verify remaining triggers are needed
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'applications';
