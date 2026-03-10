-- ==========================================
-- FINAL FIX FOR SIGNUP DATABASE ERROR
-- ==========================================

-- 1. CLEAN UP PREVIOUS ATTEMPTS
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. AUTO-CONFIRM TRIGGER (BEFORE INSERT)
-- This is the safest way to "remove" email verification. 
-- It modifies the record BEFORE it's saved to the database.
CREATE OR REPLACE FUNCTION public.auto_confirm_email_before()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = now();
  NEW.confirmed_at = now();
  -- Set last_sign_in_at so the user can be considered "confirmed" immediately
  NEW.last_sign_in_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm_before ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm_before
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_email_before();

-- 3. PROFILE SYNC TRIGGER (AFTER INSERT)
-- This ensures the public.profiles row exists BEFORE the frontend calls the role RPC.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'), 
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VERIFY TABLES
-- Ensure the student_profiles table doesn't have restrictive constraints that crash the RPC
-- (The RPC insert is done by the frontend after signup)
