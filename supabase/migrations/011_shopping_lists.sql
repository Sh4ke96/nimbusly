-- Shopping lists module (collaborative family lists + solo)

create table public.shopping_lists (
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

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  content text not null check (
    char_length(trim(content)) > 0
    and char_length(content) <= 500
  ),
  checked boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shopping_lists_family_idx on public.shopping_lists (family_id);
create index shopping_lists_creator_idx on public.shopping_lists (created_by);
create index shopping_list_items_list_idx on public.shopping_list_items (list_id);
create index shopping_list_items_list_order_idx on public.shopping_list_items (list_id, sort_order);

create or replace function public.user_can_access_shopping_list(p_list_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.shopping_lists sl
    where sl.id = p_list_id
      and (
        (sl.family_id is null and sl.created_by = auth.uid())
        or (
          sl.family_id is not null
          and sl.family_id = public.current_user_family_id()
        )
      )
  );
$$;

alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;

create policy "Users can view own solo shopping lists"
  on public.shopping_lists for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family shopping lists"
  on public.shopping_lists for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert shopping lists"
  on public.shopping_lists for insert
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

create policy "Users can update accessible shopping lists"
  on public.shopping_lists for update
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

create policy "Users can delete accessible shopping lists"
  on public.shopping_lists for delete
  using (
    (family_id is null and created_by = auth.uid())
    or (
      family_id is not null
      and family_id = public.current_user_family_id()
    )
  );

create policy "Users can view shopping list items"
  on public.shopping_list_items for select
  using (public.user_can_access_shopping_list(list_id));

create policy "Users can insert shopping list items"
  on public.shopping_list_items for insert
  with check (
    created_by = auth.uid()
    and public.user_can_access_shopping_list(list_id)
  );

create policy "Users can update shopping list items"
  on public.shopping_list_items for update
  using (public.user_can_access_shopping_list(list_id))
  with check (public.user_can_access_shopping_list(list_id));

create policy "Users can delete shopping list items"
  on public.shopping_list_items for delete
  using (public.user_can_access_shopping_list(list_id));

alter publication supabase_realtime add table public.shopping_lists;
alter publication supabase_realtime add table public.shopping_list_items;
