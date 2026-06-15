-- Optional emoji icon for chore tasks (single Unicode emoji from picker)

alter table public.chore_tasks
  add column icon_emoji text;

alter table public.chore_tasks
  add constraint chore_tasks_icon_emoji_len_chk
  check (icon_emoji is null or char_length(icon_emoji) <= 16);
