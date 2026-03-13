-- Step 1: Check what names exist in auth.users
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as auth_full_name,
  raw_user_meta_data->>'name' as auth_name
FROM auth.users
LIMIT 10;

-- Step 2: If names exist in auth metadata, sync them to profiles table
UPDATE public.profiles
SET full_name = COALESCE(
  NULLIF(au.raw_user_meta_data->>'full_name', ''),
  NULLIF(au.raw_user_meta_data->>'name', ''),
  'User'
)
FROM auth.users au
WHERE profiles.user_id = au.id
AND profiles.full_name IS NULL;

-- Step 3: Then sync from profiles to student_profiles
UPDATE public.student_profiles sp
SET full_name = p.full_name
FROM public.profiles p
WHERE p.id = sp.user_id
AND (sp.full_name = 'User' OR sp.full_name IS NULL);

-- Step 4: Verify everything is synced
SELECT 
  sp.id,
  sp.full_name as student_full_name,
  p.full_name as profile_full_name,
  au.email,
  au.raw_user_meta_data->>'full_name' as auth_full_name
FROM student_profiles sp
LEFT JOIN profiles p ON p.id = sp.user_id
LEFT JOIN auth.users au ON au.id = p.user_id;
