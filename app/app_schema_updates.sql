-- Gainux Referral Portal MVP Migrations
-- Run these in your Supabase SQL Editor to support the new features.

-- 1. Update Profiles Table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kyc_full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'referrer';

-- 2. Update Leads Table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS service_category TEXT,
ADD COLUMN IF NOT EXISTS budget TEXT,
ADD COLUMN IF NOT EXISTS is_consent_given BOOLEAN DEFAULT false;

-- 3. Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    balance NUMERIC(15, 2) DEFAULT 0 CHECK (balance >= 0),
    total_earned NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create wallet for new user (Optional, but recommended)
-- CREATE OR REPLACE FUNCTION public.handle_new_user_wallet() 
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.wallets (user_id, balance, total_earned)
--   VALUES (new.id, 0, 0);
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE TRIGGER on_auth_user_created_wallet
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_wallet();

-- 4. Transactions Ledger
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT CHECK (type IN ('credit', 'debit')) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: RLS policies should ideally be created for the above tables to isolate data for each Referrer.
-- example:
-- ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users edit own wallet" ON wallets FOR ALL USING (auth.uid() = user_id);

-- 6. Leads RLS Policy
-- Allow referrers to insert their own leads.
CREATE POLICY "Referrers can insert leads" ON leads FOR INSERT
WITH CHECK (auth.uid() = referrer_id);
