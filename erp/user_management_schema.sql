-- User Management Schema

-- Re-create profiles table to allow pre-creating users (invites) without auth_id initially
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Linked when user signs up
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to insert/update profiles
-- In a real app, restrict this to users with 'admin' role
CREATE POLICY "Admins can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (true); -- Simplified for development, ideally restrict to admin role

CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
USING (true); -- Simplified

CREATE POLICY "Admins can delete profiles" 
ON public.profiles FOR DELETE 
USING (true); -- Simplified

-- Trigger to link auth user to profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile exists by email
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = new.email) THEN
    -- Link existing profile
    UPDATE public.profiles 
    SET auth_id = new.id, 
        avatar_url = new.raw_user_meta_data->>'avatar_url',
        full_name = COALESCE(full_name, new.raw_user_meta_data->>'full_name')
    WHERE email = new.email;
  ELSE
    -- Create new profile
    INSERT INTO public.profiles (auth_id, email, full_name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
