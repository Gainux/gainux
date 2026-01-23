-- Healthcare Module Schema

-- 1. Patients Table
create table if not exists patients (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  gender text,
  contact_number text,
  email text,
  address text,
  medical_history text,
  allergies text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Medical Encounters (Visits)
create table if not exists clinical_encounters (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references employees(id) on delete set null, -- Assuming doctors are employees
  encounter_date timestamp with time zone default timezone('utc'::text, now()) not null,
  type text check (type in ('consultation', 'emergency', 'follow_up', 'checkup')) default 'consultation',
  chief_complaint text,
  diagnosis text,
  notes text,
  status text check (status in ('scheduled', 'in-progress', 'completed', 'cancelled')) default 'scheduled',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Prescriptions
create table if not exists prescriptions (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  encounter_id uuid references clinical_encounters(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references employees(id),
  status text check (status in ('draft', 'pending_pharmacy', 'dispensed', 'cancelled')) default 'draft',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Prescription Items (Linked to Inventory)
create table if not exists prescription_items (
  id uuid default gen_random_uuid() primary key,
  prescription_id uuid references prescriptions(id) on delete cascade not null,
  item_id uuid references inventory_items(id) on delete restrict, -- Drug from inventory
  quantity numeric(12,2) not null check (quantity > 0),
  dosage_instructions text, -- e.g. "1 tablet twice daily"
  dispensed_at timestamp with time zone
);

-- RLS Policies
alter table patients enable row level security;
alter table clinical_encounters enable row level security;
alter table prescriptions enable row level security;
alter table prescription_items enable row level security;

-- Grant permissions
grant all on table patients to authenticated, service_role;
grant all on table clinical_encounters to authenticated, service_role;
grant all on table prescriptions to authenticated, service_role;
grant all on table prescription_items to authenticated, service_role;

-- Access Policies (Org-based)
create policy "Enable access for org users" on patients for all using (
  auth.uid() in (
    select user_id from employees where org_id = patients.org_id
    union
    select auth_id from profiles where org_id = patients.org_id
  )
);

create policy "Enable access for org users" on clinical_encounters for all using (
  auth.uid() in (
    select user_id from employees where org_id = clinical_encounters.org_id
    union
    select auth_id from profiles where org_id = clinical_encounters.org_id
  )
);

create policy "Enable access for org users" on prescriptions for all using (
  auth.uid() in (
    select user_id from employees where org_id = prescriptions.org_id
    union
    select auth_id from profiles where org_id = prescriptions.org_id
  )
);

create policy "Enable access for org users" on prescription_items for all using (
  exists (
    select 1 from prescriptions
    where prescriptions.id = prescription_items.prescription_id
    and (
      auth.uid() in (
        select user_id from employees where org_id = prescriptions.org_id
        union
        select auth_id from profiles where org_id = prescriptions.org_id
      )
    )
  )
);
