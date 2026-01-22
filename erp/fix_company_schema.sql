-- Ensure 'email' column exists
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;

-- Ensure 'industry' column exists (just in case)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;

-- Ensure 'status' column exists (if used by any legacy logic, though we removed it from form, better safe)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
