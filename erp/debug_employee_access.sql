-- 1. Check the specific user's employee record and department
select e.id, e.user_id, e.department_id, d.name as department_name, e.org_id
from employees e
left join departments d on e.department_id = d.id
where e.email = 'akhilpullan4@gmail.com'; -- Assuming this is the email, logic relies on user_id but this helps find it.

-- 2. Check Department Access Records for that department
select * from department_module_access 
where department_id in (
    select department_id from employees where email = 'akhilpullan4@gmail.com'
);

-- 3. Check System User Role
select id, email, role from profiles where email = 'akhilpullan4@gmail.com';
