-- Gift ideas (notes) module

create table public.gift_ideas (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families (id) on delete cascade,
  recipient_type text not null check (
    recipient_type in ('family_member', 'custom')
  ),
  recipient_member_id uuid references public.profiles (id) on delete set null,
  recipient_name text not null check (char_length(trim(recipient_name)) > 0),
  content text not null default '' check (char_length(content) <= 2000),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gift_ideas_recipient_member_chk check (
    (recipient_type = 'family_member' and recipient_member_id is not null)
    or (recipient_type = 'custom' and recipient_member_id is null)
  )
);

create index gift_ideas_family_idx on public.gift_ideas (family_id);
create index gift_ideas_creator_idx on public.gift_ideas (created_by);
create index gift_ideas_recipient_member_idx on public.gift_ideas (recipient_member_id);
create index gift_ideas_recipient_name_idx on public.gift_ideas (recipient_name);

alter table public.gift_ideas enable row level security;

create policy "Users can view own solo gift ideas"
  on public.gift_ideas for select
  using (
    family_id is null
    and created_by = auth.uid()
  );

create policy "Family members can view family gift ideas"
  on public.gift_ideas for select
  using (
    family_id is not null
    and family_id = public.current_user_family_id()
  );

create policy "Users can insert gift ideas"
  on public.gift_ideas for insert
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

create policy "Creators can update gift ideas"
  on public.gift_ideas for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Creators can delete gift ideas"
  on public.gift_ideas for delete
  using (created_by = auth.uid());

alter publication supabase_realtime add table public.gift_ideas;
