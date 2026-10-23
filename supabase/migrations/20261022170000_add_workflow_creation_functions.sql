-- Atomic creation functions for multi-row UI operations.

create function public.create_request(
  p_office_id uuid,
  p_request_type public.request_type,
  p_purpose text,
  p_needed_at timestamptz,
  p_item_id uuid,
  p_quantity numeric,
  p_notes text default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare request_id uuid; item_office uuid;
begin
  if not public.is_active_user() then raise exception 'Not authorized.' using errcode='42501'; end if;
  select office_id into item_office from public.items where id=p_item_id and is_active;
  if item_office is null or item_office<>p_office_id then raise exception 'Item and office do not match.' using errcode='23514'; end if;
  if p_quantity is null or p_quantity<=0 then raise exception 'Quantity must be positive.' using errcode='23514'; end if;
  insert into public.requests(requester_id,office_id,request_type,purpose,needed_at)
  values(auth.uid(),p_office_id,p_request_type,btrim(p_purpose),p_needed_at) returning id into request_id;
  insert into public.request_items(request_id,item_id,requested_quantity,notes)
  values(request_id,p_item_id,p_quantity,nullif(btrim(coalesce(p_notes,'')),''));
  perform public.write_audit('request.create','request',request_id,'{}');
  return request_id;
end; $$;

create function public.create_purchase_request(
  p_office_id uuid,
  p_justification text,
  p_item_id uuid,
  p_quantity numeric,
  p_estimated_unit_cost numeric default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare request_id uuid; item_office uuid;
begin
  if not public.can_manage_office_workflow(p_office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  select office_id into item_office from public.items where id=p_item_id and is_active;
  if item_office is null or item_office<>p_office_id then raise exception 'Item and office do not match.' using errcode='23514'; end if;
  insert into public.purchase_requests(office_id,requested_by,justification)
  values(p_office_id,auth.uid(),btrim(p_justification)) returning id into request_id;
  insert into public.purchase_request_items(purchase_request_id,item_id,quantity,estimated_unit_cost)
  values(request_id,p_item_id,p_quantity,p_estimated_unit_cost);
  perform public.write_audit('purchase_request.create','purchase_request',request_id,'{}');
  return request_id;
end; $$;

create function public.create_purchase_order(
  p_purchase_request_id uuid,
  p_supplier_id uuid,
  p_item_id uuid,
  p_location_id uuid,
  p_quantity numeric,
  p_unit_cost numeric
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare pr public.purchase_requests; order_id uuid; item_office uuid; location_office uuid;
begin
  select * into pr from public.purchase_requests where id=p_purchase_request_id for update;
  if pr.id is null or not public.can_approve_office_workflow(pr.office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  select office_id into item_office from public.items where id=p_item_id;
  select office_id into location_office from public.locations where id=p_location_id;
  if item_office<>pr.office_id or location_office<>pr.office_id then raise exception 'Item, location, and office do not match.' using errcode='23514'; end if;
  insert into public.purchase_orders(purchase_request_id,supplier_id,ordered_by)
  values(pr.id,p_supplier_id,auth.uid()) returning id into order_id;
  insert into public.purchase_order_items(purchase_order_id,item_id,location_id,ordered_quantity,unit_cost)
  values(order_id,p_item_id,p_location_id,p_quantity,p_unit_cost);
  update public.purchase_requests set status='ordered' where id=pr.id;
  perform public.write_audit('purchase_order.create','purchase_order',order_id,'{}');
  return order_id;
end; $$;

grant execute on function public.create_request(uuid,public.request_type,text,timestamptz,uuid,numeric,text), public.create_purchase_request(uuid,text,uuid,numeric,numeric), public.create_purchase_order(uuid,uuid,uuid,uuid,numeric,numeric) to authenticated;
