-- 1. Repair the specific user
UPDATE profiles
SET org_id = (
    SELECT org_id 
    FROM profiles 
    WHERE role = 'admin' 
    AND org_id IS NOT NULL 
    LIMIT 1
)
WHERE id = '28e922de-6b01-41c1-8805-84978ac2614f'
AND org_id IS NULL;

-- 2. Ensure RLS Policy allows Admins to insert/update ALL profiles
-- (Drop existing if conflict, or perform check first. For safety, we use DO block or just create if not exists using standard approach, but simple DROP/CREATE is easier for policies)

DROP POLICY IF EXISTS "Admins can insert any profile" ON profiles;
CREATE POLICY "Admins can insert any profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  OR auth.uid() = id -- Users can insert their own (if trigger doesn't do it)
);

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  OR auth.uid() = id -- Users can update their own
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  OR auth.uid() = id
);
