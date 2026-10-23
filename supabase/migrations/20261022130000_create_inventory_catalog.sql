-- Phase 2A: office-scoped inventory catalog (categories, locations, items).

create type public.inventory_tracking_type as enum (
  'serialized_asset',
  'quantity_stock'
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_office_name_unique unique (office_id, name),
  constraint categories_id_office_unique unique (id, office_id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint locations_office_name_unique unique (office_id, name),
  constraint locations_id_office_unique unique (id, office_id)
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices (id) on delete restrict,
  category_id uuid not null,
  item_code text not null check (char_length(btrim(item_code)) between 1 and 64),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  description text check (description is null or char_length(description) <= 2000),
  unit_of_measure text not null check (char_length(btrim(unit_of_measure)) between 1 and 32),
  tracking_type public.inventory_tracking_type not null,
  reorder_level numeric(14, 3) check (reorder_level is null or reorder_level >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_office_code_unique unique (office_id, item_code),
  constraint items_id_office_unique unique (id, office_id),
  constraint items_category_office_fkey
    foreign key (category_id, office_id)
    references public.categories (id, office_id)
    on delete restrict
);

create index categories_office_id_idx on public.categories (office_id);
create index locations_office_id_idx on public.locations (office_id);
create index items_office_active_idx on public.items (office_id, is_active);
create index items_category_id_idx on public.items (category_id);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger locations_set_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

create trigger items_set_updated_at
before update on public.items
for each row execute function public.set_updated_at();

create function public.has_office_role(
  target_office_id uuid,
  required_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as assignments
    join public.profiles as profiles on profiles.id = assignments.user_id
    where assignments.user_id = auth.uid()
      and assignments.office_id = target_office_id
      and assignments.role = any (required_roles)
      and profiles.account_status = 'active'
  );
$$;

create function public.can_view_inventory_office(target_office_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_active_user()
    and (
      public.is_admin()
      or public.has_office_role(
        target_office_id,
        array['office_staff', 'office_head']::public.app_role[]
      )
    );
$$;

create function public.can_manage_inventory_office(target_office_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.can_view_inventory_office(target_office_id);
$$;

alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.items enable row level security;

revoke all on table public.categories from anon, authenticated;
revoke all on table public.locations from anon, authenticated;
revoke all on table public.items from anon, authenticated;

grant select on table public.categories to authenticated;
grant select on table public.locations to authenticated;
grant select on table public.items to authenticated;

grant insert on table public.categories to authenticated;
grant insert on table public.locations to authenticated;
grant insert on table public.items to authenticated;

grant update (name, is_active) on table public.categories to authenticated;
grant update (name, is_active) on table public.locations to authenticated;
grant update (
  category_id,
  item_code,
  name,
  description,
  unit_of_measure,
  tracking_type,
  reorder_level,
  is_active
) on table public.items to authenticated;

create policy "categories readable by inventory staff"
on public.categories for select
to authenticated
using ((select public.can_view_inventory_office(office_id)));

create policy "categories insertable by office managers"
on public.categories for insert
to authenticated
with check ((select public.can_manage_inventory_office(office_id)));

create policy "categories updatable by office managers"
on public.categories for update
to authenticated
using ((select public.can_manage_inventory_office(office_id)))
with check ((select public.can_manage_inventory_office(office_id)));

create policy "locations readable by inventory staff"
on public.locations for select
to authenticated
using ((select public.can_view_inventory_office(office_id)));

create policy "locations insertable by office managers"
on public.locations for insert
to authenticated
with check ((select public.can_manage_inventory_office(office_id)));

create policy "locations updatable by office managers"
on public.locations for update
to authenticated
using ((select public.can_manage_inventory_office(office_id)))
with check ((select public.can_manage_inventory_office(office_id)));

create policy "items readable by inventory staff"
on public.items for select
to authenticated
using ((select public.can_view_inventory_office(office_id)));

create policy "items insertable by office managers"
on public.items for insert
to authenticated
with check ((select public.can_manage_inventory_office(office_id)));

create policy "items updatable by office managers"
on public.items for update
to authenticated
using ((select public.can_manage_inventory_office(office_id)))
with check ((select public.can_manage_inventory_office(office_id)));

revoke all on function public.has_office_role(uuid, public.app_role[]) from public, anon;
revoke all on function public.can_view_inventory_office(uuid) from public, anon;
revoke all on function public.can_manage_inventory_office(uuid) from public, anon;

grant execute on function public.has_office_role(uuid, public.app_role[]) to authenticated;
grant execute on function public.can_view_inventory_office(uuid) to authenticated;
grant execute on function public.can_manage_inventory_office(uuid) to authenticated;
