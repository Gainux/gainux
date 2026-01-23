-- Add departments_to_visit column to clinical_encounters
ALTER TABLE clinical_encounters 
ADD COLUMN IF NOT EXISTS departments_to_visit JSONB DEFAULT '[]'::jsonb;
