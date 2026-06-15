-- Shopping list categories (family-wide) + item quantity

create table public.shopping_list_categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null check (
    char_length(trim(name)) > 0
    and char_length(name) <= 100
  ),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shopping_list_categories_family_idx
  on public.shopping_list_categories (family_id);

create index shopping_list_categories_family_order_idx
  on public.shopping_list_categories (family_id, sort_order);

alter table public.shopping_list_items
  add column quantity integer not null default 1
    check (quantity >= 1 and quantity <= 9999);

alter table public.shopping_list_items
  add column category_id uuid references public.shopping_list_categories (id) on delete set null;

create index shopping_list_items_category_idx
  on public.shopping_list_items (category_id);

create or replace function public.is_family_founder(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.families f
    where f.id = p_family_id
      and f.created_by = auth.uid()
  );
$$;

alter table public.shopping_list_categories enable row level security;

create policy "Family members can view shopping list categories"
  on public.shopping_list_categories for select
  using (family_id = public.current_user_family_id());

create policy "Family founder can insert shopping list categories"
  on public.shopping_list_categories for insert
  with check (
    family_id = public.current_user_family_id()
    and public.is_family_founder(family_id)
  );

create policy "Family members can update shopping list category order"
  on public.shopping_list_categories for update
  using (family_id = public.current_user_family_id())
  with check (family_id = public.current_user_family_id());

create policy "Family founder can delete shopping list categories"
  on public.shopping_list_categories for delete
  using (
    family_id = public.current_user_family_id()
    and public.is_family_founder(family_id)
  );

alter publication supabase_realtime add table public.shopping_list_categories;
