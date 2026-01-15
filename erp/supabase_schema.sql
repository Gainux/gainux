-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  total_revenue TEXT DEFAULT '$0.00',
  last_order_date DATE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  website TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- Create Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  last_contacted TIMESTAMP WITH TIME ZONE,
  owner UUID REFERENCES auth.users(id)
);

-- Create Deals Table
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  value NUMERIC,
  stage TEXT DEFAULT 'new',
  company TEXT,
  contact_id UUID REFERENCES leads(id),
  expected_close_date DATE,
  probability INTEGER
);

-- Create Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  date TIMESTAMP WITH TIME ZONE,
  related_to UUID,
  status TEXT
);

-- Set up Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create Policies (Drop first to avoid duplicates if re-running)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON customers;
CREATE POLICY "Enable all for authenticated users" ON customers FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable all for authenticated users" ON leads;
CREATE POLICY "Enable all for authenticated users" ON leads FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable all for authenticated users" ON deals;
CREATE POLICY "Enable all for authenticated users" ON deals FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable all for authenticated users" ON activities;
CREATE POLICY "Enable all for authenticated users" ON activities FOR ALL TO authenticated USING (true);
