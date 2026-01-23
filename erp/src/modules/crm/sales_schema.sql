-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL, -- Link to organization for multi-tenancy
    order_number TEXT NOT NULL,
    quote_id UUID REFERENCES quotes(id),
    deal_id UUID REFERENCES deals(id),
    company_id UUID REFERENCES companies(id),
    status TEXT CHECK (status IN ('draft', 'confirmed', 'delivered', 'cancelled')) DEFAULT 'draft',
    total_amount NUMERIC(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_date TIMESTAMP WITH TIME ZONE,
    billing_address TEXT,
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Line Items Table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    total NUMERIC(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (assuming standard profile-based tenant isolation)
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders from their org" ON sales_orders
    FOR SELECT USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert orders for their org" ON sales_orders
    FOR INSERT WITH CHECK (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update orders from their org" ON sales_orders
    FOR UPDATE USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- Items inherit access via order_id (simplified view/edit for anyone with order access)
CREATE POLICY "Users can view items for accessible orders" ON sales_order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM sales_orders WHERE id = sales_order_items.order_id)
    );

CREATE POLICY "Users can manage items for accessible orders" ON sales_order_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM sales_orders WHERE id = sales_order_items.order_id)
    );
