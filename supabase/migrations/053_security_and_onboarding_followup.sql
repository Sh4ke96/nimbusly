-- Security & onboarding follow-up (post-audit v0.13.1)

-- ---------------------------------------------------------------------------
-- finalize_onboarding_profile: allow onboarding_completed update
-- ---------------------------------------------------------------------------

create or replace function public.finalize_onboarding_profile(
  p_first_name text,
  p_last_name text,
  p_avatar_color text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1 from public.profiles
    where id = v_user_id and onboarding_completed = true
  ) then
    raise exception 'Onboarding already completed';
  end if;

  if char_length(trim(coalesce(p_first_name, ''))) = 0
    or char_length(trim(coalesce(p_last_name, ''))) = 0
  then
    raise exception 'Invalid name';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = v_user_id and family_id is not null
  ) then
    raise exception 'Family not assigned';
  end if;

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      avatar_color = p_avatar_color,
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Invitation join tracking
-- ---------------------------------------------------------------------------

alter table public.family_invitations
  add column if not exists joined_at timestamptz;

-- ---------------------------------------------------------------------------
-- Atomic onboarding: invite code
-- ---------------------------------------------------------------------------

create or replace function public.onboard_with_invite_code(
  p_code text,
  p_first_name text,
  p_last_name text,
  p_avatar_color text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_family_id uuid;
  v_attempts int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if char_length(trim(coalesce(p_first_name, ''))) = 0
    or char_length(trim(coalesce(p_last_name, ''))) = 0
  then
    raise exception 'Invalid name';
  end if;

  if exists (
    select 1 from public.profiles
    where id = v_user_id and onboarding_completed = true
  ) then
    raise exception 'Onboarding already completed';
  end if;

  select count(*)::int into v_attempts
  from public.family_join_attempt_log
  where user_id = v_user_id
    and created_at > now() - interval '15 minutes';

  if v_attempts >= 30 then
    raise exception 'Too many join attempts';
  end if;

  insert into public.family_join_attempt_log (user_id) values (v_user_id);

  if exists (
    select 1 from public.profiles
    where id = v_user_id and family_id is not null
  ) then
    raise exception 'Already in family';
  end if;

  select f.id into v_family_id
  from public.families f
  where upper(f.invite_code) = upper(regexp_replace(trim(p_code), '\s+', '', 'g'))
  limit 1;

  if v_family_id is null then
    raise exception 'Invalid invite code';
  end if;

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      avatar_color = p_avatar_color,
      family_id = v_family_id,
      family_role = 'member',
      account_mode = 'family',
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

grant execute on function public.onboard_with_invite_code(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Atomic onboarding: email invitation token
-- ---------------------------------------------------------------------------

create or replace function public.onboard_with_invitation_token(
  p_token text,
  p_first_name text,
  p_last_name text,
  p_avatar_color text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_invitation public.family_invitations%rowtype;
  v_user_email text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if char_length(trim(coalesce(p_first_name, ''))) = 0
    or char_length(trim(coalesce(p_last_name, ''))) = 0
  then
    raise exception 'Invalid name';
  end if;

  if exists (
    select 1 from public.profiles
    where id = v_user_id and onboarding_completed = true
  ) then
    raise exception 'Onboarding already completed';
  end if;

  if exists (
    select 1 from public.profiles
    where id = v_user_id and family_id is not null
  ) then
    raise exception 'Already in family';
  end if;

  select * into v_invitation
  from public.family_invitations
  where token = trim(p_token)
    and status = 'pending'
    and expires_at > now()
    and joined_at is null
  limit 1;

  if not found then
    raise exception 'Invalid invitation';
  end if;

  select lower(email) into v_user_email
  from auth.users
  where id = v_user_id;

  if v_user_email is null or v_user_email <> lower(v_invitation.email) then
    raise exception 'Invalid invitation';
  end if;

  perform public.allow_profile_sensitive_update();

  update public.family_invitations
  set status = 'accepted',
      joined_at = now()
  where id = v_invitation.id;

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      avatar_color = p_avatar_color,
      family_id = v_invitation.family_id,
      family_role = 'member',
      account_mode = 'family',
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

grant execute on function public.onboard_with_invitation_token(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- join_family_after_invitation: require unused accepted invite
-- ---------------------------------------------------------------------------

create or replace function public.join_family_after_invitation(p_family_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_email text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1 from public.profiles
    where id = v_user_id and family_id is not null
  ) then
    raise exception 'Already in family';
  end if;

  select lower(email) into v_user_email
  from auth.users
  where id = v_user_id;

  if v_user_email is null then
    raise exception 'Invalid user';
  end if;

  if not exists (
    select 1 from public.family_invitations fi
    where fi.family_id = p_family_id
      and fi.status = 'accepted'
      and fi.joined_at is null
      and lower(fi.email) = v_user_email
  ) then
    raise exception 'Invalid invitation';
  end if;

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set family_id = p_family_id,
      family_role = 'member',
      account_mode = 'family',
      updated_at = now()
  where id = v_user_id;

  update public.family_invitations fi
  set joined_at = now()
  where fi.family_id = p_family_id
    and lower(fi.email) = v_user_email
    and fi.status = 'accepted'
    and fi.joined_at is null;
end;
$$;

-- accept_family_invitation: validate only (no status burn)
create or replace function public.accept_family_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.family_invitations%rowtype;
  v_user_email text;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invitation
  from public.family_invitations
  where token = trim(p_token)
    and status = 'pending'
    and expires_at > now()
    and joined_at is null
  limit 1;

  if not found then
    return null;
  end if;

  select lower(email) into v_user_email
  from auth.users
  where id = v_user_id;

  if v_user_email is null or v_user_email <> lower(v_invitation.email) then
    return null;
  end if;

  return v_invitation.family_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Invite code: hide column from authenticated clients
-- ---------------------------------------------------------------------------

revoke all on table public.families from authenticated;
grant select (id, name, created_by) on table public.families to authenticated;
grant insert on table public.families to authenticated;
grant update (name) on table public.families to authenticated;

-- ---------------------------------------------------------------------------
-- Revoke unused lookup RPC from clients
-- ---------------------------------------------------------------------------

revoke execute on function public.lookup_family_invitation(text) from authenticated;
revoke execute on function public.lookup_family_invitation(text) from anon;
