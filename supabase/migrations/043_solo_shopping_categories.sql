-- Shopping list categories for solo accounts (family_id nullable + created_by)

alter table public.shopping_list_categories
  add column if not exists created_by uuid references auth.users (id) on delete cascade;

update public.shopping_list_categories slc
set created_by = f.created_by
from public.families f
where slc.family_id = f.id
  and slc.created_by is null;

alter table public.shopping_list_categories
  alter column family_id drop not null;

-- Solo: view own categories
create policy "Users can view own solo shopping list categories"
  on public.shopping_list_categories for select
  using (family_id is null and created_by = auth.uid());

create policy "Users can insert solo shopping list categories"
  on public.shopping_list_categories for insert
  with check (
    created_by = auth.uid()
    and family_id is null
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.account_mode = 'family'
        and p.family_id is not null
    )
  );

create policy "Users can update solo shopping list categories"
  on public.shopping_list_categories for update
  using (family_id is null and created_by = auth.uid())
  with check (family_id is null and created_by = auth.uid());

create policy "Users can delete solo shopping list categories"
  on public.shopping_list_categories for delete
  using (family_id is null and created_by = auth.uid());
