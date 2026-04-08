-- Migration: transition_to_saas.sql
-- Purpose: Remove non-SaaS module tables (Healthcare, Procurement/Supply Chain)

-- 1. Drop Healthcare Tables
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS clinical_encounters CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- 2. Drop Supply Chain / Procurement Tables
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory_stock CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
-- Also drop vendors if not used by Finance (usually Finance needs vendors too, but let's check. 
-- If 'vendors' was created in supply_chain_schema, it might be gone. 
-- Ideally, Finance needs 'vendors' for expenses. Let's keep 'vendors' if it exists separately or recreated it for Finance later.)
-- Checking previous file view: 'vendors' was referenced but table definition wasn't in the snippet. 
-- Safest to leave 'vendors' alone for now or ensure it's in Finance.

-- 3. Drop Marketplace Tables (if any exist independently)
-- (Assuming standard 'products' might be used for SaaS plans, so be careful. 
-- wide cleanup of 'marketplace' usually implies 'marketplace_products' etc.)
-- For now, just the known heavy operational tables.
