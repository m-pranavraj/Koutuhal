# Backend Analysis

## Overview (End-to-end)
1. Client submits resume + user info to `/api/upload`.
2. `/api/upload` parses the multipart form, upserts a user by email, extracts PDF text, uploads the PDF to Supabase Storage, and writes a `resumes` row.
3. Client then calls `/api/analyze` with IDs/text from step 2.
4. `/api/analyze` calls Groq for scoring and saves the analysis to the `analyses` table.
5. Client can call `/api/jobs` to fetch job listings from SearchAPI and render them.

---

## File-by-file analysis

### `lib/supabaseServer.js`
- Creates a Supabase client using `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- This is a server-side client with full database/storage access.

### `pages/api/upload.js`
- Disables Next.js body parser to handle file uploads.
- Uses `formidable` to parse fields and file uploads.
- Validates required fields: `name`, `email`, and `resume` file.
- **User upsert**:
  - Checks for an existing user by email in `public.users`.
  - If not found, inserts a new user with `name`, `email`, and optional `phone`.
- **PDF text extraction**:
  - Reads the uploaded file from disk and uses `pdf-parse` to extract text.
- **Storage upload**:
  - Uploads the PDF to the Supabase Storage bucket `resumes` under a path like `{user_id}/{timestamp}_filename`.
  - Gets a public URL for the uploaded file.
- **Database insert**:
  - Inserts a row into `public.resumes` with `user_id`, `file_path`, `url`, and `resume_text`.
- Returns `user_id`, `resume_id`, and `resume_text` to the client.

### `pages/api/analyze.js`
- Validates required fields: `user_id`, `resume_id`, `resume_text`, and `role`.
- Builds a strict JSON-only prompt for Groq.
- Calls Groq (`llama-3.1-8b-instant`) to generate a score, strengths, gaps, and better roles.
- Parses the AI response to a JSON object.
- Inserts the result into `public.analyses` with:
  - `user_id`, `resume_id`, `role`, `job_description`, `score`, `strengths`, `gaps`, `better_roles`.
- Returns analysis fields to the client.

### `pages/api/jobs.js`
- Requires `role` query parameter (uses `location=India` by default).
- Calls SearchAPI (`https://www.searchapi.io/api/v1/search`).
- Normalizes job listing fields to `{ title, company, location, apply_url }`.
- Returns up to 10 jobs.

### `supabase-schema.sql`
- Defines tables `users`, `resumes`, `analyses`.
- Creates storage bucket `resumes` and policies for service role access.
- Enables RLS and grants service role full access.

### `fix-resumes-table.sql`
- Adds `url` and `resume_text` columns to `public.resumes` if missing.

---

## Is user data being stored?
**Yes.** User data and resumes are stored in Supabase.

### Where it is stored
- **User profile data** (`name`, `email`, `phone`) is stored in **`public.users`**.
- **Resume file** is stored in **Supabase Storage bucket `resumes`** (public URL returned).
- **Resume metadata & text** is stored in **`public.resumes`**:
  - `user_id`, `file_path`, `url`, `resume_text`.
- **AI analysis results** are stored in **`public.analyses`**:
  - `score`, `strengths`, `gaps`, `better_roles`, plus role/job_description.

---

## Notes / Potential schema mismatch
- `supabase-schema.sql` defines `resumes.file_url`, but the API writes `file_path` and `url`.
- `fix-resumes-table.sql` adds `url` and `resume_text`, but not `file_path`.
- If the live DB schema does not include `file_path` and `url`, inserts in `/api/upload` will fail.

---

## Data flow summary
- Input: user profile + resume PDF (stored in DB + storage).
- Processing: PDF text extraction and AI scoring.
- Output: analysis data and recommended roles stored in DB and returned to UI.
