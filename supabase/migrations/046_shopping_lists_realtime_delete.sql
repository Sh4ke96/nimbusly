-- DELETE realtime events need non-PK columns when using server-side filters.
-- Client also scopes events; FULL identity makes payloads complete for debugging/tools.
alter table public.shopping_lists replica identity full;
