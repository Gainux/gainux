-- Enable Write Access for Products
-- Currently only SELECT is allowed. We need to allow INSERT, UPDATE, DELETE for authenticated users (ERP admins).

CREATE POLICY "Enable insert for authenticated users" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'products';
