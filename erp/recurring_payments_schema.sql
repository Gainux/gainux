-- Recurring Payments Schema

CREATE TABLE IF NOT EXISTS recurring_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    payment_day INTEGER NOT NULL DEFAULT 1 CHECK (payment_day >= 1 AND payment_day <= 31),
    start_date DATE NOT NULL,
    end_date DATE,
    occurrences INTEGER,
    occurrences_completed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    next_payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast org-scoped queries
CREATE INDEX IF NOT EXISTS idx_recurring_payments_org_id ON recurring_payments(org_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_recurring_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recurring_payments_updated_at
    BEFORE UPDATE ON recurring_payments
    FOR EACH ROW EXECUTE FUNCTION update_recurring_payments_updated_at();

-- Row Level Security
ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_recurring_payments"
    ON recurring_payments FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "org_members_insert_recurring_payments"
    ON recurring_payments FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "org_members_update_recurring_payments"
    ON recurring_payments FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "org_members_delete_recurring_payments"
    ON recurring_payments FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );
