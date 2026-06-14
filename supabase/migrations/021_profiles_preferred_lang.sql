alter table public.profiles
  add column if not exists preferred_lang text not null default 'pl'
  check (preferred_lang in ('pl', 'en'));

comment on column public.profiles.preferred_lang is
  'User UI language for emails and client-side sorting when cookie is unavailable';
