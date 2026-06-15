-- Per-day completion for recurring chore series

alter table public.chore_tasks
  add column completed_dates date[] not null default '{}';
