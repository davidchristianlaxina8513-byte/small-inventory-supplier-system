-- Phase 2A: append-only stock ledger and atomic stock movement function.

create type public.stock_movement_type as enum (
  'receipt',
  'issue',
  'adjustment_in',
  'adjustment_out'
);

create table public.inventory_balances (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null,
  item_id uuid not null,
  location_id uuid not null,
  quantity_on_hand numeric(14, 3) not null default 0 check (quantity_on_hand >= 0),
  updated_at timestamptz not null default now(),
  constraint inventory_balances_item_location_unique unique (item_id, location_id),
  constraint inventory_balances_item_office_fkey
    foreign key (item_id, office_id)
    references public.items (id, office_id)
    on delete restrict,
  constraint inventory_balances_location_office_fkey
    foreign key (location_id, office_id)
    references public.locations (id, office_id)
    on delete restrict
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null,
  item_id uuid not null,
  location_id uuid not null,
  movement_type public.stock_movement_type not null,
  quantity numeric(14, 3) not null check (quantity > 0),
  reason text not null check (char_length(btrim(reason)) between 1 and 500),
  reference text check (reference is null or char_length(btrim(reference)) between 1 and 120),
  performed_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint stock_movements_item_office_fkey
    foreign key (item_id, office_id)
    references public.items (id, office_id)
    on delete restrict,
  constraint stock_movements_location_office_fkey
    foreign key (location_id, office_id)
    references public.locations (id, office_id)
    on delete restrict
);

create index inventory_balances_office_id_idx on public.inventory_balances (office_id);
create index inventory_balances_location_id_idx on public.inventory_balances (location_id);
create index stock_movements_office_created_idx on public.stock_movements (office_id, created_at desc);
create index stock_movements_item_created_idx on public.stock_movements (item_id, created_at desc);
create index stock_movements_performed_by_idx on public.stock_movements (performed_by);

create function public.prevent_stock_movement_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Stock movement history is append-only.'
    using errcode = '42501';
end;
$$;

create trigger stock_movements_append_only
before update or delete on public.stock_movements
for each row execute function public.prevent_stock_movement_mutation();

create function public.prevent_tracking_type_change_after_movements()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.tracking_type <> old.tracking_type
    and exists (
      select 1
      from public.stock_movements
      where item_id = old.id
    ) then
    raise exception 'Tracking type cannot change after stock movements exist.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger items_prevent_tracking_type_change
before update of tracking_type on public.items
for each row execute function public.prevent_tracking_type_change_after_movements();

create function public.record_stock_movement(
  p_item_id uuid,
  p_location_id uuid,
  p_movement_type public.stock_movement_type,
  p_quantity numeric,
  p_reason text,
  p_reference text default null
)
returns table (movement_id uuid, quantity_on_hand numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  item_office_id uuid;
  item_is_active boolean;
  location_office_id uuid;
  normalized_reason text := btrim(coalesce(p_reason, ''));
  normalized_reference text := nullif(btrim(coalesce(p_reference, '')), '');
  quantity_delta numeric;
  current_quantity numeric;
  next_quantity numeric;
  inserted_movement_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication is required.'
      using errcode = '42501';
  end if;

  if p_movement_type is null then
    raise exception 'A movement type is required.'
      using errcode = '23514';
  end if;

  if p_quantity is null
    or p_quantity::text in ('NaN', 'Infinity', '-Infinity')
    or p_quantity <= 0
    or p_quantity <> round(p_quantity, 3)
    or p_quantity >= 100000000000 then
    raise exception 'Quantity must be greater than zero, have at most three decimal places, and fit the inventory range.'
      using errcode = '23514';
  end if;

  if normalized_reason = '' or char_length(normalized_reason) > 500 then
    raise exception 'A reason between 1 and 500 characters is required.'
      using errcode = '23514';
  end if;

  if normalized_reference is not null and char_length(normalized_reference) > 120 then
    raise exception 'The reference must be 120 characters or fewer.'
      using errcode = '23514';
  end if;

  select office_id, is_active
  into item_office_id, item_is_active
  from public.items
  where id = p_item_id;

  if item_office_id is null then
    raise exception 'Item not found.'
      using errcode = 'P0002';
  end if;

  if not public.can_manage_inventory_office(item_office_id) then
    raise exception 'You are not authorized to change stock for this office.'
      using errcode = '42501';
  end if;

  if not item_is_active then
    raise exception 'Inactive items cannot receive stock movements.'
      using errcode = '23514';
  end if;

  if p_movement_type in ('adjustment_in', 'adjustment_out')
    and not (
      public.is_admin()
      or public.has_office_role(
        item_office_id,
        array['office_head']::public.app_role[]
      )
    ) then
    raise exception 'Only office heads and administrators can record adjustments.'
      using errcode = '42501';
  end if;

  select office_id
  into location_office_id
  from public.locations
  where id = p_location_id;

  if location_office_id is null then
    raise exception 'Location not found.'
      using errcode = 'P0002';
  end if;

  if location_office_id <> item_office_id then
    raise exception 'The item and location belong to different offices.'
      using errcode = '23514';
  end if;

  quantity_delta := case p_movement_type
    when 'receipt' then p_quantity
    when 'adjustment_in' then p_quantity
    else -p_quantity
  end;

  insert into public.inventory_balances (
    office_id,
    item_id,
    location_id,
    quantity_on_hand
  )
  values (item_office_id, p_item_id, p_location_id, 0)
  on conflict (item_id, location_id) do nothing;

  select quantity_on_hand
  into current_quantity
  from public.inventory_balances
  where item_id = p_item_id
    and location_id = p_location_id
  for update;

  next_quantity := current_quantity + quantity_delta;

  if next_quantity < 0 then
    raise exception 'Insufficient stock for this movement.'
      using errcode = '23514';
  end if;

  update public.inventory_balances
  set quantity_on_hand = next_quantity,
      updated_at = now()
  where item_id = p_item_id
    and location_id = p_location_id;

  insert into public.stock_movements (
    office_id,
    item_id,
    location_id,
    movement_type,
    quantity,
    reason,
    reference,
    performed_by
  )
  values (
    item_office_id,
    p_item_id,
    p_location_id,
    p_movement_type,
    p_quantity,
    normalized_reason,
    normalized_reference,
    actor_id
  )
  returning id into inserted_movement_id;

  return query select inserted_movement_id, next_quantity;
end;
$$;

create function public.get_item_movements(target_item_id uuid)
returns table (
  id uuid,
  movement_type public.stock_movement_type,
  quantity numeric,
  reason text,
  reference text,
  performed_by uuid,
  performed_by_name text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  item_office_id uuid;
begin
  select office_id
  into item_office_id
  from public.items
  where id = target_item_id;

  if item_office_id is null then
    raise exception 'Item not found.'
      using errcode = 'P0002';
  end if;

  if not public.can_view_inventory_office(item_office_id) then
    raise exception 'You are not authorized to view this item history.'
      using errcode = '42501';
  end if;

  return query
  select
    movements.id,
    movements.movement_type,
    movements.quantity,
    movements.reason,
    movements.reference,
    movements.performed_by,
    coalesce(profiles.full_name, 'Unknown user') as performed_by_name,
    movements.created_at
  from public.stock_movements as movements
  left join public.profiles as profiles on profiles.id = movements.performed_by
  where movements.item_id = target_item_id
  order by movements.created_at desc, movements.id;
end;
$$;

alter table public.inventory_balances enable row level security;
alter table public.stock_movements enable row level security;

revoke all on table public.inventory_balances from anon, authenticated;
revoke all on table public.stock_movements from anon, authenticated;

grant select on table public.inventory_balances to authenticated;
grant select on table public.stock_movements to authenticated;

create policy "balances readable by inventory staff"
on public.inventory_balances for select
to authenticated
using ((select public.can_view_inventory_office(office_id)));

create policy "movements readable by inventory staff"
on public.stock_movements for select
to authenticated
using ((select public.can_view_inventory_office(office_id)));

revoke all on function public.prevent_stock_movement_mutation() from public, anon, authenticated;
revoke all on function public.prevent_tracking_type_change_after_movements() from public, anon, authenticated;
revoke all on function public.record_stock_movement(uuid, uuid, public.stock_movement_type, numeric, text, text) from public, anon;
revoke all on function public.get_item_movements(uuid) from public, anon;

grant execute on function public.record_stock_movement(uuid, uuid, public.stock_movement_type, numeric, text, text) to authenticated;
grant execute on function public.get_item_movements(uuid) to authenticated;
