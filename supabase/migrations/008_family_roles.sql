-- Family roles: admin (can manage permissions) and member (default for joiners)

alter table public.profiles
  add column family_role text
  check (family_role is null or family_role in ('admin', 'member'));

-- Founders are admins; everyone else in a family is a member
update public.profiles p
set family_role = 'admin'
from public.families f
where p.family_id = f.id
  and p.id = f.created_by;

update public.profiles
set family_role = 'member'
where family_id is not null
  and family_role is null;

alter table public.profiles
  add constraint profiles_family_role_consistency
  check (
    (family_id is null and family_role is null)
    or (family_id is not null and family_role is not null)
  );

create or replace function public.update_family_member_role(
  p_target_user_id uuid,
  p_role text
)
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
  if p_role not in ('admin', 'member') then
    raise exception 'Invalid role';
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

  if p_target_user_id = v_family_creator and p_role <> 'admin' then
    raise exception 'Cannot demote family founder';
  end if;

  update public.profiles
  set family_role = p_role,
      updated_at = now()
  where id = p_target_user_id
    and family_id = v_actor_family_id;
end;
$$;

grant execute on function public.update_family_member_role(uuid, text) to authenticated;
