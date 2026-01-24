-- Add start_time and end_time to timesheets for timer functionality
ALTER TABLE public.timesheets 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Add index for finding active timer (where end_time is null)
CREATE INDEX IF NOT EXISTS idx_timesheets_active_timer ON public.timesheets(employee_id) WHERE end_time IS NULL;
