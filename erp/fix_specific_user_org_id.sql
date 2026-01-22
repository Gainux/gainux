-- Fix missing Org ID for the specific user
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
