create policy "Users can view family members profiles"
  on public.profiles for select
  using (
    family_id is not null
    and family_id = (
      select p.family_id from public.profiles p where p.id = auth.uid()
    )
  );

create policy "Family creators can update family"
  on public.families for update
  using (created_by = auth.uid());
