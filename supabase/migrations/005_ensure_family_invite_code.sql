-- Ensure every family has an invite code (backfill + on-demand for owners)

create or replace function public.ensure_family_invite_code(p_family_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if not exists (
    select 1 from public.families
    where id = p_family_id and created_by = auth.uid()
  ) then
    return null;
  end if;

  select invite_code into v_code
  from public.families
  where id = p_family_id
  for update;

  if v_code is null or length(trim(v_code)) = 0 then
    loop
      v_code := public.generate_family_invite_code();
      exit when not exists (
        select 1 from public.families where upper(invite_code) = upper(v_code)
      );
    end loop;

    update public.families
    set invite_code = v_code
    where id = p_family_id;
  end if;

  return v_code;
end;
$$;

grant execute on function public.ensure_family_invite_code(uuid) to authenticated;

-- Backfill any rows that still lack a code
update public.families
set invite_code = public.generate_family_invite_code()
where invite_code is null or length(trim(invite_code)) = 0;
