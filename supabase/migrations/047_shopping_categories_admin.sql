-- Allow family founders and admins to manage shopping list categories (insert/delete).

create or replace function public.is_family_admin(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.families f on f.id = p.family_id
    where p.id = auth.uid()
      and p.family_id = p_family_id
      and (
        f.created_by = auth.uid()
        or p.family_role = 'admin'
      )
  );
$$;

drop policy if exists "Family founder can insert shopping list categories"
  on public.shopping_list_categories;

drop policy if exists "Family founder can delete shopping list categories"
  on public.shopping_list_categories;

create policy "Family managers can insert shopping list categories"
  on public.shopping_list_categories for insert
  with check (
    family_id = public.current_user_family_id()
    and public.is_family_admin(family_id)
  );

create policy "Family managers can delete shopping list categories"
  on public.shopping_list_categories for delete
  using (
    family_id = public.current_user_family_id()
    and public.is_family_admin(family_id)
  );
