create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  avatar_color text not null default '#618764',
  family_id uuid references public.families (id) on delete set null,
  account_mode text not null default 'solo' check (account_mode in ('family', 'solo')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can create families"
  on public.families for insert
  with check (auth.uid() = created_by);

create policy "Users can view their family"
  on public.families for select
  using (
    created_by = auth.uid()
    or id in (select family_id from public.profiles where id = auth.uid())
  );
