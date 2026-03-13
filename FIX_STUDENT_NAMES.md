# Fix for Student Names Not Displaying

## Problem
- Student profiles were empty because org user RLS blocked access to profiles table
- Console showed: "Fallback profs from DB: Array(0)" - profiles query was blocked

## Solution
Denormalize `full_name` into `student_profiles` table with auto-sync triggers

## Steps to Apply

### 1. Run Migration in Supabase Console
Copy and run this SQL in Supabase → SQL Editor → "NEW QUERY":

```sql
-- Add full_name column to student_profiles for denormalization
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT 'User';

-- Update existing records with names from profiles table
UPDATE public.student_profiles sp
SET full_name = p.full_name
FROM public.profiles p
WHERE p.id = sp.user_id AND sp.full_name = 'User';

-- Add a trigger to auto-sync full_name when profiles table updates
CREATE OR REPLACE FUNCTION public.sync_profile_to_student_profiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_profiles
  SET full_name = NEW.full_name
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_profile_name ON public.profiles;
CREATE TRIGGER trg_sync_profile_name
  AFTER UPDATE OF full_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_student_profiles();

-- Also sync when new profile is created
CREATE OR REPLACE FUNCTION public.sync_new_profile_to_student()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_profiles
  SET full_name = NEW.full_name
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_new_profile ON public.profiles;
CREATE TRIGGER trg_sync_new_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_new_profile_to_student();
```

### 2. Update Student Profile Save (Optional but Recommended)
In [src/pages/dashboard/SettingsPage.tsx](src/pages/dashboard/SettingsPage.tsx), when saving student profile:

```typescript
// Also sync full_name to student_profiles
if (primaryRole === "student") {
  await (supabase.from("student_profiles") as any).update({
    full_name: profileForm.full_name
  }).eq("user_id", user!.id);
}
```

### 3. Test the Fix
1. Hard refresh page: `Ctrl+Shift+R`
2. Check console for: "✅ Student profiles fetched: Array(2)"
3. Card should now show: "[0] App ... → Student: Raj"
4. Profile drawer should show: "Raj" as the title

## Expected Result
✅ Student names will display in kanban cards
✅ Profile drawer will show student information
✅ No more "Unknown" or "No Name Provided"
