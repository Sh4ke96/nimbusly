-- Security hygiene (post-audit v0.14.1): retire unused founder RPC and stale RLS policy

revoke execute on function public.complete_founder_onboarding(text, text, text, uuid) from authenticated;
drop function if exists public.complete_founder_onboarding(text, text, text, uuid);

drop policy if exists "Users can create families" on public.families;
