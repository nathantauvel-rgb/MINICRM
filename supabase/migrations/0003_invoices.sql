-- MiniCRM — Invoices
-- Run this in the Supabase SQL Editor AFTER 0002_quotes.sql

create table if not exists public.invoices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  client_id     uuid not null references public.clients(id) on delete restrict,
  quote_id      uuid references public.quotes(id) on delete set null,
  number        text not null,
  status        text not null default 'draft', -- draft | sent | paid | cancelled
  issue_date    date not null default current_date,
  due_date      date not null,
  paid_at       date,
  notes         text,
  total_ht      numeric(12,2) not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, number)
);

create index if not exists invoices_user_id_idx on public.invoices (user_id);
create index if not exists invoices_client_id_idx on public.invoices (client_id);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own"
  on public.invoices for select using (auth.uid() = user_id);

drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own"
  on public.invoices for insert with check (auth.uid() = user_id);

drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own"
  on public.invoices for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own"
  on public.invoices for delete using (auth.uid() = user_id);

-- Items
create table if not exists public.invoice_items (
  id           uuid primary key default gen_random_uuid(),
  invoice_id   uuid not null references public.invoices(id) on delete cascade,
  position     int not null default 0,
  description  text not null,
  quantity     numeric(10,2) not null default 1,
  unit_price   numeric(12,2) not null default 0
);

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

alter table public.invoice_items enable row level security;

drop policy if exists "invoice_items_select_own" on public.invoice_items;
create policy "invoice_items_select_own"
  on public.invoice_items for select using (
    exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id and i.user_id = auth.uid())
  );

drop policy if exists "invoice_items_insert_own" on public.invoice_items;
create policy "invoice_items_insert_own"
  on public.invoice_items for insert with check (
    exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id and i.user_id = auth.uid())
  );

drop policy if exists "invoice_items_update_own" on public.invoice_items;
create policy "invoice_items_update_own"
  on public.invoice_items for update
  using (
    exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id and i.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id and i.user_id = auth.uid())
  );

drop policy if exists "invoice_items_delete_own" on public.invoice_items;
create policy "invoice_items_delete_own"
  on public.invoice_items for delete using (
    exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id and i.user_id = auth.uid())
  );

-- Atomic invoice number increment (continuous numbering required by French law)
create or replace function public.next_invoice_number(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  insert into public.user_settings (user_id) values (p_user_id) on conflict (user_id) do nothing;
  update public.user_settings
  set next_invoice_number = next_invoice_number + 1
  where user_id = p_user_id
  returning next_invoice_number - 1 into n;
  return n;
end;
$$;

grant execute on function public.next_invoice_number(uuid) to authenticated;
