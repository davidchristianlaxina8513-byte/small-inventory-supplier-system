-- Complete SISS academic prototype workflows: assets, requests, loans,
-- reservations, incidents, procurement, notifications, and audit history.

create extension if not exists btree_gist with schema extensions;

create type public.asset_condition as enum ('good', 'fair', 'damaged', 'missing', 'under_repair', 'disposed');
create type public.asset_status as enum ('available', 'reserved', 'on_loan', 'unavailable', 'disposed');
create type public.request_type as enum ('borrow', 'consumable', 'reservation', 'purchase', 'other');
create type public.request_status as enum ('draft', 'submitted', 'under_review', 'needs_clarification', 'approved', 'partially_approved', 'rejected', 'cancelled', 'completed');
create type public.decision_type as enum ('approve', 'partially_approve', 'reject', 'needs_clarification');
create type public.loan_status as enum ('active', 'partially_returned', 'returned');
create type public.reservation_status as enum ('pending', 'approved', 'cancelled', 'completed', 'expired');
create type public.incident_type as enum ('damage', 'missing');
create type public.incident_status as enum ('reported', 'under_review', 'resolved');
create type public.procurement_status as enum ('draft', 'submitted', 'approved', 'rejected', 'ordered', 'partially_received', 'received', 'cancelled');

alter type public.stock_movement_type add value 'return';
alter type public.stock_movement_type add value 'transfer_in';
alter type public.stock_movement_type add value 'transfer_out';
alter type public.stock_movement_type add value 'damage';
alter type public.stock_movement_type add value 'disposal';

create sequence public.request_reference_seq;
create sequence public.purchase_request_reference_seq;
create sequence public.purchase_order_reference_seq;

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete restrict,
  item_id uuid not null,
  location_id uuid not null,
  asset_code text not null check (char_length(btrim(asset_code)) between 1 and 64),
  serial_number text check (serial_number is null or char_length(btrim(serial_number)) between 1 and 120),
  condition public.asset_condition not null default 'good',
  status public.asset_status not null default 'available',
  notes text check (notes is null or char_length(notes) <= 1000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (office_id, asset_code),
  unique (id, office_id),
  foreign key (item_id, office_id) references public.items(id, office_id) on delete restrict,
  foreign key (location_id, office_id) references public.locations(id, office_id) on delete restrict
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique default ('REQ-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.request_reference_seq')::text, 6, '0')),
  requester_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  office_id uuid not null references public.offices(id) on delete restrict,
  request_type public.request_type not null,
  purpose text not null check (char_length(btrim(purpose)) between 3 and 1000),
  needed_at timestamptz,
  status public.request_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  requested_quantity numeric(14,3) not null check (requested_quantity > 0),
  approved_quantity numeric(14,3) check (approved_quantity >= 0 and approved_quantity <= requested_quantity),
  issued_quantity numeric(14,3) not null default 0 check (issued_quantity >= 0),
  notes text check (notes is null or char_length(notes) <= 500),
  unique(request_id, item_id),
  check (approved_quantity is null or issued_quantity <= approved_quantity)
);

create table public.request_decisions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete restrict,
  decided_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  decision public.decision_type not null,
  reason text not null check (char_length(btrim(reason)) between 2 and 1000),
  created_at timestamptz not null default now()
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.requests(id) on delete restrict,
  borrower_id uuid not null references public.profiles(id) on delete restrict,
  released_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  released_at timestamptz not null default now(),
  due_at timestamptz not null check (due_at > released_at),
  status public.loan_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.loan_assets (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete restrict,
  asset_id uuid not null references public.assets(id) on delete restrict,
  condition_at_release public.asset_condition not null,
  condition_at_return public.asset_condition,
  returned_at timestamptz,
  received_by uuid references public.profiles(id) on delete restrict,
  unique(loan_id, asset_id)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests(id) on delete restrict,
  requester_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  office_id uuid not null references public.offices(id) on delete restrict,
  asset_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  purpose text not null check (char_length(btrim(purpose)) between 3 and 500),
  status public.reservation_status not null default 'approved',
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key(asset_id, office_id) references public.assets(id, office_id) on delete restrict
);

alter table public.reservations add constraint reservations_no_overlap
exclude using gist (
  asset_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
) where (status in ('pending', 'approved'));

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete restrict,
  item_id uuid not null,
  asset_id uuid,
  reported_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  incident_type public.incident_type not null,
  occurred_at timestamptz not null,
  description text not null check (char_length(btrim(description)) between 5 and 2000),
  status public.incident_status not null default 'reported',
  resolution text check (resolution is null or char_length(resolution) <= 2000),
  resolved_by uuid references public.profiles(id) on delete restrict,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key(item_id, office_id) references public.items(id, office_id) on delete restrict,
  foreign key(asset_id, office_id) references public.assets(id, office_id) on delete restrict
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 2 and 160),
  contact_person text,
  email text,
  phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique default ('PR-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.purchase_request_reference_seq')::text, 6, '0')),
  office_id uuid not null references public.offices(id) on delete restrict,
  requested_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  justification text not null check (char_length(btrim(justification)) between 3 and 1000),
  status public.procurement_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.purchase_request_items (
  id uuid primary key default gen_random_uuid(),
  purchase_request_id uuid not null references public.purchase_requests(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  quantity numeric(14,3) not null check(quantity > 0),
  estimated_unit_cost numeric(14,2) check(estimated_unit_cost is null or estimated_unit_cost >= 0),
  unique(purchase_request_id, item_id)
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('PO-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.purchase_order_reference_seq')::text, 6, '0')),
  purchase_request_id uuid not null references public.purchase_requests(id) on delete restrict,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  ordered_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  order_date timestamptz not null default now(),
  status public.procurement_status not null default 'ordered',
  created_at timestamptz not null default now()
);

create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete restrict,
  ordered_quantity numeric(14,3) not null check(ordered_quantity > 0),
  received_quantity numeric(14,3) not null default 0 check(received_quantity >= 0 and received_quantity <= ordered_quantity),
  unit_cost numeric(14,2) not null check(unit_cost >= 0),
  unique(purchase_order_id, item_id, location_id)
);

create table public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete restrict,
  received_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  received_at timestamptz not null default now(),
  notes text check(notes is null or char_length(notes) <= 1000)
);

create table public.goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  goods_receipt_id uuid not null references public.goods_receipts(id) on delete restrict,
  purchase_order_item_id uuid not null references public.purchase_order_items(id) on delete restrict,
  received_quantity numeric(14,3) not null check(received_quantity > 0),
  accepted_quantity numeric(14,3) not null check(accepted_quantity >= 0),
  rejected_quantity numeric(14,3) generated always as (received_quantity - accepted_quantity) stored,
  discrepancy_notes text,
  check(accepted_quantity <= received_quantity)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index requests_owner_status_idx on public.requests(requester_id, status, created_at desc);
create index requests_office_status_idx on public.requests(office_id, status, created_at desc);
create index reservations_asset_time_idx on public.reservations(asset_id, starts_at, ends_at);
create index loans_borrower_status_idx on public.loans(borrower_id, status, due_at);
create index incidents_office_status_idx on public.incidents(office_id, status, created_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

create trigger assets_set_updated_at before update on public.assets for each row execute function public.set_updated_at();
create trigger requests_set_updated_at before update on public.requests for each row execute function public.set_updated_at();
create trigger suppliers_set_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create trigger purchase_requests_set_updated_at before update on public.purchase_requests for each row execute function public.set_updated_at();

create function public.can_manage_office_workflow(target_office_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin() or public.has_office_role(target_office_id, array['office_staff','office_head']::public.app_role[]);
$$;

create function public.can_approve_office_workflow(target_office_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin() or public.has_office_role(target_office_id, array['office_head']::public.app_role[]);
$$;

create function public.write_audit(p_action text, p_entity_type text, p_entity_id uuid, p_metadata jsonb default '{}'::jsonb)
returns void language sql volatile security definer set search_path = '' as $$
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values(auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
$$;

create function public.decide_request(p_request_id uuid, p_decision public.decision_type, p_reason text, p_approved_quantities jsonb default '{}'::jsonb)
returns public.request_status language plpgsql security definer set search_path = '' as $$
declare r public.requests; next_status public.request_status;
begin
  select * into r from public.requests where id=p_request_id for update;
  if r.id is null then raise exception 'Request not found.' using errcode='P0002'; end if;
  if not public.can_approve_office_workflow(r.office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  if r.status not in ('submitted','under_review','needs_clarification') then raise exception 'Request cannot be decided in its current state.' using errcode='23514'; end if;
  next_status := case p_decision when 'approve' then 'approved' when 'partially_approve' then 'partially_approved' when 'reject' then 'rejected' else 'needs_clarification' end;
  if p_decision in ('approve','partially_approve') then
    update public.request_items ri set approved_quantity = least(ri.requested_quantity, greatest(0, coalesce((p_approved_quantities->>ri.id::text)::numeric, case when p_decision='approve' then ri.requested_quantity else 0 end))) where ri.request_id=p_request_id;
  end if;
  insert into public.request_decisions(request_id, decision, reason) values(p_request_id,p_decision,btrim(p_reason));
  update public.requests set status=next_status where id=p_request_id;
  insert into public.notifications(user_id,type,title,message) values(r.requester_id,'request_decision','Request '||r.reference_number||' updated','Your request is now '||replace(next_status::text,'_',' ')||'.');
  perform public.write_audit('request.'||p_decision::text,'request',p_request_id,jsonb_build_object('status',next_status));
  return next_status;
end; $$;

create function public.issue_request_item(p_request_item_id uuid, p_location_id uuid, p_quantity numeric)
returns uuid language plpgsql security definer set search_path = '' as $$
declare ri public.request_items; r public.requests; movement uuid; balance numeric;
begin
  select * into ri from public.request_items where id=p_request_item_id for update;
  select * into r from public.requests where id=ri.request_id for update;
  if ri.id is null or r.id is null then raise exception 'Request item not found.' using errcode='P0002'; end if;
  if not public.can_manage_office_workflow(r.office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  if r.status not in ('approved','partially_approved') or ri.approved_quantity is null or ri.issued_quantity+p_quantity>ri.approved_quantity then raise exception 'Invalid issued quantity or request state.' using errcode='23514'; end if;
  select movement_id, quantity_on_hand into movement,balance from public.record_stock_movement(ri.item_id,p_location_id,'issue',p_quantity,'Issued for request',r.reference_number);
  update public.request_items set issued_quantity=issued_quantity+p_quantity where id=ri.id;
  if not exists(select 1 from public.request_items where request_id=r.id and coalesce(issued_quantity,0)<coalesce(approved_quantity,0)) then update public.requests set status='completed' where id=r.id; end if;
  perform public.write_audit('request.issue','request',r.id,jsonb_build_object('request_item_id',ri.id,'quantity',p_quantity));
  return movement;
end; $$;

create function public.create_reservation(p_asset_id uuid,p_starts_at timestamptz,p_ends_at timestamptz,p_purpose text,p_request_id uuid default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare a public.assets; reservation_id uuid;
begin
  select * into a from public.assets where id=p_asset_id;
  if not public.is_active_user() then raise exception 'Not authorized.' using errcode='42501'; end if;
  if a.id is null or a.status in ('unavailable','disposed','on_loan') then raise exception 'Asset is unavailable.' using errcode='23514'; end if;
  insert into public.reservations(request_id,requester_id,office_id,asset_id,starts_at,ends_at,purpose)
  values(p_request_id,auth.uid(),a.office_id,a.id,p_starts_at,p_ends_at,btrim(p_purpose)) returning id into reservation_id;
  perform public.write_audit('reservation.create','reservation',reservation_id,'{}'); return reservation_id;
end; $$;

create function public.release_loan(p_request_id uuid,p_asset_ids uuid[],p_due_at timestamptz)
returns uuid language plpgsql security definer set search_path = '' as $$
declare r public.requests; loan_id uuid; asset_id uuid; a public.assets;
begin
  select * into r from public.requests where id=p_request_id for update;
  if r.id is null or r.request_type<>'borrow' or r.status not in ('approved','partially_approved') then raise exception 'Request is not ready for release.' using errcode='23514'; end if;
  if not public.can_manage_office_workflow(r.office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  insert into public.loans(request_id,borrower_id,due_at) values(r.id,r.requester_id,p_due_at) returning id into loan_id;
  foreach asset_id in array p_asset_ids loop
    select * into a from public.assets where id=asset_id and office_id=r.office_id for update;
    if a.id is null or a.status<>'available' then raise exception 'Asset is unavailable.' using errcode='23514'; end if;
    insert into public.loan_assets(loan_id,asset_id,condition_at_release) values(loan_id,a.id,a.condition);
    update public.assets set status='on_loan' where id=a.id;
  end loop;
  update public.requests set status='completed' where id=r.id;
  perform public.write_audit('loan.release','loan',loan_id,jsonb_build_object('request_id',r.id)); return loan_id;
end; $$;

create function public.return_loan_asset(p_loan_asset_id uuid,p_condition public.asset_condition)
returns void language plpgsql security definer set search_path = '' as $$
declare la public.loan_assets; l public.loans; a public.assets;
begin
  select * into la from public.loan_assets where id=p_loan_asset_id for update;
  select * into l from public.loans where id=la.loan_id;
  select * into a from public.assets where id=la.asset_id for update;
  if la.id is null or la.returned_at is not null then raise exception 'Asset was already returned or not found.' using errcode='23514'; end if;
  if not public.can_manage_office_workflow(a.office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  update public.loan_assets set returned_at=now(),received_by=auth.uid(),condition_at_return=p_condition where id=la.id;
  update public.assets set condition=p_condition,status=case when p_condition in ('good','fair') then 'available'::public.asset_status else 'unavailable'::public.asset_status end where id=a.id;
  update public.loans set status=case when exists(select 1 from public.loan_assets where loan_id=l.id and returned_at is null) then 'partially_returned'::public.loan_status else 'returned'::public.loan_status end where id=l.id;
  perform public.write_audit('loan.return','loan',l.id,jsonb_build_object('asset_id',a.id,'condition',p_condition));
end; $$;

create function public.receive_purchase_item(p_purchase_order_item_id uuid,p_received numeric,p_accepted numeric,p_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare poi public.purchase_order_items; po public.purchase_orders; pr public.purchase_requests; receipt_id uuid; movement uuid; balance numeric;
begin
  select * into poi from public.purchase_order_items where id=p_purchase_order_item_id for update;
  select * into po from public.purchase_orders where id=poi.purchase_order_id for update;
  select * into pr from public.purchase_requests where id=po.purchase_request_id;
  if not public.can_manage_office_workflow(pr.office_id) then raise exception 'Not authorized.' using errcode='42501'; end if;
  if p_received<=0 or p_accepted<0 or p_accepted>p_received or poi.received_quantity+p_accepted>poi.ordered_quantity then raise exception 'Invalid receipt quantities.' using errcode='23514'; end if;
  insert into public.goods_receipts(purchase_order_id,notes) values(po.id,p_notes) returning id into receipt_id;
  insert into public.goods_receipt_items(goods_receipt_id,purchase_order_item_id,received_quantity,accepted_quantity,discrepancy_notes) values(receipt_id,poi.id,p_received,p_accepted,p_notes);
  update public.purchase_order_items set received_quantity=received_quantity+p_accepted where id=poi.id;
  if p_accepted>0 then select movement_id,quantity_on_hand into movement,balance from public.record_stock_movement(poi.item_id,poi.location_id,'receipt',p_accepted,'Accepted supplier delivery',po.order_number); end if;
  update public.purchase_orders set status=case when exists(select 1 from public.purchase_order_items where purchase_order_id=po.id and received_quantity<ordered_quantity) then 'partially_received'::public.procurement_status else 'received'::public.procurement_status end where id=po.id;
  perform public.write_audit('purchase.receive','purchase_order',po.id,jsonb_build_object('accepted',p_accepted,'received',p_received)); return receipt_id;
end; $$;

-- RLS: requesters see their own records; office staff see their office; procurement is staff-only.
alter table public.assets enable row level security; alter table public.requests enable row level security;
alter table public.request_items enable row level security; alter table public.request_decisions enable row level security;
alter table public.loans enable row level security; alter table public.loan_assets enable row level security;
alter table public.reservations enable row level security; alter table public.incidents enable row level security;
alter table public.suppliers enable row level security; alter table public.purchase_requests enable row level security;
alter table public.purchase_request_items enable row level security; alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security; alter table public.goods_receipts enable row level security;
alter table public.goods_receipt_items enable row level security; alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

grant select on all tables in schema public to authenticated;
grant insert on public.requests,public.request_items,public.reservations,public.incidents to authenticated;
grant insert,update on public.assets,public.suppliers,public.purchase_requests,public.purchase_request_items,public.purchase_orders,public.purchase_order_items to authenticated;
grant update(read_at) on public.notifications to authenticated;

create policy assets_staff on public.assets for all to authenticated using(public.can_view_inventory_office(office_id)) with check(public.can_manage_inventory_office(office_id));
create policy requests_read on public.requests for select to authenticated using(requester_id=auth.uid() or public.can_manage_office_workflow(office_id));
create policy requests_create on public.requests for insert to authenticated with check(requester_id=auth.uid() and public.is_active_user());
create policy request_items_read on public.request_items for select to authenticated using(exists(select 1 from public.requests r where r.id=request_id and (r.requester_id=auth.uid() or public.can_manage_office_workflow(r.office_id))));
create policy request_items_create on public.request_items for insert to authenticated with check(exists(select 1 from public.requests r join public.items i on i.id=item_id where r.id=request_id and r.requester_id=auth.uid() and r.office_id=i.office_id and r.status in ('draft','submitted')));
create policy decisions_read on public.request_decisions for select to authenticated using(exists(select 1 from public.requests r where r.id=request_id and (r.requester_id=auth.uid() or public.can_manage_office_workflow(r.office_id))));
create policy loans_read on public.loans for select to authenticated using(borrower_id=auth.uid() or exists(select 1 from public.requests r where r.id=request_id and public.can_manage_office_workflow(r.office_id)));
create policy loan_assets_read on public.loan_assets for select to authenticated using(exists(select 1 from public.loans l join public.requests r on r.id=l.request_id where l.id=loan_id and (l.borrower_id=auth.uid() or public.can_manage_office_workflow(r.office_id))));
create policy reservations_read on public.reservations for select to authenticated using(requester_id=auth.uid() or public.can_manage_office_workflow(office_id));
create policy reservations_create on public.reservations for insert to authenticated with check(requester_id=auth.uid() and public.is_active_user());
create policy incidents_read on public.incidents for select to authenticated using(reported_by=auth.uid() or public.can_manage_office_workflow(office_id));
create policy incidents_create on public.incidents for insert to authenticated with check(reported_by=auth.uid() and public.is_active_user());
create policy suppliers_staff on public.suppliers for all to authenticated using(public.is_admin() or exists(select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role in ('office_staff','office_head'))) with check(public.is_admin() or exists(select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role in ('office_staff','office_head')));
create policy purchase_requests_staff on public.purchase_requests for all to authenticated using(requested_by=auth.uid() or public.can_manage_office_workflow(office_id)) with check(public.can_manage_office_workflow(office_id));
create policy purchase_request_items_staff on public.purchase_request_items for all to authenticated using(exists(select 1 from public.purchase_requests pr where pr.id=purchase_request_id and public.can_manage_office_workflow(pr.office_id))) with check(exists(select 1 from public.purchase_requests pr join public.items i on i.id=item_id where pr.id=purchase_request_id and pr.office_id=i.office_id and public.can_manage_office_workflow(pr.office_id)));
create policy purchase_orders_staff on public.purchase_orders for all to authenticated using(exists(select 1 from public.purchase_requests pr where pr.id=purchase_request_id and public.can_manage_office_workflow(pr.office_id))) with check(exists(select 1 from public.purchase_requests pr where pr.id=purchase_request_id and public.can_manage_office_workflow(pr.office_id)));
create policy purchase_order_items_staff on public.purchase_order_items for all to authenticated using(exists(select 1 from public.purchase_orders po join public.purchase_requests pr on pr.id=po.purchase_request_id where po.id=purchase_order_id and public.can_manage_office_workflow(pr.office_id))) with check(exists(select 1 from public.purchase_orders po join public.purchase_requests pr on pr.id=po.purchase_request_id join public.items i on i.id=item_id join public.locations l on l.id=location_id where po.id=purchase_order_id and i.office_id=pr.office_id and l.office_id=pr.office_id and public.can_manage_office_workflow(pr.office_id)));
create policy receipts_staff on public.goods_receipts for select to authenticated using(exists(select 1 from public.purchase_orders po join public.purchase_requests pr on pr.id=po.purchase_request_id where po.id=purchase_order_id and public.can_manage_office_workflow(pr.office_id)));
create policy receipt_items_staff on public.goods_receipt_items for select to authenticated using(exists(select 1 from public.goods_receipts gr join public.purchase_orders po on po.id=gr.purchase_order_id join public.purchase_requests pr on pr.id=po.purchase_request_id where gr.id=goods_receipt_id and public.can_manage_office_workflow(pr.office_id)));
create policy notifications_owner on public.notifications for select to authenticated using(user_id=auth.uid());
create policy notifications_mark_read on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy audit_staff_read on public.audit_logs for select to authenticated using(public.is_admin() or actor_id=auth.uid());

revoke all on function public.write_audit(text,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.decide_request(uuid,public.decision_type,text,jsonb), public.issue_request_item(uuid,uuid,numeric), public.create_reservation(uuid,timestamptz,timestamptz,text,uuid), public.release_loan(uuid,uuid[],timestamptz), public.return_loan_asset(uuid,public.asset_condition), public.receive_purchase_item(uuid,numeric,numeric,text) to authenticated;
