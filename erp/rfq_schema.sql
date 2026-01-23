-- RFQ Schema for Procurement Module

-- 1. RFQs Table
create table if not exists rfqs (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  rfq_number text not null,
  title text,
  status text check (status in ('draft', 'open', 'closed', 'awarded')) default 'draft',
  deadline date,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RFQ Items Table
create table if not exists rfq_items (
  id uuid default gen_random_uuid() primary key,
  rfq_id uuid references rfqs(id) on delete cascade not null,
  item_id uuid references inventory_items(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0),
  notes text
);

-- 3. RLS Policies
alter table rfqs enable row level security;
alter table rfq_items enable row level security;

-- Grant permissions
grant all on table rfqs to authenticated, service_role;
grant all on table rfq_items to authenticated, service_role;

-- RFQ Policies (Access for Employees and Admins/Profiles)
create policy "Enable access for org users" on rfqs for all using (
  auth.uid() in (
    select user_id from employees where org_id = rfqs.org_id
    union
    select auth_id from profiles where org_id = rfqs.org_id
  )
);

-- RFQ Items Policies (Check parent RFQ org_id)
create policy "Enable access for org users" on rfq_items for all using (
  exists (
    select 1 from rfqs
    where rfqs.id = rfq_items.rfq_id
    and (
      auth.uid() in (
        select user_id from employees where org_id = rfqs.org_id
        union
        select auth_id from profiles where org_id = rfqs.org_id
      )
    )
  )
);
