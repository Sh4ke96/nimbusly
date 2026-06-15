alter table public.profiles
  add column if not exists nimbus_companion_enabled boolean not null default true;

comment on column public.profiles.nimbus_companion_enabled is
  'Whether the Nimbus in-app companion bubble is visible';
