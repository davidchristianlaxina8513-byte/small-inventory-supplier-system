begin;
select plan(31);

insert into auth.users(instance_id,id,aud,role,email,email_confirmed_at,created_at,updated_at,raw_user_meta_data) values
('00000000-0000-0000-0000-000000000000','81000000-0000-4000-8000-000000000001','authenticated','authenticated','workflow-requester@test.local',now(),now(),now(),'{"full_name":"Workflow Requester"}'),
('00000000-0000-0000-0000-000000000000','81000000-0000-4000-8000-000000000002','authenticated','authenticated','workflow-staff@test.local',now(),now(),now(),'{"full_name":"Workflow Staff"}'),
('00000000-0000-0000-0000-000000000000','81000000-0000-4000-8000-000000000003','authenticated','authenticated','workflow-head@test.local',now(),now(),now(),'{"full_name":"Workflow Head"}');

update public.profiles set account_status='active' where id::text like '81000000-0000-4000-8000-00000000000%';
insert into public.user_roles(user_id,role,office_id) values
('81000000-0000-4000-8000-000000000001','student',null),
('81000000-0000-4000-8000-000000000002','office_staff',(select id from public.offices where name='Property Custodian Office')),
('81000000-0000-4000-8000-000000000003','office_head',(select id from public.offices where name='Property Custodian Office'));

insert into public.categories(id,office_id,name) values('82000000-0000-4000-8000-000000000001',(select id from public.offices where name='Property Custodian Office'),'Workflow Test Category');
insert into public.locations(id,office_id,name) values('82000000-0000-4000-8000-000000000002',(select id from public.offices where name='Property Custodian Office'),'Workflow Test Location');
insert into public.locations(id,office_id,name) values('82000000-0000-4000-8000-000000000006',(select id from public.offices where name='Property Custodian Office'),'Workflow Destination');
insert into public.items(id,office_id,category_id,item_code,name,unit_of_measure,tracking_type) values
('82000000-0000-4000-8000-000000000003',(select id from public.offices where name='Property Custodian Office'),'82000000-0000-4000-8000-000000000001','WF-QTY','Workflow Stock','piece','quantity_stock'),
('82000000-0000-4000-8000-000000000004',(select id from public.offices where name='Property Custodian Office'),'82000000-0000-4000-8000-000000000001','WF-ASSET','Workflow Asset','piece','serialized_asset');
insert into public.assets(id,office_id,item_id,location_id,asset_code) values('82000000-0000-4000-8000-000000000005',(select id from public.offices where name='Property Custodian Office'),'82000000-0000-4000-8000-000000000004','82000000-0000-4000-8000-000000000002','WF-A-001');

select ok((select relrowsecurity from pg_class where oid='public.requests'::regclass),'requests has RLS');
select ok((select relrowsecurity from pg_class where oid='public.audit_logs'::regclass),'audit logs have RLS');
select ok(not has_table_privilege('authenticated','public.audit_logs','update'),'audit logs cannot be updated by authenticated users');

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000003","role":"authenticated"}';
select lives_ok($$select public.record_stock_movement('82000000-0000-4000-8000-000000000003','82000000-0000-4000-8000-000000000002','receipt',10,'test opening balance','WF-OPEN')$$,'head can add opening stock');
reset role;

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000001","role":"authenticated"}';
select lives_ok($$select public.create_request((select id from public.offices where name='Property Custodian Office'),'consumable','Workflow test request',null,'82000000-0000-4000-8000-000000000003',4,null)$$,'active requester can submit a request');
select is((select count(*) from public.requests where requester_id=auth.uid()),1::bigint,'requester can read own request');
select is((select count(*) from public.requests where requester_id<>auth.uid()),0::bigint,'requester cannot read other requests');
reset role;

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000003","role":"authenticated"}';
select lives_ok($$select public.decide_request((select id from public.requests where purpose='Workflow test request'),'approve','Approved for test','{}')$$,'office head can approve request');
select is((select status::text from public.requests where purpose='Workflow test request'),'approved','approval changes request status');
reset role;

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000002","role":"authenticated"}';
select lives_ok($$select public.issue_request_item((select ri.id from public.request_items ri join public.requests r on r.id=ri.request_id where r.purpose='Workflow test request'),'82000000-0000-4000-8000-000000000002',3)$$,'staff can issue approved quantity');
select is((select quantity_on_hand from public.inventory_balances where item_id='82000000-0000-4000-8000-000000000003'),7::numeric,'actual issued quantity reduces stock');
select throws_ok($$select public.issue_request_item((select ri.id from public.request_items ri join public.requests r on r.id=ri.request_id where r.purpose='Workflow test request'),'82000000-0000-4000-8000-000000000002',2)$$,'23514',null,'issue beyond approved quantity is rejected');
reset role;

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000001","role":"authenticated"}';
select lives_ok($$select public.create_reservation('82000000-0000-4000-8000-000000000005',now()+interval '1 day',now()+interval '2 days','Workflow reservation')$$,'requester can reserve available asset');
select throws_ok($$select public.create_reservation('82000000-0000-4000-8000-000000000005',now()+interval '36 hours',now()+interval '60 hours','Conflicting reservation')$$,'23P01',null,'overlapping reservation is rejected');
select is((select count(*) from public.get_reservable_assets()),1::bigint,'active requester can discover safe reservable assets');
select lives_ok($$select public.create_request((select id from public.offices where name='Property Custodian Office'),'borrow','Workflow borrowing',null,'82000000-0000-4000-8000-000000000004',1,null)$$,'requester can submit a borrowing request');
reset role;

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000003","role":"authenticated"}';
select lives_ok($$select public.decide_request((select id from public.requests where purpose='Workflow borrowing'),'approve','Approved borrowing','{}')$$,'head can approve borrowing request');
reset role;

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000002","role":"authenticated"}';
select lives_ok($$select public.release_loan((select id from public.requests where purpose='Workflow borrowing'),array['82000000-0000-4000-8000-000000000005']::uuid[],now()+interval '5 days')$$,'staff can release the matching approved asset');
select lives_ok($$select public.return_loan_asset((select la.id from public.loan_assets la join public.loans l on l.id=la.loan_id join public.requests r on r.id=l.request_id where r.purpose='Workflow borrowing'),'damaged')$$,'staff can record a damaged return');
select is((select status::text from public.assets where id='82000000-0000-4000-8000-000000000005'),'unavailable','damaged return keeps the asset unavailable');
reset role;

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000001","role":"authenticated"}';
select lives_ok($$insert into public.incidents(office_id,item_id,asset_id,incident_type,occurred_at,description) values((select id from public.offices where name='Property Custodian Office'),'82000000-0000-4000-8000-000000000004','82000000-0000-4000-8000-000000000005','damage',now(),'Damaged during workflow test')$$,'requester can report an incident');
reset role;

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000002","role":"authenticated"}';
select lives_ok($$select public.resolve_incident((select id from public.incidents where description='Damaged during workflow test'),'Inspected and repaired','good')$$,'staff can resolve an incident');
select is((select status::text from public.incidents where description='Damaged during workflow test'),'resolved','incident resolution is preserved');
select is((select status::text from public.assets where id='82000000-0000-4000-8000-000000000005'),'available','resolved good asset becomes available');
reset role;

insert into public.suppliers(id,name) values('83000000-0000-4000-8000-000000000001','Workflow Fictional Supplier');
insert into public.purchase_requests(id,office_id,requested_by,justification,status) values('83000000-0000-4000-8000-000000000002',(select id from public.offices where name='Property Custodian Office'),'81000000-0000-4000-8000-000000000003','Workflow purchase','ordered');
insert into public.purchase_orders(id,purchase_request_id,supplier_id,ordered_by) values('83000000-0000-4000-8000-000000000003','83000000-0000-4000-8000-000000000002','83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000003');
insert into public.purchase_order_items(id,purchase_order_id,item_id,location_id,ordered_quantity,unit_cost) values('83000000-0000-4000-8000-000000000004','83000000-0000-4000-8000-000000000003','82000000-0000-4000-8000-000000000003','82000000-0000-4000-8000-000000000002',5,10);

set local role authenticated;
set local request.jwt.claims='{"sub":"81000000-0000-4000-8000-000000000002","role":"authenticated"}';
select lives_ok($$select public.receive_purchase_item('83000000-0000-4000-8000-000000000004',5,4,'One rejected')$$,'staff can receive a partial delivery');
select is((select quantity_on_hand from public.inventory_balances where item_id='82000000-0000-4000-8000-000000000003'),11::numeric,'stock increases by accepted quantity only');
select is((select rejected_quantity from public.goods_receipt_items where purchase_order_item_id='83000000-0000-4000-8000-000000000004'),1::numeric,'receipt records rejected quantity');
select lives_ok($$select public.transfer_stock('82000000-0000-4000-8000-000000000003','82000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000006',2,'Move to destination')$$,'staff can transfer stock atomically');
select is((select quantity_on_hand from public.inventory_balances where item_id='82000000-0000-4000-8000-000000000003' and location_id='82000000-0000-4000-8000-000000000002'),9::numeric,'transfer reduces the source balance');
select is((select quantity_on_hand from public.inventory_balances where item_id='82000000-0000-4000-8000-000000000003' and location_id='82000000-0000-4000-8000-000000000006'),2::numeric,'transfer increases the destination balance');
reset role;
select ok((select count(*) from public.audit_logs where action in ('request.create','request.approve','request.issue','reservation.create','purchase.receive'))>=5,'significant actions are audited');

select * from finish();
rollback;
