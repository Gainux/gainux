-- Add Comprehensive fields to Quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS scope_of_work TEXT,
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS terms TEXT,
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 0;
