-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.analyses (
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
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analyses_pkey PRIMARY KEY (id),
  CONSTRAINT analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT analyses_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id)
);
CREATE TABLE public.analysis_results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  role_id uuid,
  match_score integer,
  analysis_details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analysis_results_pkey PRIMARY KEY (id),
  CONSTRAINT analysis_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT analysis_results_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.target_roles(id)
);
CREATE TABLE public.application_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  event_type text NOT NULL,
  event_description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT application_activity_pkey PRIMARY KEY (id),
  CONSTRAINT application_activity_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id)
);
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  student_id uuid NOT NULL,
  resume_url text,
  cover_letter text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::application_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id)
);
CREATE TABLE public.assessment_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assessment_id uuid,
  student_id uuid,
  application_id uuid,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assessment_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_assignments_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id),
  CONSTRAINT assessment_assignments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id),
  CONSTRAINT assessment_assignments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id)
);
CREATE TABLE public.assessment_submissions (
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
  CONSTRAINT assessment_submissions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id),
  CONSTRAINT assessment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id)
);
CREATE TABLE public.assessments (
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
  CONSTRAINT assessments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT assessments_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organization_profiles(id)
);
CREATE TABLE public.college_profiles (
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
  CONSTRAINT college_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.interviews (
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
  CONSTRAINT interviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  job_type USER-DEFINED NOT NULL DEFAULT 'full_time'::job_type,
  category text,
  location text,
  is_remote boolean DEFAULT false,
  required_skills ARRAY,
  salary_min numeric,
  salary_max numeric,
  currency text DEFAULT 'INR'::text,
  status USER-DEFINED NOT NULL DEFAULT 'open'::job_status,
  deadline timestamp with time zone,
  attachment_urls ARRAY,
  hiring_rounds ARRAY,
  assessment_required boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organization_profiles(id)
);
CREATE TABLE public.mentor_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mentor_availability_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_availability_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id)
);
CREATE TABLE public.mentor_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  headline text,
  expertise ARRAY,
  qualifications text,
  years_experience integer,
  session_type USER-DEFINED NOT NULL DEFAULT 'free'::session_type,
  hourly_rate numeric DEFAULT 0,
  currency text DEFAULT 'USD'::text,
  linkedin_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mentor_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.mentor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  student_id uuid NOT NULL,
  session_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  session_type USER-DEFINED NOT NULL DEFAULT 'free'::session_type,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'INR'::text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::booking_status,
  notes text,
  meeting_link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mentor_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_sessions_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id),
  CONSTRAINT mentor_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'::text,
  is_read boolean DEFAULT false,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  salary text,
  start_date date,
  offer_letter_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT offers_pkey PRIMARY KEY (id),
  CONSTRAINT offers_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id)
);
CREATE TABLE public.organization_profiles (
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
  CONSTRAINT organization_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
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
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.resumes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  file_path text NOT NULL,
  parsed_content text,
  created_at timestamp with time zone DEFAULT now(),
  url text,
  resume_text text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT resumes_pkey PRIMARY KEY (id),
  CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  mentor_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mentor_sessions(id),
  CONSTRAINT reviews_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id),
  CONSTRAINT reviews_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id)
);
CREATE TABLE public.student_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  headline text,
  skills ARRAY,
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
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  college_id uuid,
  resume_id uuid,
  CONSTRAINT student_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT student_profiles_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.college_profiles(id),
  CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT student_profiles_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id)
);
CREATE TABLE public.target_roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  role_name text NOT NULL,
  job_description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT target_roles_pkey PRIMARY KEY (id),
  CONSTRAINT target_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);