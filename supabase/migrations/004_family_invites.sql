-- Family invite codes + email invitations

create or replace function public.generate_family_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  raw text := '';
  i int;
begin
  for i in 1..8 loop
    raw := raw || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return substr(raw, 1, 4) || '-' || substr(raw, 5, 4);
end;
$$;

alter table public.families
  add column if not exists invite_code text;

update public.families
set invite_code = public.generate_family_invite_code()
where invite_code is null;

alter table public.families
  alter column invite_code set not null;

create unique index if not exists families_invite_code_key
  on public.families (upper(invite_code));

create or replace function public.families_set_invite_code()
returns trigger
language plpgsql
as $$
declare
  next_code text;
  attempts int := 0;
begin
  if new.invite_code is not null and length(trim(new.invite_code)) > 0 then
    new.invite_code := upper(trim(new.invite_code));
    return new;
  end if;

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

drop trigger if exists families_set_invite_code on public.families;
create trigger families_set_invite_code
  before insert on public.families
  for each row
  execute function public.families_set_invite_code();

create table if not exists public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users (id) on delete cascade,
  token text not null unique default replace(
    gen_random_uuid()::text || gen_random_uuid()::text,
    '-',
    ''
  ),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

create unique index if not exists family_invitations_pending_unique
  on public.family_invitations (family_id, lower(email))
  where status = 'pending';

alter table public.family_invitations enable row level security;

create policy "Family owners manage invitations"
  on public.family_invitations
  for all
  using (
    family_id in (
      select id from public.families where created_by = auth.uid()
    )
  )
  with check (
    family_id in (
      select id from public.families where created_by = auth.uid()
    )
  );

create or replace function public.lookup_family_by_invite_code(p_code text)
returns table(id uuid, name text)
language sql
security definer
set search_path = public
as $$
  select f.id, f.name
  from public.families f
  where upper(f.invite_code) = upper(regexp_replace(trim(p_code), '\s+', '', 'g'))
  limit 1;
$$;

grant execute on function public.lookup_family_by_invite_code(text) to authenticated;

create or replace function public.lookup_family_invitation(p_token text)
returns table(family_id uuid, family_name text, email text)
language sql
security definer
set search_path = public
as $$
  select fi.family_id, f.name, fi.email
  from public.family_invitations fi
  join public.families f on f.id = fi.family_id
  where fi.token = trim(p_token)
    and fi.status = 'pending'
    and fi.expires_at > now()
  limit 1;
$$;

grant execute on function public.lookup_family_invitation(text) to authenticated, anon;

create or replace function public.accept_family_invitation(
  p_token text,
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.family_invitations%rowtype;
  v_user_email text;
begin
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
  where id = p_user_id;

  if v_user_email is null or v_user_email <> lower(v_invitation.email) then
    return null;
  end if;

  update public.family_invitations
  set status = 'accepted'
  where id = v_invitation.id;

  return v_invitation.family_id;
end;
$$;

grant execute on function public.accept_family_invitation(text, uuid) to authenticated;
