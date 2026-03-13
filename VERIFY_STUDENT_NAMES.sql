-- Check what's in student_profiles now after migration
SELECT 
  id,
  user_id,
  full_name,
  headline,
  degree
FROM student_profiles
LIMIT 5;

-- Also check how many have NULL full_name
SELECT 
  COUNT(*) as total_records,
  COUNT(full_name) as with_name,
  COUNT(*) - COUNT(full_name) as with_null_name
FROM student_profiles;

-- If full_name is still NULL/empty, run this to update from profiles:
UPDATE public.student_profiles sp
SET full_name = COALESCE(p.full_name, 'Unnamed User')
FROM public.profiles p
WHERE p.id = sp.user_id
AND (sp.full_name IS NULL OR sp.full_name = 'User');

-- Verify update worked
SELECT 
  sp.id,
  sp.full_name,
  p.full_name as profile_name
FROM student_profiles sp
LEFT JOIN profiles p ON p.id = sp.user_id;
