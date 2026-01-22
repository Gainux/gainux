-- Function to secure delete employee and their auth user
-- Replaces previous version to enforce auth user deletion
create or replace function delete_employee_and_auth_user(target_employee_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  target_user_id uuid;
begin
  -- Get user_id from employee
  select user_id into target_user_id from employees where id = target_employee_id;
  
  -- Delete employee record
  delete from employees where id = target_employee_id;
  
  -- If linked user exists, delete from auth.users
  if target_user_id is not null then
    delete from auth.users where id = target_user_id;
  end if;
end;
$$;
