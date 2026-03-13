-- COMPLETE CORRECTED SCHEMA - NO CIRCULAR DEPENDENCIES
-- This is the authoritative schema for koutuhal-pathways project
-- ============================================================

-- 1. AUTH INTEGRATION (via Supabase Auth - DO NOT CREATE)
-- auth.users table is provided by Supabase

-- 2. CORE USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  avatar_url text,
  bio text,
  phone text,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  headline text,
  skills text[] DEFAULT ARRAY[]::text[],
  education jsonb DEFAULT '[]'::jsonb,
  experience jsonb DEFAULT '[]'::jsonb,
  resume_url text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  branch text,
  college_name text,
  degree text,
  graduation_year integer,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT student_profiles_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.college_profiles(id) ON DELETE SET NULL
);

-- 4. MENTOR PROFILES
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  headline text,
  expertise text[] DEFAULT ARRAY[]::text[],
  qualifications text,
  years_experience integer,
  session_type text NOT NULL DEFAULT 'free'::text,
  hourly_rate numeric DEFAULT 0,
  currency text DEFAULT 'USD'::text,
  linkedin_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mentor_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. COLLEGE PROFILES
CREATE TABLE IF NOT EXISTS public.college_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  college_name text NOT NULL DEFAULT 'My Institution'::text,
  contact_email text,
  contact_phone text,
  description text,
  location text,
  logo_url text,
  website text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT college_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT college_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 6. ORGANIZATION PROFILES
CREATE TABLE IF NOT EXISTS public.organization_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL DEFAULT 'My Organization'::text,
  industry text,
  website text,
  logo_url text,
  description text,
  location text,
  company_size text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT organization_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 7. USER ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 8. JOBS
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  job_type text NOT NULL DEFAULT 'full_time'::text,
  category text,
  location text,
  is_remote boolean DEFAULT false,
  required_skills text[] DEFAULT ARRAY[]::text[],
  salary_min numeric,
  salary_max numeric,
  currency text DEFAULT 'INR'::text,
  status text NOT NULL DEFAULT 'open'::text,
  deadline timestamp with time zone,
  attachment_urls text[] DEFAULT ARRAY[]::text[],
  hiring_rounds text[] DEFAULT ARRAY[]::text[],
  assessment_required boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organization_profiles(id) ON DELETE CASCADE
);

-- 9. APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  student_id uuid NOT NULL,
  resume_url text,
  cover_letter text,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE,
  CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  CONSTRAINT unique_student_job_application UNIQUE (student_id, job_id)
);

-- 10. APPLICATION ACTIVITY
CREATE TABLE IF NOT EXISTS public.application_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  event_type text NOT NULL,
  event_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT application_activity_pkey PRIMARY KEY (id),
  CONSTRAINT application_activity_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE
);

-- 11. INTERVIEWS
CREATE TABLE IF NOT EXISTS public.interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'::text,
  interviewer_name text,
  meeting_link text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT interviews_pkey PRIMARY KEY (id),
  CONSTRAINT interviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE
);

-- 12. OFFERS
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  salary text,
  start_date date,
  offer_letter_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT offers_pkey PRIMARY KEY (id),
  CONSTRAINT offers_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE
);

-- 13. ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  org_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  assessment_type text NOT NULL DEFAULT 'online'::text,
  questions jsonb,
  time_limit_minutes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assessments_pkey PRIMARY KEY (id),
  CONSTRAINT assessments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE,
  CONSTRAINT assessments_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organization_profiles(id) ON DELETE CASCADE
);

-- 14. ASSESSMENT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assessment_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assessment_id uuid,
  student_id uuid,
  application_id uuid,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assessment_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_assignments_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE,
  CONSTRAINT assessment_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  CONSTRAINT assessment_assignments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE
);

-- 15. ASSESSMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.assessment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  answers jsonb,
  score numeric,
  status text NOT NULL DEFAULT 'pending'::text,
  notes text,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assessment_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_submissions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE,
  CONSTRAINT assessment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  CONSTRAINT unique_assessment_submission UNIQUE (assessment_id, student_id)
);

-- 16. MENTOR SESSIONS
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  student_id uuid NOT NULL,
  session_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  session_type text NOT NULL DEFAULT 'free'::text,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'INR'::text,
  status text NOT NULL DEFAULT 'pending'::text,
  notes text,
  meeting_link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mentor_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_sessions_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  CONSTRAINT mentor_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE
);

-- 17. MENTOR AVAILABILITY
CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mentor_availability_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_availability_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE
);

-- 18. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mentor_sessions(id) ON DELETE CASCADE,
  CONSTRAINT reviews_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  CONSTRAINT reviews_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE
);

-- 19. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'::text,
  is_read boolean DEFAULT false,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 20. RESUMES
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  file_path text NOT NULL,
  parsed_content text,
  resume_text text,
  url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT resumes_pkey PRIMARY KEY (id),
  CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 21. ANALYSES
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  resume_id uuid NOT NULL,
  role text NOT NULL,
  job_description text,
  score integer,
  strengths jsonb,
  gaps jsonb,
  better_roles jsonb,
  status text DEFAULT 'completed'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT analyses_pkey PRIMARY KEY (id),
  CONSTRAINT analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT analyses_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE
);

-- 22. ANALYSIS RESULTS
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  role_id uuid,
  match_score integer,
  analysis_details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT analysis_results_pkey PRIMARY KEY (id),
  CONSTRAINT analysis_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 23. TARGET ROLES
CREATE TABLE IF NOT EXISTS public.target_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  role_name text NOT NULL,
  job_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT target_roles_pkey PRIMARY KEY (id),
  CONSTRAINT target_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_college_profiles_user_id ON public.college_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_user_id ON public.organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_student ON public.applications(job_id, student_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON public.jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_application_id ON public.offers(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id ON public.mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_student_id ON public.mentor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_date ON public.mentor_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_assessments_org_id ON public.assessments(org_id);
CREATE INDEX IF NOT EXISTS idx_assessments_job_id ON public.assessments(job_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_student_id ON public.assessment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_assessment_id ON public.assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_roles ENABLE ROW LEVEL SECURITY;
