-- Home chores

create table public.chore_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 120),
  notes text not null default '' check (char_length(notes) <= 500),
  status text not null default 'pending' check (
    status in ('pending', 'in_progress', 'completed')
  ),
  assigned_to uuid references public.profiles (id) on delete set null,
  due_date date,
  recurrence text not null default 'none' check (
    recurrence in ('none', 'daily', 'weekly', 'biweekly', 'monthly')
  ),
  completed_at timestamptz,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chore_tasks_family_idx on public.chore_tasks (family_id);
create index chore_tasks_creator_idx on public.chore_tasks (created_by);
create index chore_tasks_status_idx on public.chore_tasks (status);
create index chore_tasks_assigned_idx on public.chore_tasks (assigned_to);
create index chore_tasks_due_idx on public.chore_tasks (due_date);

alter table public.chore_tasks enable row level security;

create policy "Users can view own solo chores"
  on public.chore_tasks for select
  using (family_id is null and created_by = auth.uid());

create policy "Family members can view family chores"
  on public.chore_tasks for select
  using (family_id is not null and family_id = public.current_user_family_id());

create policy "Users can insert chores"
  on public.chore_tasks for insert
  with check (
    created_by = auth.uid()
    and (
      (family_id is null and not exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.account_mode = 'family'
          and p.family_id is not null
      ))
      or (family_id is not null and family_id = public.current_user_family_id())
    )
  );

create policy "Creators can update chores"
  on public.chore_tasks for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete chores"
  on public.chore_tasks for delete
  using (created_by = auth.uid());
