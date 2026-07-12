alter table public.profiles
  add column if not exists nimbus_companion_quiet boolean not null default false;

comment on column public.profiles.nimbus_companion_quiet is
  'When true, Nimbus only responds to explicit tours and menu - no random or contextual hints.';
