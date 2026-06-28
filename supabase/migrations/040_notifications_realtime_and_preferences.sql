-- Realtime bell updates + per-profile notification preferences

alter table public.profiles
  add column if not exists push_notifications_enabled boolean not null default true,
  add column if not exists email_digest_enabled boolean not null default true;

comment on column public.profiles.push_notifications_enabled is
  'When false, server skips Web Push for this user (in-app notifications still delivered).';

comment on column public.profiles.email_digest_enabled is
  'When false, daily reminder digest cron skips this user.';

alter publication supabase_realtime add table public.notifications;
