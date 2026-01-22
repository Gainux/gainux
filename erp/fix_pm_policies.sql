-- Enable RLS on PM tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

-- Project Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON projects;

CREATE POLICY "Enable read access for all users" ON projects FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- Task Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON tasks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tasks;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON tasks;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON tasks;

CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON tasks FOR DELETE USING (auth.role() = 'authenticated');

-- Project Member Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON project_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON project_members;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON project_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON project_members;

CREATE POLICY "Enable read access for all users" ON project_members FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON project_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON project_members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON project_members FOR DELETE USING (auth.role() = 'authenticated');

-- Permissions
GRANT ALL ON projects TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON project_members TO authenticated;
GRANT ALL ON resource_allocations TO authenticated;
GRANT ALL ON timesheets TO authenticated;
