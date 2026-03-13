-- Fix DELETE policies for sales_orders and quotes
-- Run this in the Supabase SQL Editor

-- 1. Add DELETE policy for sales_orders
CREATE POLICY "Users can delete orders from their org" ON sales_orders
    FOR DELETE USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- 2. Add DELETE policy for quotes
-- Assuming quotes table also lacks a DELETE policy
CREATE POLICY "Users can delete quotes from their org" ON quotes
    FOR DELETE USING (
        org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    );
