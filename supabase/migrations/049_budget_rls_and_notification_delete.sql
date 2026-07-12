-- Budget visibility: align budgets SELECT with user_can_access_budget (member-restricted budgets).
-- Family budget update/delete: creator only.
-- Notifications: allow users to delete own rows.

drop policy if exists "Family members can view family budgets" on public.budgets;

create policy "Family members can view family budgets"
  on public.budgets for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
    and public.user_can_access_budget(id)
  );

drop policy if exists "Users can update accessible budgets" on public.budgets;
drop policy if exists "Users can delete accessible budgets" on public.budgets;

create policy "Users can update own budgets"
  on public.budgets for update
  using (
    (family_id is null and created_by = auth.uid())
    or (
      family_id is not null
      and family_id = public.current_user_family_id()
      and created_by = auth.uid()
    )
  )
  with check (
    (family_id is null and created_by = auth.uid())
    or (
      family_id is not null
      and family_id = public.current_user_family_id()
      and created_by = auth.uid()
    )
  );

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (
    (family_id is null and created_by = auth.uid())
    or (
      family_id is not null
      and family_id = public.current_user_family_id()
      and created_by = auth.uid()
    )
  );

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());
