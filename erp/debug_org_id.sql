-- Check all profiles to see who has an org_id
SELECT id, email, role, org_id FROM profiles;

-- Check if the specific user has an entry in the employees table
SELECT id, user_id, org_id FROM employees WHERE user_id = '28e922de-6b01-41c1-8805-84978ac2614f';
