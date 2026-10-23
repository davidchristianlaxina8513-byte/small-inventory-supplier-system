-- Forward fix for ambiguous PL/pgSQL references between OUT parameters and table columns.

create or replace function public.record_stock_movement(
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

  select items.office_id, items.is_active
  into item_office_id, item_is_active
  from public.items as items
  where items.id = p_item_id;

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

  select locations.office_id
  into location_office_id
  from public.locations as locations
  where locations.id = p_location_id;

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

  select balances.quantity_on_hand
  into current_quantity
  from public.inventory_balances as balances
  where balances.item_id = p_item_id
    and balances.location_id = p_location_id
  for update;

  next_quantity := current_quantity + quantity_delta;

  if next_quantity < 0 then
    raise exception 'Insufficient stock for this movement.'
      using errcode = '23514';
  end if;

  update public.inventory_balances as balances
  set quantity_on_hand = next_quantity,
      updated_at = now()
  where balances.item_id = p_item_id
    and balances.location_id = p_location_id;

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
  returning stock_movements.id into inserted_movement_id;

  return query select inserted_movement_id, next_quantity;
end;
$$;

create or replace function public.get_item_movements(target_item_id uuid)
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
  select target_items.office_id
  into item_office_id
  from public.items as target_items
  where target_items.id = target_item_id;

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

revoke all on function public.record_stock_movement(uuid, uuid, public.stock_movement_type, numeric, text, text) from public, anon;
revoke all on function public.get_item_movements(uuid) from public, anon;

grant execute on function public.record_stock_movement(uuid, uuid, public.stock_movement_type, numeric, text, text) to authenticated;
grant execute on function public.get_item_movements(uuid) to authenticated;
