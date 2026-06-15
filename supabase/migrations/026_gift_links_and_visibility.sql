-- Gift ideas: optional product link + per-member visibility (family mode)

alter table public.gift_ideas
  add column link_url text,
  add column visible_to_member_ids uuid[] not null default '{}';

alter table public.gift_ideas
  add constraint gift_ideas_link_url_chk
  check (
    link_url is null
    or (
      char_length(link_url) > 0
      and char_length(link_url) <= 2048
      and link_url ~* '^https?://'
    )
  );

create index gift_ideas_visible_members_idx on public.gift_ideas using gin (visible_to_member_ids);

drop policy if exists "Family members can view family gift ideas" on public.gift_ideas;

create policy "Family members can view family gift ideas"
  on public.gift_ideas for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      created_by = auth.uid()
      or visible_to_member_ids = '{}'
      or auth.uid() = any (visible_to_member_ids)
    )
  );
