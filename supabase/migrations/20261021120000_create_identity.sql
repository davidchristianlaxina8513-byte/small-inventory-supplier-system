-- Phase 1: identity, offices, role assignments, and fail-closed RLS.

create type public.app_role as enum (
  'student',
  'teacher',
  'non_teaching',
  'office_staff',
  'office_head',
  'admin'
);

create type public.account_status as enum ('pending', 'active', 'suspended');

create table public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 160),
  school_id text unique check (school_id is null or char_length(school_id) between 1 and 64),
  account_status public.account_status not null default 'pending',
  office_id uuid references public.offices (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  office_id uuid references public.offices (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint user_roles_assignment_unique unique nulls not distinct (user_id, role, office_id),
  constraint user_roles_office_scope check (
    (role in ('office_staff', 'office_head')) = (office_id is not null)
  )
);

create index profiles_office_id_idx on public.profiles (office_id);
create index user_roles_user_id_idx on public.user_roles (user_id);
create index user_roles_office_id_idx on public.user_roles (office_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    join public.profiles on profiles.id = user_roles.user_id
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
      and profiles.account_status = 'active'
  );
$$;

create function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and account_status = 'active'
  );
$$;

create function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid() and role = required_role
  );
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, school_id)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Unnamed user'
    ),
    nullif(trim(new.raw_user_meta_data ->> 'school_id'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.offices enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

revoke all on table public.offices from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;

grant select on table public.offices to authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_roles to authenticated;

create policy "offices readable by active users"
on public.offices for select
to authenticated
using ((select public.is_active_user()));

create policy "offices manageable by admins"
on public.offices for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "profiles readable by self or admins"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles updatable by admins"
on public.profiles for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "roles readable by self or admins"
on public.user_roles for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "roles manageable by admins"
on public.user_roles for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_active_user() from public, anon;
revoke all on function public.has_role(public.app_role) from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.has_role(public.app_role) to authenticated;
