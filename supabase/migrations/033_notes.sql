-- Notes module: user-created categories (with emoji) + notes with family visibility

create table public.note_categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  name text not null check (
    char_length(trim(name)) > 0
    and char_length(name) <= 100
  ),
  icon_emoji text check (
    icon_emoji is null
    or (
      char_length(icon_emoji) > 0
      and char_length(icon_emoji) <= 16
    )
  ),
  sort_order integer not null default 0,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index note_categories_family_idx on public.note_categories (family_id);
create index note_categories_creator_idx on public.note_categories (created_by);
create index note_categories_family_order_idx
  on public.note_categories (family_id, sort_order);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  category_id uuid references public.note_categories (id) on delete set null,
  title text not null check (
    char_length(trim(title)) > 0
    and char_length(title) <= 200
  ),
  content text not null default '' check (char_length(content) <= 5000),
  visible_to_member_ids uuid[] not null default '{}',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_family_idx on public.notes (family_id);
create index notes_creator_idx on public.notes (created_by);
create index notes_category_idx on public.notes (category_id);
create index notes_visible_members_idx on public.notes using gin (visible_to_member_ids);

alter table public.note_categories enable row level security;
alter table public.notes enable row level security;

-- Categories: solo
create policy "Users can view own solo note categories"
  on public.note_categories for select
  using (family_id is null and created_by = auth.uid());

create policy "Users can insert solo note categories"
  on public.note_categories for insert
  with check (
    created_by = auth.uid()
    and family_id is null
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.account_mode = 'family'
        and p.family_id is not null
    )
  );

create policy "Creators can update solo note categories"
  on public.note_categories for update
  using (family_id is null and created_by = auth.uid())
  with check (family_id is null and created_by = auth.uid());

create policy "Creators can delete solo note categories"
  on public.note_categories for delete
  using (family_id is null and created_by = auth.uid());

-- Categories: family
create policy "Family members can view note categories"
  on public.note_categories for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Family members can insert note categories"
  on public.note_categories for insert
  with check (
    created_by = auth.uid()
    and family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Creators can update note categories"
  on public.note_categories for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete note categories"
  on public.note_categories for delete
  using (created_by = auth.uid());

-- Notes: solo
create policy "Users can view own solo notes"
  on public.notes for select
  using (family_id is null and created_by = auth.uid());

create policy "Users can insert solo notes"
  on public.notes for insert
  with check (
    created_by = auth.uid()
    and family_id is null
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.account_mode = 'family'
        and p.family_id is not null
    )
  );

create policy "Creators can update solo notes"
  on public.notes for update
  using (family_id is null and created_by = auth.uid())
  with check (family_id is null and created_by = auth.uid());

create policy "Creators can delete solo notes"
  on public.notes for delete
  using (family_id is null and created_by = auth.uid());

-- Notes: family with visibility
create policy "Family members can view family notes"
  on public.notes for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
    and (
      created_by = auth.uid()
      or visible_to_member_ids = '{}'
      or auth.uid() = any (visible_to_member_ids)
    )
  );

create policy "Family members can insert family notes"
  on public.notes for insert
  with check (
    created_by = auth.uid()
    and family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Creators can update family notes"
  on public.notes for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete family notes"
  on public.notes for delete
  using (created_by = auth.uid());

alter publication supabase_realtime add table public.note_categories;
alter publication supabase_realtime add table public.notes;
