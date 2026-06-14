-- Movies & TV series watchlist

create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 200),
  media_type text not null check (media_type in ('movie', 'series')),
  status text not null default 'to_watch' check (
    status in ('to_watch', 'watching', 'watched')
  ),
  notes text not null default '' check (char_length(notes) <= 500),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index watchlist_items_family_idx on public.watchlist_items (family_id);
create index watchlist_items_creator_idx on public.watchlist_items (created_by);
create index watchlist_items_status_idx on public.watchlist_items (status);
create index watchlist_items_media_type_idx on public.watchlist_items (media_type);

alter table public.watchlist_items enable row level security;

create policy "Users can view own solo watchlist items"
  on public.watchlist_items for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family watchlist items"
  on public.watchlist_items for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert watchlist items"
  on public.watchlist_items for insert
  with check (
    created_by = auth.uid()
    and (
      (family_id is null and not exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.account_mode = 'family'
          and p.family_id is not null
      ))
      or (
        family_id is not null
        and family_id = public.current_user_family_id()
      )
    )
  );

create policy "Creators can update watchlist items"
  on public.watchlist_items for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete watchlist items"
  on public.watchlist_items for delete
  using (created_by = auth.uid());
