-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  features JSONB,
  version TEXT,
  download_url TEXT,
  release_date TIMESTAMP WITH TIME ZONE
);

-- Create Marketplace Orders Table
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  payment_intent_id TEXT
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_id UUID REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  price NUMERIC NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_order_items ENABLE ROW LEVEL SECURITY;

-- Policies for Products (Public Read)
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);

-- Policies for Orders (User can see own orders)
CREATE POLICY "Users can view own orders" ON marketplace_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON marketplace_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Order Items
CREATE POLICY "Users can view own order items" ON marketplace_order_items FOR SELECT USING (
  exists (
    select 1 from marketplace_orders
    where marketplace_orders.id = marketplace_order_items.order_id
    and marketplace_orders.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own order items" ON marketplace_order_items FOR INSERT WITH CHECK (
  exists (
    select 1 from marketplace_orders
    where marketplace_orders.id = marketplace_order_items.order_id
    and marketplace_orders.user_id = auth.uid()
  )
);
