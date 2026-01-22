-- Function to safely create or update an employee profile as an Admin
-- Bypasses RLS constraints by using SECURITY DEFINER
create or replace function create_employee_profile(
  target_id uuid,
  target_email text,
  target_first_name text,
  target_last_name text,
  target_org_id uuid,
  target_role text default 'employee',
  target_status text default 'active'
)
returns void
language plpgsql
security definer
as $$
begin
  -- Check if the executor is an admin (optional, for extra security)
  -- But for now, we assume the app logic handles who can call this (usually hidden behind RLS or backend logic if possible, but here accessible to auth users)
  -- Realistically, this function should probably check if auth.uid() is an admin of the target_org_id
  
  if not exists (
    select 1 from profiles 
    where id = auth.uid() 
    and role = 'admin' 
    and org_id = target_org_id
  ) then
    raise exception 'Access Denied: Only admins can create employee profiles.';
  end if;

  insert into profiles (id, email, first_name, last_name, org_id, role, status)
  values (target_id, target_email, target_first_name, target_last_name, target_org_id, target_role, target_status)
  on conflict (id) do update
  set 
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    org_id = EXCLUDED.org_id,
    role = EXCLUDED.role,
    status = EXCLUDED.status;
end;
$$;
