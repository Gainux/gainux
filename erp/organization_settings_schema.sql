-- Organization Settings Table
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL DEFAULT 'Gainux',
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gstin TEXT,
    dark_mode BOOLEAN DEFAULT false,
    primary_color TEXT DEFAULT 'blue',
    email_notifications BOOLEAN DEFAULT true,
    notify_invoice_due BOOLEAN DEFAULT true,
    notify_deal_won BOOLEAN DEFAULT true,
    notify_new_lead BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO organization_settings (organization_name)
VALUES ('Gainux')
ON CONFLICT DO NOTHING;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_org_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_settings_timestamp 
BEFORE UPDATE ON organization_settings
FOR EACH ROW EXECUTE FUNCTION update_org_settings_updated_at();
