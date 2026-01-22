select
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema as foreign_table_schema,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name,
    rc.delete_rule
from information_schema.table_constraints as tc 
join information_schema.key_column_usage as kcu on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage as ccu on ccu.constraint_name = tc.constraint_name
join information_schema.referential_constraints as rc on rc.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='employees';
