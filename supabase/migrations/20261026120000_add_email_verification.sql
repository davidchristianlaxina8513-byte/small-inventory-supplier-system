-- Add email verification support to profiles and create email_verifications table

alter table public.profiles
  add column if not exists is_verified boolean not null default false;

-- Mark existing active profiles as verified so seed users are not blocked
update public.profiles
set is_verified = true
where account_status = 'active';

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  last_sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint email_verifications_user_id_unique unique (user_id)
);

create index if not exists idx_email_verifications_email on public.email_verifications (email);

-- Enforce fail-closed row-level security
alter table public.email_verifications enable row level security;

