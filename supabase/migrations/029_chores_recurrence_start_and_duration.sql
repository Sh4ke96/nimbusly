-- Original start date for calendar projection; duration/end for all recurring types

alter table public.chore_tasks
  add column recurrence_start_date date;

update public.chore_tasks
set recurrence_start_date = coalesce(due_date, created_at::date)
where recurrence <> 'none' and recurrence_start_date is null;

alter table public.chore_tasks
  drop constraint if exists chore_tasks_recurrence_custom_chk;

alter table public.chore_tasks
  add constraint chore_tasks_recurrence_fields_chk
  check (
    (
      recurrence = 'none'
      and recurrence_interval_days is null
      and recurrence_end_date is null
      and recurrence_duration is null
      and recurrence_start_date is null
    )
    or (
      recurrence = 'custom'
      and recurrence_interval_days is not null
      and recurrence_interval_days between 2 and 90
      and recurrence_end_date is not null
      and recurrence_duration is not null
    )
    or (
      recurrence not in ('none', 'custom')
      and recurrence_interval_days is null
    )
  );
