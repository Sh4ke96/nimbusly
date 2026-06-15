-- Budget: hidden budgets, recurring entries, payment reminders

alter table public.budgets
  add column if not exists is_hidden boolean not null default false;

alter table public.budget_expenses
  add column if not exists recurrence text not null default 'none',
  add column if not exists recurrence_interval_days integer,
  add column if not exists recurrence_end_date date,
  add column if not exists payment_reminder_enabled boolean not null default false,
  add column if not exists reminder_sent_keys text[] not null default '{}';

alter table public.budget_expenses
  drop constraint if exists budget_expenses_recurrence_check;

alter table public.budget_expenses
  add constraint budget_expenses_recurrence_check
  check (recurrence in ('none', 'weekly', 'biweekly', 'monthly', 'yearly'));

alter table public.budget_expenses
  drop constraint if exists budget_expenses_recurrence_end_check;

alter table public.budget_expenses
  add constraint budget_expenses_recurrence_end_check
  check (
    recurrence_end_date is null
    or recurrence_end_date >= expense_date
  );

create index budget_expenses_payment_reminder_idx
  on public.budget_expenses (payment_reminder_enabled)
  where payment_reminder_enabled = true and entry_type = 'expense';
