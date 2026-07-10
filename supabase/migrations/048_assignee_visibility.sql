-- Restrict family data visibility to assignee + creator (unassigned / empty members = whole family)

-- Chores: assignee visibility
drop policy if exists "Family members can view family chores" on public.chore_tasks;

create policy "Family members can view family chores"
  on public.chore_tasks for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      assigned_to is null
      or created_by = auth.uid()
      or assigned_to = auth.uid()
    )
  );

drop policy if exists "Family members can update family chores" on public.chore_tasks;

create policy "Family assignees and creators can update family chores"
  on public.chore_tasks for update
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      created_by = auth.uid()
      or assigned_to is null
      or assigned_to = auth.uid()
    )
  )
  with check (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      created_by = auth.uid()
      or assigned_to is null
      or assigned_to = auth.uid()
    )
  );

-- Medicine: taken_by visibility
drop policy if exists "Family members can view family medicine items" on public.medicine_items;

create policy "Family members can view family medicine items"
  on public.medicine_items for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      taken_by is null
      or created_by = auth.uid()
      or taken_by = auth.uid()
    )
  );

drop policy if exists "Creators can update medicine items" on public.medicine_items;

create policy "Solo creators can update own medicine items"
  on public.medicine_items for update
  using (family_id is null and created_by = auth.uid())
  with check (family_id is null and created_by = auth.uid());

create policy "Family assignees and creators can update family medicine items"
  on public.medicine_items for update
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      created_by = auth.uid()
      or taken_by is null
      or taken_by = auth.uid()
    )
  )
  with check (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      created_by = auth.uid()
      or taken_by is null
      or taken_by = auth.uid()
    )
  );

-- Budget: budget_members restrict access when non-empty
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
          and (
            b.created_by = auth.uid()
            or not exists (
              select 1
              from public.budget_members bm
              where bm.budget_id = b.id
            )
            or exists (
              select 1
              from public.budget_members bm
              where bm.budget_id = b.id
                and bm.member_id = auth.uid()
            )
          )
        )
      )
  );
$$;

-- Gifts: family-member recipient without explicit visibility → recipient + creator only
drop policy if exists "Family members can view family gift ideas" on public.gift_ideas;

create policy "Family members can view family gift ideas"
  on public.gift_ideas for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      created_by = auth.uid()
      or (
        visible_to_member_ids <> '{}'
        and auth.uid() = any (visible_to_member_ids)
      )
      or (
        visible_to_member_ids = '{}'
        and (
          recipient_type <> 'family_member'
          or recipient_member_id is null
        )
      )
      or (
        visible_to_member_ids = '{}'
        and recipient_type = 'family_member'
        and recipient_member_id is not null
        and recipient_member_id = auth.uid()
      )
    )
  );
