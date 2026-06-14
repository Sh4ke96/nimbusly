-- Per-profile shopping list watches (notifications on item add/remove)

create table public.shopping_list_watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, list_id)
);

create index shopping_list_watches_user_idx on public.shopping_list_watches (user_id);
create index shopping_list_watches_list_idx on public.shopping_list_watches (list_id);

alter table public.shopping_list_watches enable row level security;

create policy "Users can view own shopping list watches"
  on public.shopping_list_watches for select
  using (user_id = auth.uid());

create policy "Users can watch accessible shopping lists"
  on public.shopping_list_watches for insert
  with check (
    user_id = auth.uid()
    and public.user_can_access_shopping_list(list_id)
  );

create policy "Users can unwatch own shopping lists"
  on public.shopping_list_watches for delete
  using (user_id = auth.uid());
