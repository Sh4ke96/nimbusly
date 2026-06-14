-- Enable Supabase Realtime for family-shared modules (client hooks in gifts/chores views).
alter publication supabase_realtime add table public.gift_ideas;
alter publication supabase_realtime add table public.chore_tasks;
