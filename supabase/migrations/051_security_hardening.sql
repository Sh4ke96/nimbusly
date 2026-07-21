-- Security hardening: profiles guard, notification RPC, invites, storage, rate limits

-- ---------------------------------------------------------------------------
-- Profiles: block direct updates to sensitive columns
-- ---------------------------------------------------------------------------

create or replace function public.allow_profile_sensitive_update()
returns void
language sql
security definer
set search_path = public
as $$
  select set_config('app.profile_sensitive_update', 'true', true);
$$;

revoke all on function public.allow_profile_sensitive_update() from public;
grant execute on function public.allow_profile_sensitive_update() to authenticated, service_role;

create or replace function public.profiles_guard_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('app.profile_sensitive_update', true), '') = 'true' then
    return NEW;
  end if;

  if TG_OP = 'INSERT' then
    if NEW.family_id is not null
      or NEW.family_role is not null
      or NEW.account_mode is distinct from 'solo'
      or NEW.onboarding_completed is true
    then
      raise exception 'Protected profile fields cannot be set directly';
    end if;
    return NEW;
  end if;

  if OLD.family_id is distinct from NEW.family_id
    or OLD.family_role is distinct from NEW.family_role
    or OLD.account_mode is distinct from NEW.account_mode
    or OLD.onboarding_completed is distinct from NEW.onboarding_completed
  then
    raise exception 'Protected profile fields cannot be updated directly';
  end if;

  return NEW;
end;
$$;

drop trigger if exists profiles_guard_sensitive_columns on public.profiles;
create trigger profiles_guard_sensitive_columns
  before insert or update on public.profiles
  for each row execute function public.profiles_guard_sensitive_columns();

-- ---------------------------------------------------------------------------
-- Onboarding + join family via controlled RPCs
-- ---------------------------------------------------------------------------

create or replace function public.complete_onboarding_profile(
  p_first_name text,
  p_last_name text,
  p_avatar_color text,
  p_family_id uuid,
  p_family_role text,
  p_account_mode text
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

  if char_length(trim(coalesce(p_first_name, ''))) = 0
    or char_length(trim(coalesce(p_last_name, ''))) = 0
  then
    raise exception 'Invalid name';
  end if;

  if p_account_mode not in ('solo', 'family') then
    raise exception 'Invalid account mode';
  end if;

  if p_account_mode = 'solo' then
    if p_family_id is not null or p_family_role is not null then
      raise exception 'Solo account cannot have family';
    end if;
  else
    if p_family_id is null or p_family_role is null then
      raise exception 'Family account requires family';
    end if;
    if p_family_role not in ('admin', 'member') then
      raise exception 'Invalid role';
    end if;
    if not exists (select 1 from public.families where id = p_family_id) then
      raise exception 'Family not found';
    end if;
  end if;

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      avatar_color = p_avatar_color,
      family_id = p_family_id,
      family_role = p_family_role,
      account_mode = p_account_mode,
      onboarding_completed = true,
      updated_at = now()
  where id = v_user_id;

  if not found then
    insert into public.profiles (
      id,
      first_name,
      last_name,
      avatar_color,
      family_id,
      family_role,
      account_mode,
      onboarding_completed
    ) values (
      v_user_id,
      trim(p_first_name),
      trim(p_last_name),
      p_avatar_color,
      p_family_id,
      p_family_role,
      p_account_mode,
      true
    );
  end if;
end;
$$;

grant execute on function public.complete_onboarding_profile(text, text, text, uuid, text, text) to authenticated;

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
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

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

grant execute on function public.join_family_with_invite_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Family RPCs: allow sensitive profile updates inside definer functions
-- ---------------------------------------------------------------------------

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

  perform public.allow_profile_sensitive_update();

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

  perform public.allow_profile_sensitive_update();

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

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set family_role = 'admin',
      updated_at = now()
  where id = p_new_founder_id
    and family_id = v_family_id;
end;
$$;

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

  perform public.allow_profile_sensitive_update();

  update public.profiles
  set family_role = p_role,
      updated_at = now()
  where id = p_target_user_id
    and family_id = v_actor_family_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- accept_family_invitation: bind to session user
-- ---------------------------------------------------------------------------

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

  update public.family_invitations
  set status = 'accepted'
  where id = v_invitation.id;

  return v_invitation.family_id;
end;
$$;

revoke all on function public.accept_family_invitation(text, uuid) from public;
drop function if exists public.accept_family_invitation(text, uuid);
grant execute on function public.accept_family_invitation(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Notifications: server-side only
-- ---------------------------------------------------------------------------

revoke execute on function public.create_family_notifications(uuid[], text, text, text, jsonb) from authenticated;
grant execute on function public.create_family_notifications(uuid[], text, text, text, jsonb) to service_role;

create or replace function public.create_family_notifications(
  p_recipient_ids uuid[],
  p_type text,
  p_title text,
  p_body text,
  p_payload jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_recipient uuid;
  v_actor_id uuid := auth.uid();
  v_recipient_families int;
begin
  if v_actor_id is null then
    select count(distinct family_id)::int
    into v_recipient_families
    from public.profiles
    where id = any (p_recipient_ids)
      and family_id is not null;

    if v_recipient_families <> 1 then
      raise exception 'Invalid notification recipients';
    end if;
  else
    select family_id into v_family_id
    from public.profiles
    where id = v_actor_id;

    if v_family_id is null then
      raise exception 'Not in a family';
    end if;
  end if;

  foreach v_recipient in array p_recipient_ids loop
    if v_recipient = v_actor_id then
      continue;
    end if;

    if v_actor_id is not null then
      if not exists (
        select 1 from public.profiles
        where id = v_recipient and family_id = v_family_id
      ) then
        raise exception 'Invalid notification recipient';
      end if;
    else
      if not exists (
        select 1 from public.profiles
        where id = v_recipient and family_id is not null
      ) then
        raise exception 'Invalid notification recipient';
      end if;
    end if;

    insert into public.notifications (user_id, type, title, body, payload)
    values (v_recipient, p_type, p_title, p_body, coalesce(p_payload, '{}'));
  end loop;
end;
$$;

grant execute on function public.create_family_notifications(uuid[], text, text, text, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Invite lookup: rate limit + revoke anon token lookup
-- ---------------------------------------------------------------------------

create table if not exists public.invite_code_lookup_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists invite_code_lookup_log_user_time_idx
  on public.invite_code_lookup_log (user_id, created_at desc);

alter table public.invite_code_lookup_log enable row level security;

create policy "Users can insert own invite lookup log"
  on public.invite_code_lookup_log for insert
  with check (user_id = auth.uid());

create or replace function public.lookup_family_by_invite_code(p_code text)
returns table(id uuid, name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempts int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select count(*)::int into v_attempts
  from public.invite_code_lookup_log
  where user_id = v_user_id
    and created_at > now() - interval '15 minutes';

  if v_attempts >= 30 then
    raise exception 'Too many invite lookup attempts';
  end if;

  insert into public.invite_code_lookup_log (user_id) values (v_user_id);

  return query
  select f.id, f.name
  from public.families f
  where upper(f.invite_code) = upper(regexp_replace(trim(p_code), '\s+', '', 'g'))
  limit 1;
end;
$$;

revoke execute on function public.lookup_family_invitation(text) from anon;
grant execute on function public.lookup_family_invitation(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Note attachment storage: family members can read shared files
-- ---------------------------------------------------------------------------

drop policy if exists "Users read own note attachments" on storage.objects;

create policy "Users read accessible note attachments"
  on storage.objects for select
  using (
    bucket_id = 'note-attachments'
    and exists (
      select 1
      from public.note_attachments na
      join public.notes n on n.id = na.note_id
      where na.storage_path = name
        and (
          (n.family_id is null and n.created_by = auth.uid())
          or (
            n.family_id is not null
            and n.family_id = public.current_user_family_id()
            and (
              n.created_by = auth.uid()
              or n.visible_to_member_ids = '{}'
              or auth.uid() = any (n.visible_to_member_ids)
            )
          )
        )
    )
  );
