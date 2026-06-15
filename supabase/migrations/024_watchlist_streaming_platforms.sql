-- Where to watch: VOD platforms on watchlist items

alter table public.watchlist_items
  add column streaming_platforms text[] not null default '{}';

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
