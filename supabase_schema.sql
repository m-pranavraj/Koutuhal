/*
  # Koutuhal Pathways Database Schema

  Complete schema for the AI-powered career acceleration platform.
  This schema includes all tables, enums, indexes, and foreign key constraints.

  ## Tables

  1. users - User accounts with role-based access
  2. resumes - User resume data in JSONB format
  3. jobs - Job listings
  4. applications - Job applications with AI scoring
  5. courses - Educational courses catalog
  6. orders - Payment orders
  7. user_entitlements - Course access permissions
  8. uploaded_files - File upload tracking
  9. ai_jobs - Async AI job processing queue
  10. mentor_sessions - Mentorship session bookings
  11. audit_logs - System audit trail

  ## Security

  - All tables have proper indexes for performance
  - Foreign key constraints maintain referential integrity
  - UUID primary keys for security and scalability
  - Timestamp fields with timezone awareness
*/

-- Create custom ENUMs
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('STUDENT', 'MENTOR', 'ADMIN', 'ORGANISATION', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE jobstatus AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR,
    role userrole NOT NULL DEFAULT 'STUDENT',
    bio VARCHAR,
    xp_points INTEGER NOT NULL DEFAULT 0,
    avatar_url VARCHAR,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    content JSONB NOT NULL,
    template_id VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_resumes_user_id ON resumes(user_id);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    company VARCHAR NOT NULL,
    description TEXT NOT NULL,
    skills JSONB NOT NULL,
    location VARCHAR NOT NULL,
    job_type VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS ix_jobs_location ON jobs(location);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE RESTRICT,
    status VARCHAR NOT NULL DEFAULT 'pending',
    rank INTEGER,
    match_score INTEGER,
    processing_state VARCHAR NOT NULL DEFAULT 'scored',
    last_error VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_job_application UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS ix_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS ix_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS ix_applications_status ON applications(status);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    price INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    instructor VARCHAR,
    level VARCHAR,
    duration VARCHAR,
    rating FLOAT DEFAULT 0.0,
    category VARCHAR,
    image_url VARCHAR,
    tags JSONB DEFAULT '[]'::jsonb,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS ix_courses_is_active ON courses(is_active);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    amount INTEGER NOT NULL,
    currency VARCHAR NOT NULL DEFAULT 'INR',
    status VARCHAR NOT NULL DEFAULT 'created',
    provider_order_id VARCHAR NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS ix_orders_course_id ON orders(course_id);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status);

-- User Entitlements table
CREATE TABLE IF NOT EXISTS user_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_user_entitlements_user_id ON user_entitlements(user_id);
CREATE INDEX IF NOT EXISTS ix_user_entitlements_course_id ON user_entitlements(course_id);

-- Uploaded Files table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR NOT NULL,
    content_type VARCHAR NOT NULL,
    size_bytes INTEGER NOT NULL,
    bucket_path VARCHAR NOT NULL,
    public_url VARCHAR,
    content_hash VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS ix_uploaded_files_created_at ON uploaded_files(created_at);

-- AI Jobs table
CREATE TABLE IF NOT EXISTS ai_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_type VARCHAR NOT NULL,
    status jobstatus NOT NULL DEFAULT 'PENDING',
    input_ref VARCHAR,
    result_json JSONB,
    error TEXT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    token_usage INTEGER,
    provider VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX IF NOT EXISTS ix_ai_jobs_status ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS ix_ai_jobs_job_type ON ai_jobs(job_type);

-- Mentor Sessions table
CREATE TABLE IF NOT EXISTS mentor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR NOT NULL DEFAULT 'PENDING',
    session_type VARCHAR NOT NULL DEFAULT 'call',
    message TEXT,
    mentor_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_mentor_sessions_student_id ON mentor_sessions(student_id);
CREATE INDEX IF NOT EXISTS ix_mentor_sessions_mentor_id ON mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS ix_mentor_sessions_status ON mentor_sessions(status);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR NOT NULL,
    entity_type VARCHAR NOT NULL,
    entity_id VARCHAR,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS ix_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS ix_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs(created_at);
