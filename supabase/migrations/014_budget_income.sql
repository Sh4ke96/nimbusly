-- Income entries, subscriptions category, entry_type on budget_expenses

alter table public.budget_expenses
  add column entry_type text not null default 'expense' check (entry_type in ('expense', 'income'));

alter table public.budget_expenses
  drop constraint budget_expenses_category_check;

alter table public.budget_expenses
  add constraint budget_expenses_category_check check (
    category in (
      'work', 'bills', 'sport', 'installments', 'car', 'shopping', 'subscriptions', 'other',
      'salary', 'freelance', 'investment', 'other_income'
    )
  );

create index budget_expenses_entry_type_idx on public.budget_expenses (entry_type);
