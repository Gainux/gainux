-- Enable RLS
ALTER TABLE department_module_access ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins/Managers can view/edit everything in their Org
DROP POLICY IF EXISTS "Admins manage department access" ON department_module_access;
CREATE POLICY "Admins manage department access" 
ON department_module_access
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
          AND org_id = department_module_access.org_id
          AND role IN ('admin', 'manager', 'owner')
    )
);

-- Policy 2: Employees can VIEW access for their Org (so they can see what they have access to)
DROP POLICY IF EXISTS "Employees view department access" ON department_module_access;
CREATE POLICY "Employees view department access" 
ON department_module_access
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() 
          AND org_id = department_module_access.org_id
    )
);

-- Note: We now have split logic. 
-- Admins have org_id in profiles.
-- Employees have org_id in employees table.
-- This covers both cases.
