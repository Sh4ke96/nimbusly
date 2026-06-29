-- Notes: pinning, markdown format, attachments

alter table public.notes
  add column if not exists is_pinned boolean not null default false,
  add column if not exists content_format text not null default 'plain'
    check (content_format in ('plain', 'markdown'));

create index if not exists notes_pinned_idx on public.notes (is_pinned desc, updated_at desc);

create table public.note_attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  file_name text not null check (
    char_length(trim(file_name)) > 0
    and char_length(file_name) <= 255
  ),
  storage_path text not null,
  mime_type text not null check (char_length(mime_type) <= 100),
  byte_size integer not null check (byte_size > 0 and byte_size <= 5242880),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index note_attachments_note_idx on public.note_attachments (note_id);
create index note_attachments_creator_idx on public.note_attachments (created_by);

alter table public.note_attachments enable row level security;

-- Solo attachments
create policy "Users can view solo note attachments"
  on public.note_attachments for select
  using (
    exists (
      select 1 from public.notes n
      where n.id = note_id
        and n.family_id is null
        and n.created_by = auth.uid()
    )
  );

create policy "Users can insert solo note attachments"
  on public.note_attachments for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.notes n
      where n.id = note_id
        and n.family_id is null
        and n.created_by = auth.uid()
    )
  );

create policy "Users can delete solo note attachments"
  on public.note_attachments for delete
  using (
    created_by = auth.uid()
    and exists (
      select 1 from public.notes n
      where n.id = note_id
        and n.family_id is null
        and n.created_by = auth.uid()
    )
  );

-- Family attachments (note creator)
create policy "Family can view note attachments"
  on public.note_attachments for select
  using (
    exists (
      select 1 from public.notes n
      where n.id = note_id
        and n.family_id is not null
        and n.family_id = public.current_user_family_id()
        and (
          n.created_by = auth.uid()
          or n.visible_to_member_ids = '{}'
          or auth.uid() = any (n.visible_to_member_ids)
        )
    )
  );

create policy "Creators can insert family note attachments"
  on public.note_attachments for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.notes n
      where n.id = note_id
        and n.created_by = auth.uid()
        and n.family_id = public.current_user_family_id()
    )
  );

create policy "Creators can delete family note attachments"
  on public.note_attachments for delete
  using (created_by = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'note-attachments',
  'note-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do nothing;

create policy "Users upload own note attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'note-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own note attachments"
  on storage.objects for select
  using (
    bucket_id = 'note-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own note attachments"
  on storage.objects for delete
  using (
    bucket_id = 'note-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
