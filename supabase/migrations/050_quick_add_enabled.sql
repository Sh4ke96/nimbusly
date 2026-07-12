alter table public.profiles
  add column if not exists quick_add_enabled boolean not null default true;

comment on column public.profiles.quick_add_enabled is
  'When false, hides Ctrl+K quick-add panel and mobile + FAB for this user.';
