-- Schedule entries: optional end date for multi-day spans (e.g. vacations)
ALTER TABLE public.schedule_entries
  ADD COLUMN IF NOT EXISTS entry_end_date date;

ALTER TABLE public.schedule_entries
  DROP CONSTRAINT IF EXISTS schedule_entries_date_range_check;

ALTER TABLE public.schedule_entries
  ADD CONSTRAINT schedule_entries_date_range_check
  CHECK (entry_end_date IS NULL OR entry_end_date >= entry_date);
