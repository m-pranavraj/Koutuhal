-- Fix Storage RLS for student resume uploads in the resumes bucket.
-- Settings page uploads with file name pattern: <auth.uid()>-resume-<timestamp>.<ext>

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "resumes_select_own" ON storage.objects;
DROP POLICY IF EXISTS "resumes_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "resumes_update_own" ON storage.objects;
DROP POLICY IF EXISTS "resumes_delete_own" ON storage.objects;

CREATE POLICY "resumes_select_own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (
    name LIKE auth.uid()::text || '-%'
    OR name LIKE auth.uid()::text || '/%'
  )
);

CREATE POLICY "resumes_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND (
    name LIKE auth.uid()::text || '-%'
    OR name LIKE auth.uid()::text || '/%'
  )
);

CREATE POLICY "resumes_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (
    name LIKE auth.uid()::text || '-%'
    OR name LIKE auth.uid()::text || '/%'
  )
)
WITH CHECK (
  bucket_id = 'resumes'
  AND (
    name LIKE auth.uid()::text || '-%'
    OR name LIKE auth.uid()::text || '/%'
  )
);

CREATE POLICY "resumes_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (
    name LIKE auth.uid()::text || '-%'
    OR name LIKE auth.uid()::text || '/%'
  )
);

NOTIFY pgrst, 'reload schema';
