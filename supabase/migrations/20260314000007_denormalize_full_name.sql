-- Add full_name column to student_profiles for denormalization
-- This allows org users to read student names without needing profiles table access

ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT 'User';

-- Update existing records with names from profiles table
UPDATE public.student_profiles sp
SET full_name = p.full_name
FROM public.profiles p
WHERE p.id = sp.user_id AND sp.full_name = 'User';

-- Add a trigger to auto-sync full_name when profiles table updates
CREATE OR REPLACE FUNCTION public.sync_profile_to_student_profiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_profiles
  SET full_name = NEW.full_name
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_profile_name ON public.profiles;
CREATE TRIGGER trg_sync_profile_name
  AFTER UPDATE OF full_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_student_profiles();

-- Also sync when new profile is created
CREATE OR REPLACE FUNCTION public.sync_new_profile_to_student()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_profiles
  SET full_name = NEW.full_name
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_new_profile ON public.profiles;
CREATE TRIGGER trg_sync_new_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_new_profile_to_student();
