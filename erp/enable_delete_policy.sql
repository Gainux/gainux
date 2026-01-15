-- Enable deletion of profiles
-- This usage policy allows any authenticated user (or anon if simplified) to delete profiles
-- In production, you'd restrict this to admins only:
-- CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- For now, consistent with other policies (development mode):
CREATE POLICY "Admins can delete profiles" 
ON public.profiles FOR DELETE 
USING (true);
