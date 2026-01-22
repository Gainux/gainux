-- Function to secure delete employee and their auth user (if not admin)
create or replace function delete_employee_and_auth_user(target_employee_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
  target_role text;
begin
  -- Get user_id from employee
  select user_id into target_user_id from employees where id = target_employee_id;
  
  -- If no linked user, just delete employee
  if target_user_id is null then
    delete from employees where id = target_employee_id;
    return;
  end if;

  -- Get role from profiles
  select role into target_role from profiles where id = target_user_id;

  -- Logic: If Admin, preserve auth user. Else, delete auth user.
  if target_role = 'admin' then
    -- Just delete employee record, keep auth account
    delete from employees where id = target_employee_id;
  else
    -- Delete employee first to avoid FK constraint issues if any not cascading
    delete from employees where id = target_employee_id;
    
    -- Delete auth user
    -- This requires the function to be owned by a role with permissions on auth.users (usually postgres)
    delete from auth.users where id = target_user_id;
  end if;
end;
$$;
