-- Home medicine cabinet (medicine items)

create table public.medicine_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 120),
  form_type text not null check (
    form_type in ('tablets', 'syrup', 'drops', 'cream', 'patch', 'spray', 'other')
  ),
  quantity text not null default '' check (char_length(quantity) <= 80),
  expiry_date date,
  availability text not null default 'in_stock' check (
    availability in ('in_stock', 'low', 'out_of_stock', 'to_buy')
  ),
  location text not null default '' check (char_length(location) <= 80),
  notes text not null default '' check (char_length(notes) <= 500),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medicine_items_family_idx on public.medicine_items (family_id);
create index medicine_items_creator_idx on public.medicine_items (created_by);
create index medicine_items_expiry_idx on public.medicine_items (expiry_date);
create index medicine_items_availability_idx on public.medicine_items (availability);

alter table public.medicine_items enable row level security;

create policy "Users can view own solo medicine items"
  on public.medicine_items for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family medicine items"
  on public.medicine_items for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert medicine items"
  on public.medicine_items for insert
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

create policy "Creators can update medicine items"
  on public.medicine_items for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete medicine items"
  on public.medicine_items for delete
  using (created_by = auth.uid());
