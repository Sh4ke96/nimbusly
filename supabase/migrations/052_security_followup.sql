-- Security follow-up: lock down onboarding RPCs, create family RPC, rate limits, budget expenses

revoke execute on function public.allow_profile_sensitive_update() from authenticated;
grant execute on function public.allow_profile_sensitive_update() to service_role;

revoke execute on function public.complete_onboarding_profile(text, text, text, uuid, text, text) from authenticated;
drop function if exists public.complete_onboarding_profile(text, text, text, uuid, text, text);

-- Solo onboarding: safe profile fields only
create or replace function public.complete_solo_onboarding(
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

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      avatar_color = p_avatar_color,
      family_id = null,
      family_role = null,
      account_mode = 'solo',
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  if not found then
    insert into public.profiles (
      id, first_name, last_name, avatar_color,
      family_id, family_role, account_mode, onboarding_completed
    ) values (
      v_user_id, trim(p_first_name), trim(p_last_name), p_avatar_color,
      null, null, 'solo', true
    );
  end if;
end;
$$;

grant execute on function public.complete_solo_onboarding(text, text, text) to authenticated;

-- Founder onboarding: user must be family creator
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

grant execute on function public.complete_founder_onboarding(text, text, text, uuid) to authenticated;

-- After invite token accepted: assign member role
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
end;
$$;

grant execute on function public.join_family_after_invitation(uuid) to authenticated;

-- Finalize onboarding names after family assignment
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

grant execute on function public.finalize_onboarding_profile(text, text, text) to authenticated;

-- Solo user creates a family from settings
create or replace function public.create_family_and_join(p_family_name text)
returns uuid
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

  if exists (
    select 1 from public.profiles
    where id = v_user_id and family_id is not null
  ) then
    raise exception 'Already in family';
  end if;

  insert into public.families (name, created_by, invite_code)
  values (trim(p_family_name), v_user_id, public.generate_family_invite_code())
  returning id into v_family_id;

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set family_id = v_family_id,
      family_role = 'admin',
      account_mode = 'family',
      updated_at = now()
  where id = v_user_id;

  return v_family_id;
end;
$$;

grant execute on function public.create_family_and_join(text) to authenticated;

-- Rate limit join attempts
create table if not exists public.family_join_attempt_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists family_join_attempt_log_user_time_idx
  on public.family_join_attempt_log (user_id, created_at desc);

alter table public.family_join_attempt_log enable row level security;

create policy "Users can insert own join attempt log"
  on public.family_join_attempt_log for insert
  with check (user_id = auth.uid());

create or replace function public.join_family_with_invite_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_family_id uuid;
  v_existing_family uuid;
  v_attempts int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select count(*)::int into v_attempts
  from public.family_join_attempt_log
  where user_id = v_user_id
    and created_at > now() - interval '15 minutes';

  if v_attempts >= 30 then
    raise exception 'Too many join attempts';
  end if;

  insert into public.family_join_attempt_log (user_id) values (v_user_id);

  select family_id into v_existing_family
  from public.profiles
  where id = v_user_id;

  if v_existing_family is not null then
    raise exception 'Already in family';
  end if;

  select f.id into v_family_id
  from public.families f
  where upper(f.invite_code) = upper(regexp_replace(trim(p_code), '\s+', '', 'g'))
  limit 1;

  if v_family_id is null then
    return null;
  end if;

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set family_id = v_family_id,
      family_role = 'member',
      account_mode = 'family',
      updated_at = now()
  where id = v_user_id;

  return v_family_id;
end;
$$;

-- Budget expenses: only creator can update/delete
drop policy if exists "Users can update budget expenses" on public.budget_expenses;
drop policy if exists "Users can delete budget expenses" on public.budget_expenses;

create policy "Users can update own budget expenses"
  on public.budget_expenses for update
  using (
    created_by = auth.uid()
    and public.user_can_access_budget(budget_id)
  )
  with check (
    created_by = auth.uid()
    and public.user_can_access_budget(budget_id)
  );

create policy "Users can delete own budget expenses"
  on public.budget_expenses for delete
  using (
    created_by = auth.uid()
    and public.user_can_access_budget(budget_id)
  );

-- Invite code: founder-only via RPC (members still see family name via select)
create or replace function public.get_family_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_family_id uuid;
  v_code text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select p.family_id into v_family_id
  from public.profiles p
  where p.id = v_user_id;

  if v_family_id is null then
    return null;
  end if;

  if not exists (
    select 1 from public.families f
    where f.id = v_family_id and f.created_by = v_user_id
  ) then
    raise exception 'Not authorized';
  end if;

  select invite_code into v_code
  from public.families
  where id = v_family_id;

  return v_code;
end;
$$;

grant execute on function public.get_family_invite_code() to authenticated;
