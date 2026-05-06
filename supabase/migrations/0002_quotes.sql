-- MiniCRM — Settings + Quotes
-- Run this in the Supabase SQL Editor AFTER 0001_init.sql

-- 1. User settings (one row per user)
create table if not exists public.user_settings (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  company_name       text,
  siret              text,
  address            text,
  email              text,
  phone              text,
  iban               text,
  vat_exempt         boolean not null default true,
  vat_number         text,
  payment_terms_days int not null default 30,
  next_quote_number  int not null default 1,
  next_invoice_number int not null default 1,
  updated_at         timestamptz not null default now()
);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;

drop policy if exists "settings_select_own" on public.user_settings;
create policy "settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "settings_insert_own" on public.user_settings;
create policy "settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "settings_update_own" on public.user_settings;
create policy "settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Quotes
create table if not exists public.quotes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   uuid not null references public.clients(id) on delete restrict,
  number      text not null,
  status      text not null default 'draft', -- draft | sent | accepted | refused
  issue_date  date not null default current_date,
  valid_until date,
  notes       text,
  total_ht    numeric(12,2) not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, number)
);

create index if not exists quotes_user_id_idx on public.quotes (user_id);
create index if not exists quotes_client_id_idx on public.quotes (client_id);

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;

drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own"
  on public.quotes for select
  using (auth.uid() = user_id);

drop policy if exists "quotes_insert_own" on public.quotes;
create policy "quotes_insert_own"
  on public.quotes for insert
  with check (auth.uid() = user_id);

drop policy if exists "quotes_update_own" on public.quotes;
create policy "quotes_update_own"
  on public.quotes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "quotes_delete_own" on public.quotes;
create policy "quotes_delete_own"
  on public.quotes for delete
  using (auth.uid() = user_id);

-- 3. Quote line items
create table if not exists public.quote_items (
  id           uuid primary key default gen_random_uuid(),
  quote_id     uuid not null references public.quotes(id) on delete cascade,
  position     int not null default 0,
  description  text not null,
  quantity     numeric(10,2) not null default 1,
  unit_price   numeric(12,2) not null default 0
);

create index if not exists quote_items_quote_id_idx on public.quote_items (quote_id);

alter table public.quote_items enable row level security;

drop policy if exists "quote_items_select_own" on public.quote_items;
create policy "quote_items_select_own"
  on public.quote_items for select
  using (
    exists (select 1 from public.quotes q where q.id = quote_items.quote_id and q.user_id = auth.uid())
  );

drop policy if exists "quote_items_insert_own" on public.quote_items;
create policy "quote_items_insert_own"
  on public.quote_items for insert
  with check (
    exists (select 1 from public.quotes q where q.id = quote_items.quote_id and q.user_id = auth.uid())
  );

drop policy if exists "quote_items_update_own" on public.quote_items;
create policy "quote_items_update_own"
  on public.quote_items for update
  using (
    exists (select 1 from public.quotes q where q.id = quote_items.quote_id and q.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.quotes q where q.id = quote_items.quote_id and q.user_id = auth.uid())
  );

drop policy if exists "quote_items_delete_own" on public.quote_items;
create policy "quote_items_delete_own"
  on public.quote_items for delete
  using (
    exists (select 1 from public.quotes q where q.id = quote_items.quote_id and q.user_id = auth.uid())
  );

-- 4. RPC to atomically increment quote number for a user
create or replace function public.next_quote_number(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  -- Ensure a settings row exists
  insert into public.user_settings (user_id) values (p_user_id) on conflict (user_id) do nothing;
  update public.user_settings
  set next_quote_number = next_quote_number + 1
  where user_id = p_user_id
  returning next_quote_number - 1 into n;
  return n;
end;
$$;

grant execute on function public.next_quote_number(uuid) to authenticated;
