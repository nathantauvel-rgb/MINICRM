-- MiniCRM — Initial schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query → paste → Run)

create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  email       text,
  phone       text,
  company     text,
  address     text,
  siret       text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients (user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- Row Level Security: each user only sees their own clients
alter table public.clients enable row level security;

drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own"
  on public.clients for select
  using (auth.uid() = user_id);

drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own"
  on public.clients for insert
  with check (auth.uid() = user_id);

drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own"
  on public.clients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "clients_delete_own" on public.clients;
create policy "clients_delete_own"
  on public.clients for delete
  using (auth.uid() = user_id);
