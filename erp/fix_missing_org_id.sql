-- Fix missing Org ID for the specific user
-- We assume the org_id should be the same as the first admin found in the system
-- Replace '804fd025-7600-4a67-b9e0-f0a25f06942d' with the actual user ID if different

UPDATE profiles
SET org_id = (
    SELECT org_id 
    FROM profiles 
    WHERE role = 'admin' 
    AND org_id IS NOT NULL 
    LIMIT 1
)
WHERE id = '804fd025-7600-4a67-b9e0-f0a25f06942d'
AND org_id IS NULL;

-- Verify the update
SELECT * FROM profiles WHERE id = '804fd025-7600-4a67-b9e0-f0a25f06942d';
