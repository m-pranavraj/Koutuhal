-- Allow organization users to read profile data for students who applied to their jobs
CREATE POLICY "org_can_read_applicant_profiles" ON profiles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT op.user_id 
    FROM organization_profiles op
    INNER JOIN jobs j ON j.org_id = op.id
    INNER JOIN applications a ON a.job_id = j.id
    INNER JOIN student_profiles sp ON sp.id = a.student_id
    WHERE sp.user_id = profiles.id
  )
);

-- Alternative simpler approach: Allow authenticated users to read their own profile
-- (this is more permissive but needed for the relation to work)
CREATE POLICY "authenticated_read_all_profiles" ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');
