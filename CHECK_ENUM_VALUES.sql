-- Check what application_status enum values are in the database
SELECT 
  t.typname,
  e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%application%' OR t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;

-- Also check the applications table status column
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'applications' AND column_name = 'status';
