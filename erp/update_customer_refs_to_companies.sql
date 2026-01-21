-- Migration to switch FK from customers to companies for Invoices and Projects
-- Updated: Removed Expenses table migration as 'customer_id' column does not exist and is unused.

-- 1. Update Invoices Table
-- First, drop the existing foreign key constraint if it exists
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_company_id_fkey;

-- Clean up invalid references before adding constraint
-- Set customer_id to NULL if the id does not exist in companies table
UPDATE invoices 
SET customer_id = NULL 
WHERE customer_id IS NOT NULL 
AND customer_id NOT IN (SELECT id FROM companies);

-- Add new constraint referencing companies
ALTER TABLE invoices
    ADD CONSTRAINT invoices_company_id_fkey 
    FOREIGN KEY (customer_id) 
    REFERENCES companies(id) 
    ON DELETE SET NULL;


-- 2. Update Projects Table
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_company_id_fkey;

-- Clean up invalid references
UPDATE projects 
SET client_id = NULL 
WHERE client_id IS NOT NULL 
AND client_id NOT IN (SELECT id FROM companies);

ALTER TABLE projects
    ADD CONSTRAINT projects_company_id_fkey 
    FOREIGN KEY (client_id) 
    REFERENCES companies(id) 
    ON DELETE SET NULL;


-- 3. Expenses Table - SKIPPED
-- The 'customer_id' column does not exist in the active schema and is not used by the application service.
-- We skip this to avoid "column does not exist" errors.
