# Debug: Student Names Still Not Showing

## Step 1: Check What's Actually in the Database

1. Go to **Supabase Console** → **SQL Editor** → **New Query**
2. Paste the first query from [VERIFY_STUDENT_NAMES.sql](VERIFY_STUDENT_NAMES.sql):
```sql
SELECT 
  id,
  user_id,
  full_name,
  headline,
  degree
FROM student_profiles
LIMIT 5;
```
3. Run it and look at results:
   - ✅ If you see names like "Raj", "Advitya Sirohi" → Database is fixed!
   - ❌ If you see NULL or 'User' → Need to run the UPDATE
   - ❌ If columns are empty → Migration didn't work

## Step 2: If Names Are Still NULL - Run the Fix

If Step 1 shows NULL, run this in the same SQL Editor:
```sql
UPDATE public.student_profiles sp
SET full_name = COALESCE(p.full_name, 'Unnamed User')
FROM public.profiles p
WHERE p.id = sp.user_id
AND (sp.full_name IS NULL OR sp.full_name = 'User');
```

Then verify with the last query from VERIFY_STUDENT_NAMES.sql to confirm it worked.

## Step 3: Clear Browser Cache & Reload

1. **Hard refresh the page:**
   - `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Or clear cache entirely:**
   - Press `F12` to open DevTools
   - Right-click on the refresh button
   - Select "Empty cache and hard reload"

## Step 4: Check Browser Console

1. Press `F12` → **Console** tab
2. Look for the new detailed logs:
   ```
   ✅ Student profiles fetched: Array(2)
      Raw student profiles data:
        SP 8e196b9d...: full_name="Raj", headline="Dev"
        SP 1c25e02c...: full_name="Advitya Sirohi", headline="null"
   ✅ Final applications: Array(2)
     [0] App "1f3f37ca..." → Student: "Raj"
     [1] App "5973409b..." → Student: "Advitya Sirohi"
   ```

3. If you still see `⚠️ NO NAME (NULL)`:
   - Click the warning and expand the object
   - Look for `full_name: null` in the student_profiles object
   - This means the database UPDATE didn't work

## Step 5: Visual Test

If console shows names correctly, check the cards:
- Should see "Raj" and "Advitya Sirohi" on the cards
- Click a card and drawer should show the name as title

## Troubleshooting If Still Not Working

If names still don't show after all steps:

1. **Check if wrong column was added:**
   ```sql
   \d student_profiles  -- List all columns
   ```

2. **Force a complete update:**
   ```sql
   UPDATE public.student_profiles
   SET full_name = (
     SELECT full_name FROM public.profiles 
     WHERE profiles.id = student_profiles.user_id
   );
   ```

3. **Check if there's a type mismatch:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'student_profiles' 
   AND column_name = 'full_name';
   ```

Let me know:
1. What SQL query Step 1 returns
2. What the console shows in Step 4
3. If the card displays the name correctly
