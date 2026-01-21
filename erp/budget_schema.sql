
-- Budgeting Module Schema

-- 1. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "FY 2024"
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Budget Items Table (Allocations per Account)
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  period_type TEXT DEFAULT 'total', -- 'total', 'monthly' (reserved for future)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(budget_id, account_id) -- Prevent duplicate entries for same account in same budget
);

-- RLS Policies
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Budgets: View/Edit for Organization Members
-- We verify membership by checking the user's profile which contains the org_id.

DROP POLICY IF EXISTS "Users can view budgets of their organization" ON budgets;
CREATE POLICY "Users can view budgets of their organization"
  ON budgets FOR SELECT
  USING (org_id = (SELECT org_id FROM profiles WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert budgets for their organization" ON budgets;
CREATE POLICY "Users can insert budgets for their organization"
  ON budgets FOR INSERT
  WITH CHECK (org_id = (SELECT org_id FROM profiles WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update budgets for their organization" ON budgets;
CREATE POLICY "Users can update budgets for their organization"
  ON budgets FOR UPDATE
  USING (org_id = (SELECT org_id FROM profiles WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete budgets for their organization" ON budgets;
CREATE POLICY "Users can delete budgets for their organization"
  ON budgets FOR DELETE
  USING (org_id = (SELECT org_id FROM profiles WHERE auth_id = auth.uid()));

-- Budget Items: Cascaded access via budget
DROP POLICY IF EXISTS "Users can view budget items of their organization" ON budget_items;
CREATE POLICY "Users can view budget items of their organization"
  ON budget_items FOR SELECT
  USING (budget_id IN (
    SELECT id FROM budgets WHERE org_id = (SELECT org_id FROM profiles WHERE auth_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage budget items of their organization" ON budget_items;
CREATE POLICY "Users can manage budget items of their organization"
  ON budget_items FOR ALL
  USING (budget_id IN (
    SELECT id FROM budgets WHERE org_id = (SELECT org_id FROM profiles WHERE auth_id = auth.uid())
  ));
