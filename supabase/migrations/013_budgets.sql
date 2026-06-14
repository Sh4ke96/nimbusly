-- Budget module (solo + family with selected members)

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  name text not null check (
    char_length(trim(name)) > 0
    and char_length(name) <= 200
  ),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.budget_members (
  budget_id uuid not null references public.budgets (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  primary key (budget_id, member_id)
);

create table public.budget_watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  budget_id uuid not null references public.budgets (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, budget_id)
);

create table public.budget_expenses (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets (id) on delete cascade,
  category text not null check (
    category in (
      'work', 'bills', 'sport', 'installments', 'car', 'shopping', 'other'
    )
  ),
  amount numeric(12, 2) not null check (amount > 0),
  description text not null default '' check (char_length(description) <= 500),
  expense_date date not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index budgets_family_idx on public.budgets (family_id);
create index budgets_creator_idx on public.budgets (created_by);
create index budget_members_budget_idx on public.budget_members (budget_id);
create index budget_watches_user_idx on public.budget_watches (user_id);
create index budget_watches_budget_idx on public.budget_watches (budget_id);
create index budget_expenses_budget_idx on public.budget_expenses (budget_id);
create index budget_expenses_date_idx on public.budget_expenses (expense_date);
create index budget_expenses_category_idx on public.budget_expenses (category);

create or replace function public.user_can_access_budget(p_budget_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.budgets b
    where b.id = p_budget_id
      and (
        (b.family_id is null and b.created_by = auth.uid())
        or (
          b.family_id is not null
          and b.family_id = public.current_user_family_id()
        )
      )
  );
$$;

alter table public.budgets enable row level security;
alter table public.budget_members enable row level security;
alter table public.budget_watches enable row level security;
alter table public.budget_expenses enable row level security;

create policy "Users can view own solo budgets"
  on public.budgets for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family budgets"
  on public.budgets for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert budgets"
  on public.budgets for insert
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

create policy "Users can update accessible budgets"
  on public.budgets for update
  using (
    (family_id is null and created_by = auth.uid())
    or (
      family_id is not null
      and family_id = public.current_user_family_id()
    )
  )
  with check (
    (family_id is null and created_by = auth.uid())
    or (
      family_id is not null
      and family_id = public.current_user_family_id()
    )
  );

create policy "Users can delete accessible budgets"
  on public.budgets for delete
  using (
    (family_id is null and created_by = auth.uid())
    or (
      family_id is not null
      and family_id = public.current_user_family_id()
    )
  );

create policy "Users can view budget members"
  on public.budget_members for select
  using (public.user_can_access_budget(budget_id));

create policy "Users can manage budget members"
  on public.budget_members for insert
  with check (public.user_can_access_budget(budget_id));

create policy "Users can delete budget members"
  on public.budget_members for delete
  using (public.user_can_access_budget(budget_id));

create policy "Users can view own budget watches"
  on public.budget_watches for select
  using (user_id = auth.uid());

create policy "Users can watch accessible budgets"
  on public.budget_watches for insert
  with check (
    user_id = auth.uid()
    and public.user_can_access_budget(budget_id)
  );

create policy "Users can unwatch budgets"
  on public.budget_watches for delete
  using (user_id = auth.uid());

create policy "Users can view budget expenses"
  on public.budget_expenses for select
  using (public.user_can_access_budget(budget_id));

create policy "Users can insert budget expenses"
  on public.budget_expenses for insert
  with check (
    created_by = auth.uid()
    and public.user_can_access_budget(budget_id)
  );

create policy "Users can update budget expenses"
  on public.budget_expenses for update
  using (public.user_can_access_budget(budget_id))
  with check (public.user_can_access_budget(budget_id));

create policy "Users can delete budget expenses"
  on public.budget_expenses for delete
  using (public.user_can_access_budget(budget_id));
