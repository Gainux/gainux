
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
