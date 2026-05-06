-- MiniCRM — Invoice reminders tracking
-- Run AFTER 0003_invoices.sql

alter table public.invoices
  add column if not exists last_reminder_at timestamptz,
  add column if not exists reminder_count int not null default 0;
