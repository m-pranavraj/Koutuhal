-- Waitlist table for AI Tutor early access signups
-- Run this in the Supabase SQL editor

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  product text not null default 'ai_tutor',
  created_at timestamptz not null default now()
);

-- Unique constraint to prevent duplicate emails per product
alter table public.waitlist
  drop constraint if exists waitlist_email_product_unique;

alter table public.waitlist
  add constraint waitlist_email_product_unique unique (email, product);

-- Enable Row Level Security
alter table public.waitlist enable row level security;

-- Allow anyone to INSERT (public waitlist signup)
create policy if not exists "Allow public waitlist inserts"
  on public.waitlist for insert
  with check (true);

-- Only service role / admins can SELECT
create policy if not exists "Allow admin read waitlist"
  on public.waitlist for select
  using (auth.role() = 'service_role');
