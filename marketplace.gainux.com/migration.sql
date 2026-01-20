-- Migration to add download_url to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS download_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products';
