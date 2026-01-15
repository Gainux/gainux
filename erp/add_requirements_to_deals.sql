-- Add requirements column to deals table
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN deals.requirements IS 'Array of requirement objects with id, title, description, completed, createdAt';
