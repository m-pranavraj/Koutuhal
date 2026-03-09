-- ============================================================
-- MASTER MIGRATION: TalentBridge Schema for Koutuhal Supabase
-- Apply this to: qgncpqjntwapfvvuhmog.supabase.co
-- Run via: Supabase Dashboard → SQL Editor, or supabase db push
-- ============================================================

-- ─── STEP 1: ENUMS ──────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'organization', 'student', 'mentor', 'college');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.job_type AS ENUM ('full_time', 'part_time', 'internship', 'contract', 'freelance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('open', 'closed', 'filled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM (
    'pending', 'shortlisted', 'accepted', 'rejected',
    'screening', 'assessment', 'interview', 'final_review', 'selected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.session_type AS ENUM ('free', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── STEP 2: UTILITY FUNCTION ────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ─── STEP 3: PROFILES TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, email TEXT, avatar_url TEXT, bio TEXT, phone TEXT, location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Profiles viewable" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 4: AUTO-CREATE PROFILE ON SIGNUP ───────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── STEP 5: USER ROLES TABLE ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ─── STEP 6: ROLE-SPECIFIC PROFILE TABLES ────────────────────

-- Student profiles
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT, skills TEXT[], education JSONB DEFAULT '[]'::jsonb, experience JSONB DEFAULT '[]'::jsonb,
  resume_url TEXT, linkedin_url TEXT, github_url TEXT, portfolio_url TEXT,
  branch TEXT, college_name TEXT, degree TEXT, graduation_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student profiles viewable" ON public.student_profiles;
DROP POLICY IF EXISTS "Students insert own" ON public.student_profiles;
DROP POLICY IF EXISTS "Students update own" ON public.student_profiles;
CREATE POLICY "Student profiles viewable" ON public.student_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students insert own" ON public.student_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update own" ON public.student_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_student_profiles BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Organization profiles
CREATE TABLE IF NOT EXISTS public.organization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'My Organization', industry TEXT, website TEXT, logo_url TEXT,
  description TEXT, location TEXT, company_size TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org profiles viewable" ON public.organization_profiles;
DROP POLICY IF EXISTS "Orgs insert own" ON public.organization_profiles;
DROP POLICY IF EXISTS "Orgs update own" ON public.organization_profiles;
CREATE POLICY "Org profiles viewable" ON public.organization_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Orgs insert own" ON public.organization_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Orgs update own" ON public.organization_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_organization_profiles BEFORE UPDATE ON public.organization_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mentor profiles
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT, expertise TEXT[], qualifications TEXT, years_experience INT,
  session_type session_type NOT NULL DEFAULT 'free', hourly_rate DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD', linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mentor profiles viewable" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Mentors insert own" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Mentors update own" ON public.mentor_profiles;
CREATE POLICY "Mentor profiles viewable" ON public.mentor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mentors insert own" ON public.mentor_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Mentors update own" ON public.mentor_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_mentor_profiles BEFORE UPDATE ON public.mentor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- College profiles
CREATE TABLE IF NOT EXISTS public.college_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  college_name TEXT NOT NULL DEFAULT 'My Institution',
  contact_email TEXT, contact_phone TEXT, description TEXT,
  location TEXT, logo_url TEXT, website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.college_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "College profiles viewable" ON public.college_profiles;
DROP POLICY IF EXISTS "Colleges insert own" ON public.college_profiles;
DROP POLICY IF EXISTS "Colleges update own" ON public.college_profiles;
CREATE POLICY "College profiles viewable" ON public.college_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Colleges insert own" ON public.college_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Colleges update own" ON public.college_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_college_profiles BEFORE UPDATE ON public.college_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 7: ASSIGN_USER_ROLE RPC ────────────────────────────
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id UUID, _role app_role, _company_name TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role) ON CONFLICT DO NOTHING;
  IF _role = 'student' THEN
    INSERT INTO public.student_profiles (user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;
  ELSIF _role = 'mentor' THEN
    INSERT INTO public.mentor_profiles (user_id) VALUES (_user_id) ON CONFLICT DO NOTHING;
  ELSIF _role = 'organization' THEN
    INSERT INTO public.organization_profiles (user_id, company_name) VALUES (_user_id, COALESCE(_company_name, 'My Organization')) ON CONFLICT DO NOTHING;
  ELSIF _role = 'college' THEN
    INSERT INTO public.college_profiles (user_id, college_name) VALUES (_user_id, COALESCE(_company_name, 'My Institution')) ON CONFLICT DO NOTHING;
  END IF;
END; $$;

-- ─── STEP 8: MENTOR AVAILABILITY ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL, end_time TIME NOT NULL, is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Availability viewable" ON public.mentor_availability;
DROP POLICY IF EXISTS "Mentors insert availability" ON public.mentor_availability;
DROP POLICY IF EXISTS "Mentors update availability" ON public.mentor_availability;
DROP POLICY IF EXISTS "Mentors delete availability" ON public.mentor_availability;
CREATE POLICY "Availability viewable" ON public.mentor_availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mentors insert availability" ON public.mentor_availability FOR INSERT TO authenticated WITH CHECK (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentors update availability" ON public.mentor_availability FOR UPDATE TO authenticated USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentors delete availability" ON public.mentor_availability FOR DELETE TO authenticated USING (mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid()));

-- ─── STEP 9: JOBS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT NOT NULL, job_type job_type NOT NULL DEFAULT 'full_time',
  category TEXT, location TEXT, is_remote BOOLEAN DEFAULT false, required_skills TEXT[],
  salary_min DECIMAL(12,2), salary_max DECIMAL(12,2), currency TEXT DEFAULT 'INR',
  status job_status NOT NULL DEFAULT 'open', deadline TIMESTAMPTZ,
  attachment_urls TEXT[], hiring_rounds TEXT[], assessment_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Jobs viewable" ON public.jobs;
DROP POLICY IF EXISTS "Orgs insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Orgs update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Orgs delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins delete jobs" ON public.jobs;
CREATE POLICY "Jobs viewable" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Orgs insert jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT id FROM organization_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Orgs update jobs" ON public.jobs FOR UPDATE TO authenticated USING (org_id IN (SELECT id FROM organization_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Orgs delete jobs" ON public.jobs FOR DELETE TO authenticated USING (org_id IN (SELECT id FROM organization_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins update jobs" ON public.jobs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete jobs" ON public.jobs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER set_updated_at_jobs BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 10: APPLICATIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  resume_url TEXT, cover_letter TEXT, status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, student_id)
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own apps" ON public.applications;
DROP POLICY IF EXISTS "Students insert apps" ON public.applications;
DROP POLICY IF EXISTS "Orgs view apps for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Orgs update app status" ON public.applications;
DROP POLICY IF EXISTS "Admins view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins update applications" ON public.applications;
CREATE POLICY "Students view own apps" ON public.applications FOR SELECT TO authenticated USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Students insert apps" ON public.applications FOR INSERT TO authenticated WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Orgs view apps for their jobs" ON public.applications FOR SELECT TO authenticated USING (job_id IN (SELECT j.id FROM jobs j JOIN organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Orgs update app status" ON public.applications FOR UPDATE TO authenticated USING (job_id IN (SELECT j.id FROM jobs j JOIN organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Admins view all applications" ON public.applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update applications" ON public.applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER set_updated_at_applications BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 11: ASSESSMENTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organization_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT, assessment_type TEXT NOT NULL DEFAULT 'online',
  questions JSONB, time_limit_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Assessments viewable" ON public.assessments;
DROP POLICY IF EXISTS "Orgs insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Orgs update assessments" ON public.assessments;
DROP POLICY IF EXISTS "Orgs delete assessments" ON public.assessments;
CREATE POLICY "Assessments viewable" ON public.assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Orgs insert assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT id FROM organization_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Orgs update assessments" ON public.assessments FOR UPDATE TO authenticated USING (org_id IN (SELECT id FROM organization_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Orgs delete assessments" ON public.assessments FOR DELETE TO authenticated USING (org_id IN (SELECT id FROM organization_profiles WHERE user_id = auth.uid()));
CREATE TRIGGER set_updated_at_assessments BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 12: ASSESSMENT SUBMISSIONS ─────────────────────────
CREATE TABLE IF NOT EXISTS public.assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  answers JSONB, score DECIMAL(5,2), status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT, submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own submissions" ON public.assessment_submissions;
DROP POLICY IF EXISTS "Students insert submissions" ON public.assessment_submissions;
DROP POLICY IF EXISTS "Students update own submissions" ON public.assessment_submissions;
DROP POLICY IF EXISTS "Orgs view submissions" ON public.assessment_submissions;
DROP POLICY IF EXISTS "Orgs update submissions" ON public.assessment_submissions;
CREATE POLICY "Students view own submissions" ON public.assessment_submissions FOR SELECT TO authenticated USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Students insert submissions" ON public.assessment_submissions FOR INSERT TO authenticated WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Students update own submissions" ON public.assessment_submissions FOR UPDATE TO authenticated USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Orgs view submissions" ON public.assessment_submissions FOR SELECT TO authenticated USING (assessment_id IN (SELECT a.id FROM assessments a JOIN organization_profiles op ON a.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Orgs update submissions" ON public.assessment_submissions FOR UPDATE TO authenticated USING (assessment_id IN (SELECT a.id FROM assessments a JOIN organization_profiles op ON a.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE TRIGGER set_updated_at_assessment_submissions BEFORE UPDATE ON public.assessment_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 13: INTERVIEWS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL, status TEXT NOT NULL DEFAULT 'scheduled',
  interviewer_name TEXT, meeting_link TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Orgs view interviews" ON public.interviews;
DROP POLICY IF EXISTS "Orgs insert interviews" ON public.interviews;
DROP POLICY IF EXISTS "Orgs update interviews" ON public.interviews;
DROP POLICY IF EXISTS "Admins view all interviews" ON public.interviews;
CREATE POLICY "Students view own interviews" ON public.interviews FOR SELECT TO authenticated USING (application_id IN (SELECT a.id FROM applications a JOIN student_profiles sp ON a.student_id = sp.id WHERE sp.user_id = auth.uid()));
CREATE POLICY "Orgs view interviews" ON public.interviews FOR SELECT TO authenticated USING (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Orgs insert interviews" ON public.interviews FOR INSERT TO authenticated WITH CHECK (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Orgs update interviews" ON public.interviews FOR UPDATE TO authenticated USING (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Admins view all interviews" ON public.interviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER set_updated_at_interviews BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 14: OFFERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', salary TEXT, start_date DATE,
  offer_letter_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own offers" ON public.offers;
DROP POLICY IF EXISTS "Orgs view offers" ON public.offers;
DROP POLICY IF EXISTS "Orgs insert offers" ON public.offers;
DROP POLICY IF EXISTS "Orgs update offers" ON public.offers;
DROP POLICY IF EXISTS "Admins view all offers" ON public.offers;
CREATE POLICY "Students view own offers" ON public.offers FOR SELECT TO authenticated USING (application_id IN (SELECT a.id FROM applications a JOIN student_profiles sp ON a.student_id = sp.id WHERE sp.user_id = auth.uid()));
CREATE POLICY "Orgs view offers" ON public.offers FOR SELECT TO authenticated USING (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Orgs insert offers" ON public.offers FOR INSERT TO authenticated WITH CHECK (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Orgs update offers" ON public.offers FOR UPDATE TO authenticated USING (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN organization_profiles op ON j.org_id = op.id WHERE op.user_id = auth.uid()));
CREATE POLICY "Admins view all offers" ON public.offers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER set_updated_at_offers BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 15: MENTOR SESSIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL,
  session_type session_type NOT NULL DEFAULT 'free', amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR', status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT, meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Students book sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Mentors view own sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Mentors update sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Admins view all sessions" ON public.mentor_sessions;
CREATE POLICY "Students view own sessions" ON public.mentor_sessions FOR SELECT TO authenticated USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Students book sessions" ON public.mentor_sessions FOR INSERT TO authenticated WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentors view own sessions" ON public.mentor_sessions FOR SELECT TO authenticated USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Mentors update sessions" ON public.mentor_sessions FOR UPDATE TO authenticated USING (mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins view all sessions" ON public.mentor_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER set_updated_at_mentor_sessions BEFORE UPDATE ON public.mentor_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 16: REVIEWS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.mentor_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(session_id, student_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews viewable" ON public.reviews;
DROP POLICY IF EXISTS "Students create reviews" ON public.reviews;
CREATE POLICY "Reviews viewable" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

-- ─── STEP 17: NOTIFICATIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, message TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false, link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins view all notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ─── STEP 18: RESUMES (enhanced) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Resume',
  content JSONB, raw_text TEXT, file_url TEXT, tailored_version TEXT,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own resumes" ON public.resumes;
CREATE POLICY "Users manage own resumes" ON public.resumes FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_resumes BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── STEP 19: NOTIFICATION HELPER ────────────────────────────
CREATE OR REPLACE FUNCTION public.create_notification(_user_id UUID, _title TEXT, _message TEXT, _type TEXT DEFAULT 'info', _link TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link) VALUES (_user_id, _title, _message, _type, _link);
END; $$;

-- ─── STEP 20: NOTIFICATION TRIGGERS ──────────────────────────
CREATE OR REPLACE FUNCTION public.notify_on_application()
RETURNS TRIGGER AS $$
DECLARE _job_title TEXT; _org_user_id UUID; _student_name TEXT;
BEGIN
  SELECT j.title, op.user_id INTO _job_title, _org_user_id FROM public.jobs j JOIN public.organization_profiles op ON j.org_id = op.id WHERE j.id = NEW.job_id;
  SELECT p.full_name INTO _student_name FROM public.student_profiles sp JOIN public.profiles p ON sp.user_id = p.user_id WHERE sp.id = NEW.student_id;
  PERFORM public.create_notification(_org_user_id, 'New Application', COALESCE(_student_name, 'A student') || ' applied for ' || COALESCE(_job_title, 'a position'), 'application', '/dashboard/applications');
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_application_created ON public.applications;
CREATE TRIGGER on_application_created AFTER INSERT ON public.applications FOR EACH ROW EXECUTE FUNCTION public.notify_on_application();

CREATE OR REPLACE FUNCTION public.notify_on_application_status()
RETURNS TRIGGER AS $$
DECLARE _job_title TEXT; _student_user_id UUID;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT j.title INTO _job_title FROM public.jobs j WHERE j.id = NEW.job_id;
    SELECT sp.user_id INTO _student_user_id FROM public.student_profiles sp WHERE sp.id = NEW.student_id;
    PERFORM public.create_notification(_student_user_id, 'Application Update', 'Your application for ' || COALESCE(_job_title, 'a position') || ' has been ' || NEW.status, 'application', '/dashboard/applications');
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_application_status_changed ON public.applications;
CREATE TRIGGER on_application_status_changed AFTER UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.notify_on_application_status();

-- ─── STEP 21: STORAGE BUCKETS ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false) ON CONFLICT DO NOTHING;

-- ─── STEP 22: PERFORMANCE INDEXES ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_user_id ON public.organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_college_profiles_user_id ON public.college_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON public.jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_application_id ON public.offers(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id ON public.mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_student_id ON public.mentor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_id ON public.mentor_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_reviews_mentor_id ON public.reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);

-- ─── STEP 23: DEPRECATE OLD USERS TABLE ──────────────────────
-- (Safe rename — do NOT drop yet; verify data migration first)
-- ALTER TABLE IF EXISTS public.users RENAME TO _deprecated_users;

-- ─── MIGRATION COMPLETE ────────────────────────────────────────
-- Tables created: profiles, user_roles, student_profiles, organization_profiles,
--   mentor_profiles, college_profiles, mentor_availability, jobs, applications,
--   assessments, assessment_submissions, interviews, offers, mentor_sessions,
--   reviews, notifications, resumes (17 tables)
-- RPCs created: assign_user_role, has_role, create_notification, handle_new_user
-- Triggers: on_auth_user_created, on_application_created, on_application_status_changed
-- Storage buckets: resumes, avatars, attachments
