-- Family pets and care tracking

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 80),
  species text not null check (species in ('dog', 'cat', 'bird', 'other')),
  notes text not null default '' check (char_length(notes) <= 500),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pet_care_items (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  family_id uuid references public.families (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 120),
  care_type text not null check (
    care_type in ('vaccination', 'vet_visit', 'deworming', 'medication', 'food', 'other')
  ),
  last_done_at date,
  next_due_date date,
  stock_status text check (
    stock_status is null
    or stock_status in ('in_stock', 'low', 'out_of_stock', 'to_buy')
  ),
  quantity text not null default '' check (char_length(quantity) <= 80),
  notes text not null default '' check (char_length(notes) <= 500),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pets_family_idx on public.pets (family_id);
create index pets_creator_idx on public.pets (created_by);
create index pet_care_items_pet_idx on public.pet_care_items (pet_id);
create index pet_care_items_family_idx on public.pet_care_items (family_id);
create index pet_care_items_due_idx on public.pet_care_items (next_due_date);
create index pet_care_items_stock_idx on public.pet_care_items (stock_status);

alter table public.pets enable row level security;
alter table public.pet_care_items enable row level security;

create policy "Users can view own solo pets"
  on public.pets for select
  using (family_id is null and created_by = auth.uid());

create policy "Family members can view family pets"
  on public.pets for select
  using (family_id is not null and family_id = public.current_user_family_id());

create policy "Users can insert pets"
  on public.pets for insert
  with check (
    created_by = auth.uid()
    and (
      (family_id is null and not exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.account_mode = 'family'
          and p.family_id is not null
      ))
      or (family_id is not null and family_id = public.current_user_family_id())
    )
  );

create policy "Creators can update pets"
  on public.pets for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete pets"
  on public.pets for delete
  using (created_by = auth.uid());

create policy "Users can view solo pet care items"
  on public.pet_care_items for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family pet care items"
  on public.pet_care_items for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert pet care items"
  on public.pet_care_items for insert
  with check (
    created_by = auth.uid()
    and (
      (family_id is null and not exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.account_mode = 'family'
          and p.family_id is not null
      ))
      or (family_id is not null and family_id = public.current_user_family_id())
    )
  );

create policy "Creators can update pet care items"
  on public.pet_care_items for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete pet care items"
  on public.pet_care_items for delete
  using (created_by = auth.uid());
