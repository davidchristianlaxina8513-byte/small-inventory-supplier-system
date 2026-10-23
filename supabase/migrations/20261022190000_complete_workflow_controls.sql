-- Close remaining workflow controls: safe requester asset discovery, transfers,
-- incident resolution, and stricter loan-to-request matching.

create function public.get_reservable_assets()
returns table(id uuid, office_id uuid, item_id uuid, asset_code text, status public.asset_status, condition public.asset_condition)
language sql stable security definer set search_path = '' as $$
  select a.id,a.office_id,a.item_id,a.asset_code,a.status,a.condition
  from public.assets a
  join public.items i on i.id=a.item_id
  where public.is_active_user() and a.is_active and i.is_active and a.status='available';
$$;

create function public.transfer_stock(
  p_item_id uuid,
  p_from_location_id uuid,
  p_to_location_id uuid,
  p_quantity numeric,
  p_reason text
) returns void
language plpgsql security definer set search_path = '' as $$
declare item_office uuid; source_office uuid; destination_office uuid; source_quantity numeric;
begin
  if p_from_location_id=p_to_location_id then raise exception 'Transfer locations must differ.' using errcode='23514'; end if;
  select office_id into item_office from public.items where id=p_item_id;
  select office_id into source_office from public.locations where id=p_from_location_id;
  select office_id into destination_office from public.locations where id=p_to_location_id;
  if item_office is null or source_office<>item_office or destination_office<>item_office then raise exception 'Transfer records must belong to one office.' using errcode='23514'; end if;
  if not public.can_manage_inventory_office(item_office) then raise exception 'Not authorized.' using errcode='42501'; end if;
  if p_quantity is null or p_quantity<=0 or p_quantity<>round(p_quantity,3) or char_length(btrim(coalesce(p_reason,'')))<1 then raise exception 'Invalid transfer quantity or reason.' using errcode='23514'; end if;
  insert into public.inventory_balances(office_id,item_id,location_id,quantity_on_hand)
  values(item_office,p_item_id,p_from_location_id,0),(item_office,p_item_id,p_to_location_id,0)
  on conflict(item_id,location_id) do nothing;
  perform 1 from public.inventory_balances where item_id=p_item_id and location_id in(p_from_location_id,p_to_location_id) order by location_id for update;
  select quantity_on_hand into source_quantity from public.inventory_balances where item_id=p_item_id and location_id=p_from_location_id;
  if source_quantity<p_quantity then raise exception 'Insufficient stock for transfer.' using errcode='23514'; end if;
  update public.inventory_balances set quantity_on_hand=quantity_on_hand-p_quantity,updated_at=now() where item_id=p_item_id and location_id=p_from_location_id;
  update public.inventory_balances set quantity_on_hand=quantity_on_hand+p_quantity,updated_at=now() where item_id=p_item_id and location_id=p_to_location_id;
  insert into public.stock_movements(office_id,item_id,location_id,movement_type,quantity,reason,reference,performed_by) values
  (item_office,p_item_id,p_from_location_id,'transfer_out',p_quantity,btrim(p_reason),'Internal transfer',auth.uid()),
  (item_office,p_item_id,p_to_location_id,'transfer_in',p_quantity,btrim(p_reason),'Internal transfer',auth.uid());
  perform public.write_audit('stock.transfer','item',p_item_id,jsonb_build_object('from_location_id',p_from_location_id,'to_location_id',p_to_location_id,'quantity',p_quantity));
end; $$;

create function public.resolve_incident(
  p_incident_id uuid,
  p_resolution text,
  p_asset_condition public.asset_condition default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare incident public.incidents;
begin
  select * into incident from public.incidents where id=p_incident_id for update;
  if incident.id is null then raise exception 'Incident not found.' using errcode='P0002'; end if;
  if not public.can_manage_office_workflow(incident.office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  if incident.status='resolved' then raise exception 'Incident is already resolved.' using errcode='23514'; end if;
  update public.incidents set status='resolved',resolution=btrim(p_resolution),resolved_by=auth.uid(),resolved_at=now() where id=incident.id;
  if incident.asset_id is not null and p_asset_condition is not null then
    update public.assets set condition=p_asset_condition,status=case when p_asset_condition in ('good','fair') then 'available'::public.asset_status else 'unavailable'::public.asset_status end where id=incident.asset_id;
  end if;
  perform public.write_audit('incident.resolve','incident',incident.id,jsonb_build_object('asset_condition',p_asset_condition));
end; $$;

create or replace function public.release_loan(p_request_id uuid,p_asset_ids uuid[],p_due_at timestamptz)
returns uuid language plpgsql security definer set search_path = '' as $$
declare r public.requests; loan_id uuid; asset_id uuid; a public.assets;
begin
  select * into r from public.requests where id=p_request_id for update;
  if r.id is null or r.request_type<>'borrow' or r.status not in ('approved','partially_approved') or coalesce(array_length(p_asset_ids,1),0)=0 or p_due_at<=now() then raise exception 'Request is not ready for release.' using errcode='23514'; end if;
  if not public.can_manage_office_workflow(r.office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  insert into public.loans(request_id,borrower_id,due_at) values(r.id,r.requester_id,p_due_at) returning id into loan_id;
  foreach asset_id in array p_asset_ids loop
    select * into a from public.assets where id=asset_id and office_id=r.office_id for update;
    if a.id is null or a.status<>'available' or not exists(select 1 from public.request_items ri where ri.request_id=r.id and ri.item_id=a.item_id and coalesce(ri.approved_quantity,0)>0) then raise exception 'Asset is unavailable or does not match the approved request.' using errcode='23514'; end if;
    insert into public.loan_assets(loan_id,asset_id,condition_at_release) values(loan_id,a.id,a.condition);
    update public.assets set status='on_loan' where id=a.id;
  end loop;
  update public.requests set status='completed' where id=r.id;
  perform public.write_audit('loan.release','loan',loan_id,jsonb_build_object('request_id',r.id)); return loan_id;
end; $$;

grant execute on function public.get_reservable_assets(), public.transfer_stock(uuid,uuid,uuid,numeric,text), public.resolve_incident(uuid,text,public.asset_condition) to authenticated;
