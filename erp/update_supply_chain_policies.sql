-- Update Permissions and RLS Policies for Procurement Module

-- 1. Grant permissions to authenticated users (fixes 403 Permission Denied if missing)
grant all on table inventory_items to authenticated, service_role;
grant all on table warehouses to authenticated, service_role;
grant all on table inventory_stock to authenticated, service_role;
grant all on table purchase_orders to authenticated, service_role;
grant all on table purchase_order_items to authenticated, service_role;

-- 2. Update RLS Policies to allow access for both Employees AND Profiles (Admins)
--    The previous policies only checked 'employees' table, locking out admins who are in 'profiles' but not 'employees'.
--    Also fixes a bug in purchase_order_items policy.

-- Inventory Items
drop policy if exists "Enable access for org users" on inventory_items;
create policy "Enable access for org users" on inventory_items for all using (
  auth.uid() in (
    select user_id from employees where org_id = inventory_items.org_id
    union
    select auth_id from profiles where org_id = inventory_items.org_id
  )
);

-- Warehouses
drop policy if exists "Enable access for org users" on warehouses;
create policy "Enable access for org users" on warehouses for all using (
  auth.uid() in (
    select user_id from employees where org_id = warehouses.org_id
    union
    select auth_id from profiles where org_id = warehouses.org_id
  )
);

-- Inventory Stock
drop policy if exists "Enable access for org users" on inventory_stock;
create policy "Enable access for org users" on inventory_stock for all using (
  auth.uid() in (
    select user_id from employees where org_id = inventory_stock.org_id
    union
    select auth_id from profiles where org_id = inventory_stock.org_id
  )
);

-- Purchase Orders
drop policy if exists "Enable access for org users" on purchase_orders;
create policy "Enable access for org users" on purchase_orders for all using (
  auth.uid() in (
    select user_id from employees where org_id = purchase_orders.org_id
    union
    select auth_id from profiles where org_id = purchase_orders.org_id
  )
);

-- Purchase Order Items (Checks parent PO's org_id)
drop policy if exists "Enable access for org users" on purchase_order_items;
create policy "Enable access for org users" on purchase_order_items for all using (
  exists (
    select 1 from purchase_orders
    where purchase_orders.id = purchase_order_items.po_id
    and (
      auth.uid() in (
        select user_id from employees where org_id = purchase_orders.org_id
        union
        select auth_id from profiles where org_id = purchase_orders.org_id
      )
    )
  )
);
