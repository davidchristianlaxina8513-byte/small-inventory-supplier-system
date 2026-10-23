begin;

select plan(47);

insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'ledger-staff-a@test.local', now(), now(), now(), '{"full_name":"Ledger Staff A"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'ledger-staff-b@test.local', now(), now(), now(), '{"full_name":"Ledger Staff B"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'ledger-head-a@test.local', now(), now(), now(), '{"full_name":"Ledger Head A"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-8444-444444444444', 'authenticated', 'authenticated', 'ledger-admin@test.local', now(), now(), now(), '{"full_name":"Ledger Admin"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-4555-8555-555555555555', 'authenticated', 'authenticated', 'ledger-pending@test.local', now(), now(), now(), '{"full_name":"Ledger Pending"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'ledger-suspended@test.local', now(), now(), now(), '{"full_name":"Ledger Suspended"}'::jsonb);

set local request.jwt.claims = '{}';

update public.profiles
set account_status = 'active'
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444'
);

update public.profiles
set account_status = 'suspended'
where id = '66666666-6666-4666-8666-666666666666';

insert into public.user_roles (user_id, role, office_id)
values
  ('11111111-1111-4111-8111-111111111111', 'office_staff', (select id from public.offices where name = 'Property Custodian Office')),
  ('22222222-2222-4222-8222-222222222222', 'office_staff', (select id from public.offices where name = 'Science Laboratory Office')),
  ('33333333-3333-4333-8333-333333333333', 'office_head', (select id from public.offices where name = 'Property Custodian Office')),
  ('44444444-4444-4444-8444-444444444444', 'admin', null),
  ('55555555-5555-4555-8555-555555555555', 'office_staff', (select id from public.offices where name = 'Property Custodian Office')),
  ('66666666-6666-4666-8666-666666666666', 'office_staff', (select id from public.offices where name = 'Science Laboratory Office'));

insert into public.categories (id, office_id, name)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', (select id from public.offices where name = 'Property Custodian Office'), 'Ledger Property Supplies'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', (select id from public.offices where name = 'Science Laboratory Office'), 'Ledger Science Supplies');

insert into public.locations (id, office_id, name)
values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', (select id from public.offices where name = 'Property Custodian Office'), 'Ledger Property Storage'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', (select id from public.offices where name = 'Science Laboratory Office'), 'Ledger Science Storage');

insert into public.items (id, office_id, category_id, item_code, name, unit_of_measure, tracking_type)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', (select id from public.offices where name = 'Property Custodian Office'), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'LEDGER-PROP-001', 'Ledger Property Item', 'piece', 'quantity_stock'),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', (select id from public.offices where name = 'Science Laboratory Office'), 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'LEDGER-SCI-001', 'Ledger Science Item', 'piece', 'quantity_stock');

select ok((select relrowsecurity from pg_class where oid = 'public.inventory_balances'::regclass), 'inventory_balances has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.stock_movements'::regclass), 'stock_movements has RLS enabled');

select ok(not has_table_privilege('anon', 'public.inventory_balances', 'select'), 'anon cannot select balances');
select ok(not has_table_privilege('anon', 'public.stock_movements', 'select'), 'anon cannot select movements');
select ok(not has_table_privilege('authenticated', 'public.inventory_balances', 'insert'), 'authenticated cannot insert balances');
select ok(not has_table_privilege('authenticated', 'public.inventory_balances', 'update'), 'authenticated cannot update balances');
select ok(not has_table_privilege('authenticated', 'public.stock_movements', 'insert'), 'authenticated cannot insert movements');
select ok(not has_table_privilege('authenticated', 'public.stock_movements', 'update'), 'authenticated cannot update movements');
select ok(not has_table_privilege('authenticated', 'public.stock_movements', 'delete'), 'authenticated cannot delete movements');

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select lives_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'receipt', 10, 'Initial stock', 'DR-1001'
    )$$,
  'office staff can record a receipt'
);

select is(
  (select quantity_on_hand from public.inventory_balances
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
      and location_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  10::numeric,
  'receipt updates the balance'
);

select is(
  (select performed_by from public.stock_movements
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    order by created_at, id limit 1),
  '11111111-1111-4111-8111-111111111111'::uuid,
  'movement records the authenticated actor'
);

select lives_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'issue', 4, 'Office issue', 'REQ-2001'
    )$$,
  'office staff can record an issue'
);

select is(
  (select quantity_on_hand from public.inventory_balances
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
      and location_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  6::numeric,
  'issue subtracts from the balance'
);

select throws_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'receipt', 0, 'Zero quantity', null
    )$$,
  '23514',
  null,
  'zero quantity is rejected'
);

select throws_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'receipt', -1, 'Negative quantity', null
    )$$,
  '23514',
  null,
  'negative quantity is rejected'
);

select throws_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'issue', 100, 'Over issue', null
    )$$,
  '23514',
  null,
  'issue beyond the balance is rejected'
);

select is(
  (select quantity_on_hand from public.inventory_balances
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
      and location_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  6::numeric,
  'failed issue leaves the balance unchanged'
);

select is(
  (select count(*) from public.stock_movements
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  2::bigint,
  'failed issue leaves the movement ledger unchanged'
);

select throws_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'adjustment_in', 3, 'Staff adjustment attempt', null
    )$$,
  '42501',
  null,
  'office staff cannot record adjustment_in'
);

select throws_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'adjustment_out', 2, 'Staff adjustment attempt', null
    )$$,
  '42501',
  null,
  'office staff cannot record adjustment_out'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

select lives_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'adjustment_in', 3, 'Approved count correction', 'ADJ-3001'
    )$$,
  'office head can record adjustment_in'
);

select is(
  (select quantity_on_hand from public.inventory_balances
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
      and location_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  9::numeric,
  'adjustment_in adds to the balance'
);

select lives_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'adjustment_out', 2, 'Approved count correction', 'ADJ-3002'
    )$$,
  'office head can record adjustment_out'
);

select is(
  (select quantity_on_hand from public.inventory_balances
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
      and location_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  7::numeric,
  'adjustment_out subtracts from the balance'
);

select throws_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'adjustment_in', 1, '   ', null
    )$$,
  '23514',
  null,
  'adjustment requires a meaningful reason'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select throws_ok(
  $$select * from public.record_stock_movement(
      'ffffffff-ffff-4fff-8fff-ffffffffffff',
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      'receipt', 1, 'Cross-office attempt', null
    )$$,
  '42501',
  null,
  'office staff cannot record movements for another office'
);

select throws_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      'receipt', 1, 'Mismatched location', null
    )$$,
  '23514',
  null,
  'a movement cannot combine an item and location from different offices'
);

select throws_ok(
  $$insert into public.inventory_balances (office_id, item_id, location_id, quantity_on_hand)
    values ((select id from public.offices where name = 'Property Custodian Office'),
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 1)$$,
  '42501',
  null,
  'authenticated users cannot insert balances directly'
);

select throws_ok(
  $$update public.inventory_balances set quantity_on_hand = 1
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  '42501',
  null,
  'authenticated users cannot update balances directly'
);

select throws_ok(
  $$insert into public.stock_movements (office_id, item_id, location_id, movement_type, quantity, reason, performed_by)
    values ((select id from public.offices where name = 'Property Custodian Office'),
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'receipt', 1, 'Direct insert',
      '11111111-1111-4111-8111-111111111111')$$,
  '42501',
  null,
  'authenticated users cannot insert movements directly'
);

select throws_ok(
  $$update public.stock_movements set reason = 'Changed'$$,
  '42501',
  null,
  'authenticated users cannot update movement history'
);

select throws_ok(
  $$delete from public.stock_movements$$,
  '42501',
  null,
  'authenticated users cannot delete movement history'
);

reset role;
set local request.jwt.claims = '{}';

select throws_ok(
  $$update public.stock_movements set reason = 'Changed by owner'$$,
  '42501',
  null,
  'movement history is append-only even for direct SQL'
);

select throws_ok(
  $$delete from public.stock_movements$$,
  '42501',
  null,
  'movement history cannot be deleted even by direct SQL'
);

select throws_ok(
  $$update public.inventory_balances set quantity_on_hand = -1
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  '23514',
  null,
  'negative balances are impossible'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}';

select throws_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'receipt', 1, 'Pending attempt', null
    )$$,
  '42501',
  null,
  'pending users cannot record movements'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}';

select throws_ok(
  $$select * from public.record_stock_movement(
      'ffffffff-ffff-4fff-8fff-ffffffffffff',
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      'receipt', 1, 'Suspended attempt', null
    )$$,
  '42501',
  null,
  'suspended users cannot record movements'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}';

select lives_ok(
  $$select * from public.record_stock_movement(
      'ffffffff-ffff-4fff-8fff-ffffffffffff',
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      'receipt', 5, 'Admin receipt', 'DR-9001'
    )$$,
  'admin can record a movement in any office'
);

select is(
  (select quantity_on_hand from public.inventory_balances
    where item_id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'
      and location_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
  5::numeric,
  'admin receipt updates the other office balance'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is(
  (select sum(case
      when movement_type in ('receipt', 'adjustment_in') then quantity
      else -quantity
    end)
    from public.stock_movements
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
      and location_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  (select quantity_on_hand from public.inventory_balances
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
      and location_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  'ledger history reconciles with the current balance'
);

reset role;
set local request.jwt.claims = '{}';

select throws_ok(
  $$update public.items set tracking_type = 'serialized_asset'
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  '42501',
  null,
  'tracking_type cannot change after movements exist'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is(
  (select count(*) from public.get_item_movements('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')),
  4::bigint,
  'authorized staff can read item movement history'
);

select is(
  (select performed_by_name from public.get_item_movements('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')
    where movement_type = 'adjustment_in' limit 1),
  'Ledger Head A',
  'movement history includes the actor name'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select throws_ok(
  $$select * from public.get_item_movements('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')$$,
  '42501',
  null,
  'cross-office movement history is denied'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

select lives_ok(
  $$select * from public.record_stock_movement(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'issue', 7, 'Issue entire remaining stock', 'REQ-2002'
    )$$,
  'an issue may consume the exact remaining balance'
);

select is(
  (select quantity_on_hand from public.inventory_balances
    where item_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
      and location_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  0::numeric,
  'exact-balance issue reaches zero without going negative'
);

select * from finish();
rollback;
