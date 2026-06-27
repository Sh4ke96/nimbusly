-- Web Push subscriptions (PWA) + system notifications for cron jobs

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users can view own push subscriptions"
  on public.push_subscriptions for select
  using (user_id = auth.uid());

create policy "Users can insert own push subscriptions"
  on public.push_subscriptions for insert
  with check (user_id = auth.uid());

create policy "Users can update own push subscriptions"
  on public.push_subscriptions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own push subscriptions"
  on public.push_subscriptions for delete
  using (user_id = auth.uid());

-- Cron / service role: insert notifications without family auth context
create or replace function public.create_system_notifications(
  p_recipient_ids uuid[],
  p_type text,
  p_title text,
  p_body text,
  p_payload jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
begin
  foreach v_recipient in array p_recipient_ids loop
    insert into public.notifications (user_id, type, title, body, payload)
    values (v_recipient, p_type, p_title, p_body, coalesce(p_payload, '{}'));
  end loop;
end;
$$;

grant execute on function public.create_system_notifications(uuid[], text, text, text, jsonb) to service_role;
