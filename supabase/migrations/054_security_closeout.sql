-- Security closeout (post-audit v0.14.0): families INSERT, dead RPCs, atomic founder onboarding

-- ---------------------------------------------------------------------------
-- families: never trust client invite_code; creation only via RPC
-- ---------------------------------------------------------------------------

create or replace function public.families_set_invite_code()
returns trigger
language plpgsql
as $$
declare
  next_code text;
  attempts int := 0;
begin
  loop
    next_code := public.generate_family_invite_code();
    exit when not exists (
      select 1 from public.families where upper(invite_code) = upper(next_code)
    );
    attempts := attempts + 1;
    if attempts > 20 then
      raise exception 'Could not generate unique family invite code';
    end if;
  end loop;

  new.invite_code := next_code;
  return new;
end;
$$;

revoke insert on table public.families from authenticated;

-- ---------------------------------------------------------------------------
-- Atomic founder onboarding (create family + profile in one transaction)
-- ---------------------------------------------------------------------------

create or replace function public.onboard_create_family(
  p_family_name text,
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
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if char_length(trim(coalesce(p_family_name, ''))) = 0 then
    raise exception 'Invalid family name';
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

  select family_id into v_family_id
  from public.profiles
  where id = v_user_id;

  if v_family_id is not null then
    if not exists (
      select 1 from public.families
      where id = v_family_id and created_by = v_user_id
    ) then
      raise exception 'Not family founder';
    end if;

    update public.families
    set name = trim(p_family_name)
    where id = v_family_id;
  else
    insert into public.families (name, created_by, invite_code)
    values (trim(p_family_name), v_user_id, public.generate_family_invite_code())
    returning id into v_family_id;
  end if;

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      avatar_color = p_avatar_color,
      family_id = v_family_id,
      family_role = 'admin',
      account_mode = 'family',
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

grant execute on function public.onboard_create_family(text, text, text, text) to authenticated;

-- Guard complete_founder_onboarding against cross-family overwrite
create or replace function public.complete_founder_onboarding(
  p_first_name text,
  p_last_name text,
  p_avatar_color text,
  p_family_id uuid
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

  if exists (
    select 1 from public.profiles
    where id = v_user_id
      and family_id is not null
      and family_id <> p_family_id
  ) then
    raise exception 'Already in family';
  end if;

  if not exists (
    select 1 from public.families
    where id = p_family_id and created_by = v_user_id
  ) then
    raise exception 'Not family founder';
  end if;

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      avatar_color = p_avatar_color,
      family_id = p_family_id,
      family_role = 'admin',
      account_mode = 'family',
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  if not found then
    insert into public.profiles (
      id, first_name, last_name, avatar_color,
      family_id, family_role, account_mode, onboarding_completed
    ) values (
      v_user_id, trim(p_first_name), trim(p_last_name), p_avatar_color,
      p_family_id, 'admin', 'family', true
    );
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Retire unused invitation / onboarding RPCs from clients
-- ---------------------------------------------------------------------------

revoke execute on function public.accept_family_invitation(text) from authenticated;
revoke execute on function public.join_family_after_invitation(uuid) from authenticated;
revoke execute on function public.finalize_onboarding_profile(text, text, text) from authenticated;
revoke execute on function public.lookup_family_invitation(text) from authenticated;
revoke execute on function public.lookup_family_invitation(text) from anon;

drop function if exists public.accept_family_invitation(text);
drop function if exists public.join_family_after_invitation(uuid);
drop function if exists public.finalize_onboarding_profile(text, text, text);
drop function if exists public.lookup_family_invitation(text);
