-- Custom recurrence interval + end date; family members can update chores (e.g. mark done)

alter table public.chore_tasks
  add column recurrence_interval_days integer,
  add column recurrence_end_date date,
  add column recurrence_duration text;

alter table public.chore_tasks
  drop constraint if exists chore_tasks_recurrence_check;

alter table public.chore_tasks
  add constraint chore_tasks_recurrence_check
  check (
    recurrence in ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom')
  );

alter table public.chore_tasks
  add constraint chore_tasks_recurrence_duration_check
  check (
    recurrence_duration is null
    or recurrence_duration in ('month', 'quarter', 'half_year', 'year')
  );

alter table public.chore_tasks
  add constraint chore_tasks_recurrence_custom_chk
  check (
    (
      recurrence = 'custom'
      and recurrence_interval_days is not null
      and recurrence_interval_days between 2 and 90
      and recurrence_end_date is not null
      and recurrence_duration is not null
    )
    or (
      recurrence <> 'custom'
      and recurrence_interval_days is null
      and recurrence_end_date is null
      and recurrence_duration is null
    )
  );

drop policy if exists "Creators can update chores" on public.chore_tasks;

create policy "Solo creators can update own chores"
  on public.chore_tasks for update
  using (
    family_id is null
    and created_by = auth.uid()
  )
  with check (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can update family chores"
  on public.chore_tasks for update
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  )
  with check (
    family_id is not null
    and family_id = public.current_user_family_id()
  );
