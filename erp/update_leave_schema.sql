
-- Update Leave Schema

-- 1. Create Leave Types table
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID, -- Optional validation later
    name TEXT NOT NULL,
    days_allowed_per_year NUMERIC NOT NULL DEFAULT 0,
    is_paid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Leave Balances table
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    days_taken NUMERIC DEFAULT 0,
    days_remaining NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, leave_type_id, year)
);

-- 3. Update Leave Requests table
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_type_id UUID REFERENCES leave_types(id);
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS days_count NUMERIC DEFAULT 1;
-- reason already exists
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Enable RLS
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- 5. Policies (permissive for now)
DROP POLICY IF EXISTS "Enable all for authenticated" ON leave_types;
CREATE POLICY "Enable all for authenticated" ON leave_types FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable all for authenticated" ON leave_balances;
CREATE POLICY "Enable all for authenticated" ON leave_balances FOR ALL TO authenticated USING (true);

-- 6. Seed some default leave types if table is empty
INSERT INTO leave_types (name, days_allowed_per_year, is_paid)
SELECT 'Casual Leave', 12, true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Casual Leave');

INSERT INTO leave_types (name, days_allowed_per_year, is_paid)
SELECT 'Sick Leave', 10, true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Sick Leave');

INSERT INTO leave_types (name, days_allowed_per_year, is_paid)
SELECT 'Privilege Leave', 15, true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Privilege Leave');
