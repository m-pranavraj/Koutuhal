-- The CORRECT way to sync: match on user_id, not id!
UPDATE student_profiles sp
SET full_name = p.full_name
FROM profiles p
WHERE p.user_id = sp.user_id
AND (sp.full_name = 'User' OR sp.full_name IS NULL);

-- Verify it worked
SELECT 
  sp.id,
  sp.user_id,
  sp.full_name as student_full_name,
  p.id as profile_id,
  p.user_id as profile_user_id,
  p.full_name as profile_full_name
FROM student_profiles sp
LEFT JOIN profiles p ON p.user_id = sp.user_id
ORDER BY sp.created_at;
