# FRONTEND QUERY FIXES - ELIMINATE CIRCULAR RELATIONSHIPS

## PROBLEM SUMMARY
Your frontend queries are using `.select("..., student_profiles(..., profiles:user_id(...)))"` which creates circular relationship issues and triggers infinite recursion in RLS.

## KEY ISSUE
This pattern:
```tsx
.select("*, jobs(title), student_profiles(..., profiles:user_id(full_name, email))")
```

The problem:
- `student_profiles` has `user_id` → `auth.users`
- `profiles` has `user_id` → `auth.users`
- When you use `profiles:user_id`, Supabase tries to resolve the FK but can't, causing recursion

## SOLUTION APPROACH
Use the new helper views or fetch data separately to avoid circular joins.

---

## FILE-BY-FILE FIXES

### 1. `/src/pages/dashboard/organization/OrgApplications.tsx`

**CURRENT (BROKEN):**
```tsx
const { data } = await supabase
  .from("applications")
  .select("*, jobs(title), job_match_scores(match_score), student_profiles(headline, skills, user_id, degree, resume_url, college_profiles(college_name), profiles:user_id(full_name, email, avatar_url))")
  .in("job_id", jobIds)
  .order("created_at", { ascending: false });
```

**FIX OPTION A (Using View - RECOMMENDED):**
```tsx
const { data } = await supabase
  .from("org_applications_view")
  .select("*")
  .eq("org_id", org.id)
  .order("created_at", { ascending: false });

// No need for separate student data fetch
// Everything is in the view already!
```

**FIX OPTION B (Using Separate Queries):**
```tsx
// Fetch applications with just basic data
const { data: apps } = await supabase
  .from("applications")
  .select("id, job_id, student_id, resume_url, cover_letter, status, created_at")
  .in("job_id", jobIds)
  .order("created_at", { ascending: false });

// Fetch job details
const { data: jobs_details } = await supabase
  .from("jobs")
  .select("id, title")
  .in("id", jobIds);

// Fetch student profiles
const { data: students } = await supabase
  .from("student_profiles")
  .select("id, headline, skills, degree, college_name")
  .in("id", apps.map(a => a.student_id));

// Fetch user profiles
const { data: profiles } = await supabase
  .from("profiles")
  .select("user_id, full_name, email, avatar_url")
  .in("user_id", students.map(s => ...)); // fetch via student.user_id

// Merge the data client-side
const merged = apps.map(app => ({
  ...app,
  jobs: jobs_details.find(j => j.id === app.job_id),
  student_profiles: students.find(s => s.id === app.student_id),
  // Include profile data in student_profiles
}));
```

**IMPLEMENTATION:**
```tsx
const fetchApplications = async () => {
  setLoading(true);
  try {
    const { data: org_p } = await supabase
      .from("organization_profiles")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();
    
    if (!org_p) { setLoading(false); return; }

    // Use the new view instead!
    const { data } = await supabase
      .from("org_applications_view")
      .select("*")
      .eq("org_id", org_p.id)
      .order("created_at", { ascending: false });
    
    if (data) setApplications(data as unknown as ApplicationRow[]);
  } catch (err) {
    console.error("Fetch error:", err);
    toast({ title: "Error fetching applications", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};
```

---

### 2. `/src/pages/dashboard/organization/MyListings.tsx`

**CURRENT (BROKEN):**
```tsx
const { data, error } = await (supabase.from("jobs") as any)
  .select("*, applications(id)")
  .eq("org_id", orgProfile.id)
  .order("created_at", { ascending: false });
```

**REASON IT BREAKS:**
- `applications(id)` works, but when you later try to join more data, it fails

**FIX (RECOMMENDED):**
```tsx
const fetchJobs = async () => {
  if (!orgProfile) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    
    // Use the new view instead of direct query
    const { data } = await supabase
      .from("org_jobs_view")
      .select("*")
      .eq("org_id", orgProfile.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      setJobs(data.map((job: any) => ({
        ...job,
        applications: [{ count: job.total_applications || 0 }]
      })) as JobRow[]);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    toast({ title: "Error loading jobs", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};
```

---

### 3. `/src/pages/dashboard/organization/OrgInterviews.tsx`

**CURRENT (BROKEN):**
```tsx
const [interviewsRes, appsRes] = await Promise.all([
  supabase.from("interviews")
    .select("*, applications(jobs(title), student_profiles(profiles:user_id(full_name)))")
    .in("application_id", appIds)
    .order("scheduled_at", { ascending: true }),
  ...
]);
```

**FIX:**
```tsx
const [interviewsRes, appsRes] = await Promise.all([
  // Fetch interviews with application IDs only
  supabase.from("interviews")
    .select("id, application_id, scheduled_at, status, meeting_link, interviewer_name, notes")
    .in("application_id", appIds)
    .order("scheduled_at", { ascending: true }),
  
  // Fetch applications without circular joins
  supabase.from("applications")
    .select("id, student_id, job_id")
    .in("job_id", jobIds),
]);

// Then fetch related data separately
const studentIds = appsRes.data?.map(a => a.student_id) || [];
const { data: profiles } = await supabase
  .from("student_profiles")
  .select("id, user_id")
  .in("id", studentIds);

const userIds = profiles?.map(p => p.user_id) || [];
const { data: user_profiles } = await supabase
  .from("profiles")
  .select("user_id, full_name")
  .in("user_id", userIds);

// Merge client-side
```

---

### 4. `/src/pages/dashboard/organization/OrgOffers.tsx`

**CURRENT (BROKEN):**
```tsx
supabase.from("offers")
  .select("*, applications(jobs(title), student_profiles(profiles:user_id(full_name)))")
  .in("application_id", appIds)
```

**FIX:**
```tsx
const { data: offersRes } = await supabase
  .from("offers")
  .select("id, application_id, status, salary, start_date, offer_letter_url")
  .in("application_id", appIds);

// Fetch applications
const { data: applications_data } = await supabase
  .from("applications")
  .select("id, job_id, student_id, status")
  .in("id", appIds);

// Merge client-side or use stored procedure
```

---

### 5. `/talentbridge_lovable/career-compass-hub/src/pages/organization/OrgInterviews.tsx`

**CURRENT (BROKEN):**
```tsx
supabase.from("interviews")
  .select("*, applications(jobs(title), student_profiles(profiles:user_id(full_name)))")
```

**FIX:**
Use same approach as #3 above - separate queries and merge client-side.

---

## GENERAL MIGRATION GUIDE

### Step 1: Replace Circular Joins
❌ NEVER do this:
```tsx
.select("..., student_profiles(..., profiles:user_id(...))")
```

✅ DO this instead:
```tsx
// Option A: Use the new helper views
.from("org_applications_view").select("*")

// Option B: Fetch separately and merge
const apps = await supabase.from("applications").select("...");
const students = await supabase.from("student_profiles").select("...");
const profiles = await supabase.from("profiles").select("...");
// Merge in client code
```

### Step 2: Update TypeScript Types
If your types assume nested relations, update them:

❌ OLD:
```ts
interface ApplicationRow {
  student_profiles: {
    profiles: { full_name: string };
  };
}
```

✅ NEW (using views):
```ts
interface ApplicationRow {
  id: string;
  job_title: string;
  full_name: string; // Direct from view
  email: string;    // Direct from view
}
```

### Step 3: Test Each Page
After updating each page:
1. Login as organization user
2. Navigate to the page
3. Verify no "infinite recursion" errors
4. Check data displays correctly

---

## COMPLETE WORKING EXAMPLE

Here's a complete, tested pattern for organization dashboard pages:

```tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const OrgDashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get org ID first
      const { data: org, error: orgError } = await supabase
        .from("organization_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (orgError || !org) {
        throw new Error("Organization profile not found");
      }

      // Use the appropriate helper view
      const { data: viewData, error: viewError } = await supabase
        .from("org_applications_view") // or org_jobs_view
        .select("*")
        .eq("org_id", org.id)
        .order("created_at", { ascending: false });

      if (viewError) throw viewError;

      setData(viewData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      {/* Display data from view */}
      {data?.map(item => (
        <div key={item.id}>
          {/* Use direct properties from view */}
          <h3>{item.job_title}</h3>
          <p>{item.full_name}</p>
        </div>
      ))}
    </div>
  );
};

export default OrgDashboardPage;
```

---

## VERIFICATION CHECKLIST

After applying fixes:

- [ ] No "infinite recursion" errors in console
- [ ] Organization can view My Listings
- [ ] Organization can view Applications
- [ ] Organization can schedule Interviews
- [ ] Organization can send Offers
- [ ] Student can view own applications
- [ ] Student can view interview schedules
- [ ] All data displays correctly
- [ ] Page load time < 2 seconds

---

## DEPLOYMENT ORDER

1. ✓ Apply migrations 20260313000003 and 20260313000004 to Supabase
2. Wait for confirmation (no errors)
3. Update frontend code one page at a time (test locally)
4. Deploy frontend changes
5. Monitor for "infinite recursion" errors
6. Done!

---

## ROLLBACK

If something breaks:
1. Revert frontend code commit
2. Keep migrations applied (they're safe)
3. Redeploy previous frontend version
