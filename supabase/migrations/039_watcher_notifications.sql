-- Watcher notifications: validate via shopping_list_watches / budget_watches
-- (create_family_notifications required actor family_id and broke watcher-only flows)

create or replace function public.create_watcher_notifications(
  p_watch_kind text,
  p_entity_id uuid,
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
  v_recipient uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_watch_kind = 'shopping_list' then
    if not public.user_can_access_shopping_list(p_entity_id) then
      raise exception 'Cannot access shopping list';
    end if;
  elsif p_watch_kind = 'budget' then
    if not public.user_can_access_budget(p_entity_id) then
      raise exception 'Cannot access budget';
    end if;
  else
    raise exception 'Invalid watch kind';
  end if;

  foreach v_recipient in array p_recipient_ids loop
    if v_recipient = auth.uid() then
      continue;
    end if;

    if p_watch_kind = 'shopping_list' then
      if not exists (
        select 1
        from public.shopping_list_watches
        where list_id = p_entity_id
          and user_id = v_recipient
      ) then
        raise exception 'Invalid shopping list watcher';
      end if;
    elsif not exists (
      select 1
      from public.budget_watches
      where budget_id = p_entity_id
        and user_id = v_recipient
    ) then
      raise exception 'Invalid budget watcher';
    end if;

    insert into public.notifications (user_id, type, title, body, payload)
    values (v_recipient, p_type, p_title, p_body, coalesce(p_payload, '{}'));
  end loop;
end;
$$;

grant execute on function public.create_watcher_notifications(
  text,
  uuid,
  uuid[],
  text,
  text,
  text,
  jsonb
) to authenticated;
