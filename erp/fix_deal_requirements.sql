-- Check if 'requirements' column exists in 'deals' table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deals' AND column_name = 'requirements';

-- Add 'requirements' column if it doesn't exist
ALTER TABLE deals ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb;
