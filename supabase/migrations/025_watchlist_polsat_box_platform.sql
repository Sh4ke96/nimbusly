-- Replace sky_showtime with polsat_box (platform rename)

update public.watchlist_items
set streaming_platforms = array_replace(streaming_platforms, 'sky_showtime', 'polsat_box')
where 'sky_showtime' = any(streaming_platforms);

alter table public.watchlist_items
  drop constraint if exists watchlist_items_streaming_platforms_check;

alter table public.watchlist_items
  add constraint watchlist_items_streaming_platforms_check
  check (
    streaming_platforms <@ array[
      'netflix',
      'max',
      'disney_plus',
      'prime_video',
      'apple_tv',
      'canal_plus',
      'player',
      'polsat_box'
    ]::text[]
  );
