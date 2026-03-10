-- Run this script in your Supabase SQL Editor to fix Organization visibility issues.

-- 1. Allow Organizations to view applications submitted to their jobs
DROP POLICY IF EXISTS "Organizations can view applications to their jobs" ON applications;
CREATE POLICY "Organizations can view applications to their jobs" 
ON applications 
FOR SELECT 
USING (
  job_id IN (
    SELECT id FROM jobs 
    WHERE org_id IN (
      SELECT id FROM organization_profiles WHERE user_id = auth.uid()
    )
  )
);

-- 2. Allow Organizations to view student submissions to their assessments
DROP POLICY IF EXISTS "Organizations can view submissions to their assessments" ON assessment_submissions;
CREATE POLICY "Organizations can view submissions to their assessments" 
ON assessment_submissions 
FOR SELECT 
USING (
  assessment_id IN (
    SELECT id FROM assessments 
    WHERE org_id IN (
      SELECT id FROM organization_profiles WHERE user_id = auth.uid()
    )
  )
);

-- 3. Allow Organizations to grade/update student submissions to their assessments
DROP POLICY IF EXISTS "Organizations can update submissions to their assessments" ON assessment_submissions;
CREATE POLICY "Organizations can update submissions to their assessments" 
ON assessment_submissions 
FOR UPDATE 
USING (
  assessment_id IN (
    SELECT id FROM assessments 
    WHERE org_id IN (
      SELECT id FROM organization_profiles WHERE user_id = auth.uid()
    )
  )
);
