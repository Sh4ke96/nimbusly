-- Who takes the medicine (may differ from who added the item)

alter table public.medicine_items
  add column taken_by uuid references public.profiles (id) on delete set null;

create index medicine_items_taken_by_idx on public.medicine_items (taken_by);
