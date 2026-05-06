-- MiniCRM — Subscriptions (Stripe)
-- Run AFTER 0004_reminders.sql

alter table public.user_settings
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text not null default 'trialing',
  add column if not exists current_period_end timestamptz,
  add column if not exists trial_ends_at timestamptz;

create unique index if not exists user_settings_stripe_customer_idx
  on public.user_settings (stripe_customer_id)
  where stripe_customer_id is not null;

-- Auto-create user_settings row on user signup with 14-day trial
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id, trial_ends_at, subscription_status)
  values (new.id, now() + interval '14 days', 'trialing')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: existing users get a trial (already past their signup date but at least give them 14 days from now)
insert into public.user_settings (user_id, trial_ends_at, subscription_status)
select id, now() + interval '14 days', 'trialing'
from auth.users
on conflict (user_id) do update
  set trial_ends_at = coalesce(public.user_settings.trial_ends_at, now() + interval '14 days');
