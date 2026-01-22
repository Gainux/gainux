-- Fix Leave Balance RLS Permissions

-- 1. Ensure RLS is enabled
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to be safe
DROP POLICY IF EXISTS "Enable all for authenticated" ON leave_balances;
DROP POLICY IF EXISTS "Allow all for authenticated" ON leave_balances;

-- 3. Create permissive policy for authenticated users (Admins/Managers need to update others' balances)
CREATE POLICY "Enable all for authenticated" ON leave_balances
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- 4. Do the same for Leave Types (just in case)
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated" ON leave_types;
CREATE POLICY "Enable all for authenticated" ON leave_types
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
