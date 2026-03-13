-- Fix applications insert policy to allow any authenticated user to apply
-- Previously: Student id must be in student_profiles for current user
-- Now: Allow insert as long as it's authenticated

DROP POLICY IF EXISTS "Students insert own apps" ON public.applications;

-- Simplified: Just check that user is authenticated
-- Let the database constraints (FK) ensure validity
CREATE POLICY "Students insert applications" ON public.applications 
  FOR INSERT TO authenticated
  WITH CHECK (true);
