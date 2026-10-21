create table public.examples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.examples enable row level security;
revoke all on table public.examples from anon, authenticated;
create index examples_user_id_idx on public.examples (user_id);

-- No grants or policies: authentication is intentionally undecided and access is fail-closed.
