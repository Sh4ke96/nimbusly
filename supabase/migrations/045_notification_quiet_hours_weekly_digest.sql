-- Notification quiet hours + weekly email digest preference

alter table public.profiles
  add column if not exists notification_quiet_hours_enabled boolean not null default false,
  add column if not exists notification_quiet_start time not null default '22:00',
  add column if not exists notification_quiet_end time not null default '07:00',
  add column if not exists weekly_digest_enabled boolean not null default false;

comment on column public.profiles.notification_quiet_hours_enabled is
  'When true, push notifications are suppressed during quiet hours (local browser time on dispatch).';

comment on column public.profiles.weekly_digest_enabled is
  'When true, weekly summary email cron includes this user.';
