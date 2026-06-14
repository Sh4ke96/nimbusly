-- Per-profile dashboard overview card order and visibility

alter table public.profiles
  add column if not exists dashboard_overview_layout jsonb not null default '{}'::jsonb;
