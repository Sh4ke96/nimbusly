-- Compare invite codes without dashes/spaces (DB stores XXXX-XXXX, clients send XXXXXXXX)

create or replace function public.normalize_family_invite_code(p_code text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(regexp_replace(trim(coalesce(p_code, '')), '\s+', '', 'g'), '-', '', 'g'));
$$;

create or replace function public.lookup_family_by_invite_code(p_code text)
returns table(id uuid, name text)
language sql
security definer
set search_path = public
as $$
  select f.id, f.name
  from public.families f
  where public.normalize_family_invite_code(f.invite_code)
    = public.normalize_family_invite_code(p_code)
  limit 1;
$$;

grant execute on function public.normalize_family_invite_code(text) to authenticated;
grant execute on function public.lookup_family_by_invite_code(text) to authenticated;
