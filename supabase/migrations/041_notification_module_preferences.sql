-- Per-module notification channel preferences (in-app, push, daily email digest)

create table public.notification_module_preferences (
  user_id uuid not null references public.profiles (id) on delete cascade,
  module_id text not null,
  in_app_enabled boolean not null default true,
  push_enabled boolean not null default false,
  email_digest_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create index notification_module_preferences_user_idx
  on public.notification_module_preferences (user_id);

comment on table public.notification_module_preferences is
  'Per-user per-module toggles for in-app, push, and daily email digest.';

alter table public.notification_module_preferences enable row level security;

create policy "Users can view own notification module preferences"
  on public.notification_module_preferences for select
  using (user_id = auth.uid());

create policy "Users can insert own notification module preferences"
  on public.notification_module_preferences for insert
  with check (user_id = auth.uid());

create policy "Users can update own notification module preferences"
  on public.notification_module_preferences for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own notification module preferences"
  on public.notification_module_preferences for delete
  using (user_id = auth.uid());

-- Seed defaults for existing profiles (11 notification modules)
insert into public.notification_module_preferences (user_id, module_id)
select p.id, m.module_id
from public.profiles p
cross join (
  values
    ('budget'),
    ('shopping'),
    ('gifts'),
    ('birthdays'),
    ('calendar'),
    ('medicineCabinet'),
    ('watchlist'),
    ('restaurants'),
    ('pets'),
    ('chores'),
    ('notes')
) as m (module_id)
on conflict (user_id, module_id) do nothing;

-- Auto-seed for new profiles
create or replace function public.seed_notification_module_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_module_preferences (user_id, module_id)
  values
    (new.id, 'budget'),
    (new.id, 'shopping'),
    (new.id, 'gifts'),
    (new.id, 'birthdays'),
    (new.id, 'calendar'),
    (new.id, 'medicineCabinet'),
    (new.id, 'watchlist'),
    (new.id, 'restaurants'),
    (new.id, 'pets'),
    (new.id, 'chores'),
    (new.id, 'notes')
  on conflict (user_id, module_id) do nothing;
  return new;
end;
$$;

drop trigger if exists seed_notification_module_preferences on public.profiles;
create trigger seed_notification_module_preferences
  after insert on public.profiles
  for each row
  execute function public.seed_notification_module_preferences();
