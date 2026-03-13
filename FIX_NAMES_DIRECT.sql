-- First, check if profiles records exist for these users
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  au.email,
  au.raw_user_meta_data->>'full_name' as auth_name
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.user_id
WHERE p.user_id IN (
  SELECT user_id FROM student_profiles
)
ORDER BY p.created_at DESC;

-- If profiles exist but are empty, update them directly
UPDATE profiles 
SET full_name = au.raw_user_meta_data->>'full_name'
FROM auth.users au
WHERE profiles.user_id = au.id
AND profiles.full_name IS NULL
AND au.raw_user_meta_data->>'full_name' IS NOT NULL;

-- And update from name field if full_name was empty
UPDATE profiles 
SET full_name = au.raw_user_meta_data->>'name'
FROM auth.users au
WHERE profiles.user_id = au.id
AND (profiles.full_name IS NULL OR profiles.full_name = '')
AND au.raw_user_meta_data->>'name' IS NOT NULL;

-- Then push to student_profiles
UPDATE student_profiles
SET full_name = (
  SELECT full_name FROM profiles 
  WHERE profiles.user_id = student_profiles.user_id
)
WHERE full_name = 'User' OR full_name IS NULL;

-- Final check
SELECT 
  sp.id,
  sp.full_name,
  sp.user_id,
  p.full_name as profile_name
FROM student_profiles sp
LEFT JOIN profiles p ON p.user_id = sp.user_id;
