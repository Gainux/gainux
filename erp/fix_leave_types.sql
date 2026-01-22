
-- Fix Leave Types Schema

-- 1. Make org_id nullable to support global default leave types
ALTER TABLE leave_types ALTER COLUMN org_id DROP NOT NULL;

-- 2. Seed Default Leave Types (if they don't exist)
INSERT INTO leave_types (name, days_allowed_per_year, is_paid)
SELECT 'Casual Leave', 12, true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Casual Leave' AND org_id IS NULL);

INSERT INTO leave_types (name, days_allowed_per_year, is_paid)
SELECT 'Sick Leave', 10, true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Sick Leave' AND org_id IS NULL);

INSERT INTO leave_types (name, days_allowed_per_year, is_paid)
SELECT 'Privilege Leave', 15, true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Privilege Leave' AND org_id IS NULL);

INSERT INTO leave_types (name, days_allowed_per_year, is_paid)
SELECT 'Bereavement Leave', 3, true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = 'Bereavement Leave' AND org_id IS NULL);

-- 3. Ensure Policies
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated" ON leave_types;
CREATE POLICY "Enable all for authenticated" ON leave_types FOR ALL TO authenticated USING (true);
