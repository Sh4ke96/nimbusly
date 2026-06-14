-- Restaurants and pubs tracker

create table public.restaurant_places (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 120),
  venue_type text not null check (venue_type in ('restaurant', 'pub')),
  visit_status text not null default 'planned' check (
    visit_status in ('planned', 'visited')
  ),
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  comment text not null default '' check (char_length(comment) <= 500),
  notes text not null default '' check (char_length(notes) <= 500),
  address text not null check (
    char_length(trim(address)) > 0 and char_length(address) <= 300
  ),
  visited_at date,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_places_visited_requires_date check (
    visit_status = 'planned' or visited_at is not null
  ),
  constraint restaurant_places_visited_requires_rating check (
    visit_status = 'planned' or rating is not null
  )
);

create index restaurant_places_family_idx on public.restaurant_places (family_id);
create index restaurant_places_creator_idx on public.restaurant_places (created_by);
create index restaurant_places_visit_status_idx on public.restaurant_places (visit_status);
create index restaurant_places_venue_type_idx on public.restaurant_places (venue_type);

alter table public.restaurant_places enable row level security;

create policy "Users can view own solo restaurant places"
  on public.restaurant_places for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family restaurant places"
  on public.restaurant_places for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert restaurant places"
  on public.restaurant_places for insert
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

create policy "Creators can update restaurant places"
  on public.restaurant_places for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete restaurant places"
  on public.restaurant_places for delete
  using (created_by = auth.uid());
