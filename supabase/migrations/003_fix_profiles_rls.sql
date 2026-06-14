create or replace function public.current_user_family_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select family_id from public.profiles where id = auth.uid();
$$;

drop policy if exists "Users can view family members profiles" on public.profiles;

create policy "Users can view family members profiles"
  on public.profiles for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );
