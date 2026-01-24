-- Add is_billable to timesheets
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS is_billable BOOLEAN DEFAULT FALSE;

-- Add hourly_rate to timesheets (optional, to lock in rate at time of entry)
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 0;

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_timesheets_is_billable ON timesheets(is_billable);
