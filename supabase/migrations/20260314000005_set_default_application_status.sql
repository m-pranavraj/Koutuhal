-- Set default status for applications that have NULL status
UPDATE applications
SET status = 'pending'
WHERE status IS NULL;

-- Add default constraint for future applications
ALTER TABLE applications 
ALTER COLUMN status SET DEFAULT 'pending';
