-- Add college_id field to student_profiles table
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.college_profiles(id) ON DELETE SET NULL;

-- Ensure the table status is good
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Update timestamp
ALTER TABLE public.student_profiles 
ALTER COLUMN updated_at SET DEFAULT now();

-- Create or update trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_student_profiles ON public.student_profiles;
CREATE TRIGGER set_updated_at_student_profiles 
BEFORE UPDATE ON public.student_profiles 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();
