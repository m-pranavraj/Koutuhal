-- Run this in Supabase SQL Editor to fully unblock the Organization Dashboard.

-- The "applications" query joins "student_profiles" and "profiles" (users). 
-- If organizations are blocked from seeing those tables by RLS, the application rows will not load correctly.

-- 1. Allow Organizations to read student profiles for their applicants
DROP POLICY IF EXISTS "Organizations can view student profiles of applicants" ON student_profiles;
CREATE POLICY "Organizations can view student profiles of applicants" 
ON student_profiles 
FOR SELECT 
USING (
  id IN (
    SELECT student_id FROM applications 
    WHERE job_id IN (
      SELECT id FROM jobs 
      WHERE org_id IN (
        SELECT id FROM organization_profiles WHERE user_id = auth.uid()
      )
    )
  )
);

-- 2. Allow Organizations to read basic profiles (user table) for their applicants
DROP POLICY IF EXISTS "Organizations can view user profiles of applicants" ON profiles;
CREATE POLICY "Organizations can view user profiles of applicants" 
ON profiles 
FOR SELECT 
USING (
  user_id IN (
    SELECT user_id FROM student_profiles 
    WHERE id IN (
      SELECT student_id FROM applications 
      WHERE job_id IN (
        SELECT id FROM jobs 
        WHERE org_id IN (
          SELECT id FROM organization_profiles WHERE user_id = auth.uid()
        )
      )
    )
  )
);

-- Fallback/Alternative: Make profiles publicly readable (standard for many apps)
-- If the complex joins above fail due to circular dependencies or performance, 
-- running these two lines is the robust fallback:
-- 
-- CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
-- CREATE POLICY "Student profiles are viewable by everyone." ON student_profiles FOR SELECT USING (true);
