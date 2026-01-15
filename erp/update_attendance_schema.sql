-- Add unique constraint to prevent duplicate attendance records for the same employee on the same day
-- This enables safe "upsert" operations without race conditions
ALTER TABLE attendance 
ADD CONSTRAINT attendance_employee_date_unique UNIQUE (employee_id, date);

-- Optional: Create an index for faster lookups by date (common query)
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
