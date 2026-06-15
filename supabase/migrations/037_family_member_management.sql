-- Leave family, remove members, transfer founder ownership

create or replace function public.leave_family()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_family_id uuid;
  v_is_founder boolean;
  v_member_count int;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select p.family_id, (f.created_by = v_user_id)
  into v_family_id, v_is_founder
  from public.profiles p
  left join public.families f on f.id = p.family_id
  where p.id = v_user_id;

  if v_family_id is null then
    raise exception 'Not in family';
  end if;

  select count(*)::int
  into v_member_count
  from public.profiles
  where family_id = v_family_id;

  if v_is_founder and v_member_count > 1 then
    raise exception 'Founder must transfer ownership before leaving';
  end if;

  update public.profiles
  set family_id = null,
      family_role = null,
      account_mode = 'solo',
      updated_at = now()
  where id = v_user_id;

  if v_is_founder and v_member_count <= 1 then
    delete from public.families where id = v_family_id;
  end if;
end;
$$;

create or replace function public.remove_family_member(p_target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_family_id uuid;
  v_actor_role text;
  v_family_creator uuid;
  v_target_family_id uuid;
begin
  if p_target_user_id = auth.uid() then
    raise exception 'Use leave family for self';
  end if;

  select family_id, family_role
  into v_actor_family_id, v_actor_role
  from public.profiles
  where id = auth.uid();

  if v_actor_family_id is null or v_actor_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  select family_id
  into v_target_family_id
  from public.profiles
  where id = p_target_user_id;

  if v_target_family_id is distinct from v_actor_family_id then
    raise exception 'Target not in family';
  end if;

  select created_by
  into v_family_creator
  from public.families
  where id = v_actor_family_id;

  if p_target_user_id = v_family_creator then
    raise exception 'Cannot remove family founder';
  end if;

  update public.profiles
  set family_id = null,
      family_role = null,
      account_mode = 'solo',
      updated_at = now()
  where id = p_target_user_id
    and family_id = v_actor_family_id;
end;
$$;

create or replace function public.transfer_family_ownership(p_new_founder_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_family_creator uuid;
  v_target_family_id uuid;
begin
  if p_new_founder_id = auth.uid() then
    raise exception 'Already founder';
  end if;

  select family_id
  into v_family_id
  from public.profiles
  where id = auth.uid();

  if v_family_id is null then
    raise exception 'Not in family';
  end if;

  select created_by
  into v_family_creator
  from public.families
  where id = v_family_id;

  if v_family_creator <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  select family_id
  into v_target_family_id
  from public.profiles
  where id = p_new_founder_id;

  if v_target_family_id is distinct from v_family_id then
    raise exception 'Target not in family';
  end if;

  update public.families
  set created_by = p_new_founder_id
  where id = v_family_id;

  update public.profiles
  set family_role = 'admin',
      updated_at = now()
  where id = p_new_founder_id
    and family_id = v_family_id;
end;
$$;

grant execute on function public.leave_family() to authenticated;
grant execute on function public.remove_family_member(uuid) to authenticated;
grant execute on function public.transfer_family_ownership(uuid) to authenticated;
