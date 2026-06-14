-- Birthdays module + in-app notifications

create table public.birthday_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  person_name text not null,
  birth_month int not null check (birth_month between 1 and 12),
  birth_day int not null check (birth_day between 1 and 31),
  birth_year int check (birth_year is null or birth_year between 1900 and 2100),
  description text not null default '',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index birthday_entries_family_idx on public.birthday_entries (family_id);
create index birthday_entries_creator_idx on public.birthday_entries (created_by);
create index birthday_entries_date_idx on public.birthday_entries (birth_month, birth_day);

alter table public.birthday_entries enable row level security;

create policy "Users can view own solo birthdays"
  on public.birthday_entries for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family birthdays"
  on public.birthday_entries for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert birthdays"
  on public.birthday_entries for insert
  with check (
    created_by = auth.uid()
    and (
      (family_id is null and not exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.account_mode = 'family'
          and p.family_id is not null
      ))
      or (
        family_id is not null
        and family_id = public.current_user_family_id()
      )
    )
  );

create policy "Creators can update birthdays"
  on public.birthday_entries for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete birthdays"
  on public.birthday_entries for delete
  using (created_by = auth.uid());

-- In-app notifications

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.create_family_notifications(
  p_recipient_ids uuid[],
  p_type text,
  p_title text,
  p_body text,
  p_payload jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_recipient uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select family_id into v_family_id
  from public.profiles
  where id = auth.uid();

  if v_family_id is null then
    raise exception 'Not in a family';
  end if;

  foreach v_recipient in array p_recipient_ids loop
    if v_recipient = auth.uid() then
      continue;
    end if;

    if not exists (
      select 1 from public.profiles
      where id = v_recipient and family_id = v_family_id
    ) then
      raise exception 'Invalid notification recipient';
    end if;

    insert into public.notifications (user_id, type, title, body, payload)
    values (v_recipient, p_type, p_title, p_body, coalesce(p_payload, '{}'));
  end loop;
end;
$$;

grant execute on function public.create_family_notifications(uuid[], text, text, text, jsonb) to authenticated;
