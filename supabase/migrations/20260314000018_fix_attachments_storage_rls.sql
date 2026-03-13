-- Fix Storage RLS for offer letter uploads in attachments bucket.
-- Error fixed: "new row violates row-level security policy" on storage.objects insert.

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Remove conflicting old policies if they exist.
DROP POLICY IF EXISTS "attachments_offers_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "attachments_offers_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "attachments_offers_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "attachments_offers_delete_authenticated" ON storage.objects;

-- Allow authenticated users to access objects under offers/* inside attachments bucket.
CREATE POLICY "attachments_offers_select_authenticated"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND split_part(name, '/', 1) = 'offers'
);

CREATE POLICY "attachments_offers_insert_authenticated"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND split_part(name, '/', 1) = 'offers'
);

CREATE POLICY "attachments_offers_update_authenticated"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND split_part(name, '/', 1) = 'offers'
)
WITH CHECK (
  bucket_id = 'attachments'
  AND split_part(name, '/', 1) = 'offers'
);

CREATE POLICY "attachments_offers_delete_authenticated"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND split_part(name, '/', 1) = 'offers'
);

NOTIFY pgrst, 'reload schema';
