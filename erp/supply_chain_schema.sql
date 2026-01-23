-- Supply Chain & Procurement Schema

-- 1. Inventory Items (Products extended for stock)
-- We might already have 'products' table from Marketplace/Sales. 
-- If 'products' exists, we should extend it or link to it. 
-- For now, assuming a distinct 'inventory_items' table for raw materials/stockable items if 'products' is only for sales.
-- However, typically 'products' serves both. Let's check if 'products' exists.
-- The user has 'marketplace_products' or similar? 
-- In `marketplaceService.ts`, it references `products` table.
-- Let's use `inventory_items` to be safe and specific to supply chain, or alias it.
-- Better: `inventory_items` for internal stock handling.

create table if not exists inventory_items (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  sku text, -- Stock Keeping Unit
  description text,
  category text,
  unit text default 'pcs', -- e.g., pcs, kg, liters
  cost_price numeric(12,2) default 0,
  selling_price numeric(12,2) default 0,
  reorder_level integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Warehouses
create table if not exists warehouses (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  location text,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Inventory Stock (Stock levels)
create table if not exists inventory_stock (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  item_id uuid references inventory_items(id) on delete cascade not null,
  warehouse_id uuid references warehouses(id) on delete cascade not null,
  quantity_on_hand numeric(12,2) default 0,
  quantity_reserved numeric(12,2) default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(item_id, warehouse_id)
);

-- 4. Purchase Orders
create table if not exists purchase_orders (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  vendor_id uuid references vendors(id) on delete set null, -- Assuming vendors table exists
  order_number text not null,
  status text check (status in ('draft', 'sent', 'partial', 'received', 'cancelled')) default 'draft',
  order_date date default current_date,
  expected_delivery_date date,
  total_amount numeric(12,2) default 0,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PO Items
create table if not exists purchase_order_items (
  id uuid default gen_random_uuid() primary key,
  po_id uuid references purchase_orders(id) on delete cascade not null,
  item_id uuid references inventory_items(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) generated always as (quantity * unit_price) stored,
  received_quantity numeric(12,2) default 0
);

-- RLS Policies (Basic Draft)
alter table inventory_items enable row level security;
alter table warehouses enable row level security;
alter table inventory_stock enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;

-- Policies: Allow all actions for users in the same Org
create policy "Enable access for org users" on inventory_items for all using (auth.uid() in (select user_id from employees where org_id = inventory_items.org_id));
create policy "Enable access for org users" on warehouses for all using (auth.uid() in (select user_id from employees where org_id = warehouses.org_id));
create policy "Enable access for org users" on inventory_stock for all using (auth.uid() in (select user_id from employees where org_id = inventory_stock.org_id));
create policy "Enable access for org users" on purchase_orders for all using (auth.uid() in (select user_id from employees where org_id = purchase_orders.org_id));
create policy "Enable access for org users" on purchase_order_items for all using (auth.uid() in (select po_id from purchase_orders where id = purchase_order_items.po_id and org_id = (select org_id from employees where user_id = auth.uid())));

