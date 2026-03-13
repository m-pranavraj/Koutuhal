-- Check what student profile data exists
-- Copy and run this entire query in Supabase SQL Editor

-- First, let's see all student profiles
SELECT 
  sp.id as student_profile_id,
  sp.user_id,
  sp.headline,
  sp.skills,
  sp.degree,
  p.full_name,
  p.email,
  p.avatar_url,
  sp.resume_url,
  sp.created_at
FROM student_profiles sp
LEFT JOIN profiles p ON p.id = sp.user_id;

-- Also check how many applications exist
SELECT count(*) as total_applications FROM applications;

-- Check a specific application and its related data
SELECT 
  a.id as app_id,
  a.student_id,
  a.status,
  sp.id as sp_id,
  sp.headline,
  p.full_name,
  p.email
FROM applications a
LEFT JOIN student_profiles sp ON a.student_id = sp.id  
LEFT JOIN profiles p ON p.user_id = sp.user_id;
