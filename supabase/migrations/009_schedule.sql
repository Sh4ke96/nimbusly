-- Work schedule (grafik) module

create table public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  entry_date date not null,
  entry_type text not null check (
    entry_type in ('work', 'free', 'shopping', 'training', 'doctor', 'trip')
  ),
  description text not null default '',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index schedule_entries_family_idx on public.schedule_entries (family_id);
create index schedule_entries_creator_idx on public.schedule_entries (created_by);
create index schedule_entries_date_idx on public.schedule_entries (entry_date);

alter table public.schedule_entries enable row level security;

create policy "Users can view own solo schedule"
  on public.schedule_entries for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family schedule"
  on public.schedule_entries for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert schedule entries"
  on public.schedule_entries for insert
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

create policy "Creators can update schedule entries"
  on public.schedule_entries for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete schedule entries"
  on public.schedule_entries for delete
  using (created_by = auth.uid());
