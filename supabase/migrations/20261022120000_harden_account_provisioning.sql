-- Phase 1 hardening: trusted auth email, active-aware roles, and admin guardrails.

alter table public.profiles
  add column email text check (email is null or char_length(email) between 3 and 320);

update public.profiles as profiles
set email = users.email
from auth.users as users
where users.id = profiles.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, school_id, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Unnamed user'
    ),
    nullif(trim(new.raw_user_meta_data ->> 'school_id'), ''),
    new.email
  );
  return new;
end;
$$;

create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_email_changed
after update of email on auth.users
for each row execute function public.handle_user_email_change();

create or replace function public.has_role(required_role public.app_role)
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
      and user_roles.role = required_role
      and profiles.account_status = 'active'
  );
$$;

create function public.prevent_self_account_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is not null
    and old.id = actor_id
    and old.account_status = 'active'
    and new.account_status <> 'active' then
    raise exception 'Administrators cannot change their own account status.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_self_status_change
before update of account_status on public.profiles
for each row execute function public.prevent_self_account_status_change();

create function public.prevent_last_active_admin_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  remaining_active_admins integer;
begin
  if actor_id is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if old.role <> 'admin' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' and new.role = 'admin' and new.user_id = old.user_id then
    return new;
  end if;

  if old.user_id = actor_id then
    raise exception 'Administrators cannot remove their own administrator role.'
      using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(742001::bigint);

  select count(*) into remaining_active_admins
  from public.user_roles as assignments
  join public.profiles as profiles on profiles.id = assignments.user_id
  where assignments.role = 'admin'
    and profiles.account_status = 'active'
    and assignments.id <> old.id;

  if remaining_active_admins = 0 then
    raise exception 'Cannot remove the last active administrator.'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger user_roles_prevent_last_admin_removal
before update or delete on public.user_roles
for each row execute function public.prevent_last_active_admin_removal();

revoke update on table public.profiles from authenticated;
grant update (full_name, school_id, account_status, office_id)
  on table public.profiles to authenticated;

revoke all on function public.handle_user_email_change() from public, anon, authenticated;
revoke all on function public.prevent_self_account_status_change() from public, anon, authenticated;
revoke all on function public.prevent_last_active_admin_removal() from public, anon, authenticated;
