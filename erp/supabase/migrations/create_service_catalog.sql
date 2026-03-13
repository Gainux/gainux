-- company_services table
CREATE TABLE IF NOT EXISTS company_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price NUMERIC(15, 2) DEFAULT 0,
    duration INTEGER, -- duration in minutes or hours, depending on app logic (let's say minutes)
    status TEXT CHECK (status IN ('active', 'inactive', 'draft')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE company_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view services from their org" ON company_services
    FOR SELECT USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert services for their org" ON company_services
    FOR INSERT WITH CHECK (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update services from their org" ON company_services
    FOR UPDATE USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete services from their org" ON company_services
    FOR DELETE USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );
