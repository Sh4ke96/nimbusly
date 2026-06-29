-- Remove per-entity watches (replaced by per-module notification preferences)

drop function if exists public.create_watcher_notifications(text, uuid, uuid[], text, text, text, jsonb);

drop table if exists public.shopping_list_watches;
drop table if exists public.budget_watches;
