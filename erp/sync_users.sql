-- Sync Existing Users from Auth to Profiles

-- Insert missing profiles for existing auth users
INSERT INTO public.profiles (auth_id, email, full_name, role, status, created_at, updated_at)
SELECT 
    id as auth_id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    'user' as role, -- Default role
    'active' as status,
    created_at,
    CASE WHEN updated_at IS NULL THEN created_at ELSE updated_at END
FROM auth.users
WHERE id NOT IN (SELECT auth_id FROM public.profiles WHERE auth_id IS NOT NULL)
ON CONFLICT (email) DO UPDATE 
SET auth_id = EXCLUDED.auth_id;

-- Output result (optional, checks count)
-- SELECT count(*) as "Synced Users" FROM public.profiles;
