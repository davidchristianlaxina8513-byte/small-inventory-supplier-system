begin;

select plan(23);

-- Principals are created as the database owner; RLS is exercised via role switching.
insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'inv-staff-a@test.local', now(), now(), now(), '{"full_name":"Inventory Staff A"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'inv-staff-b@test.local', now(), now(), now(), '{"full_name":"Inventory Staff B"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'inv-head-a@test.local', now(), now(), now(), '{"full_name":"Inventory Head A"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-8444-444444444444', 'authenticated', 'authenticated', 'inv-admin@test.local', now(), now(), now(), '{"full_name":"Inventory Admin"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-4555-8555-555555555555', 'authenticated', 'authenticated', 'inv-student@test.local', now(), now(), now(), '{"full_name":"Inventory Student"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'inv-pending@test.local', now(), now(), now(), '{"full_name":"Inventory Pending"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '77777777-7777-4777-8777-777777777777', 'authenticated', 'authenticated', 'inv-suspended@test.local', now(), now(), now(), '{"full_name":"Inventory Suspended"}'::jsonb);

set local request.jwt.claims = '{}';

update public.profiles
set account_status = 'active'
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
);

update public.profiles
set account_status = 'suspended'
where id = '77777777-7777-4777-8777-777777777777';

insert into public.user_roles (user_id, role, office_id)
values
  ('11111111-1111-4111-8111-111111111111', 'office_staff', (select id from public.offices where name = 'Property Custodian Office')),
  ('22222222-2222-4222-8222-222222222222', 'office_staff', (select id from public.offices where name = 'Science Laboratory Office')),
  ('33333333-3333-4333-8333-333333333333', 'office_head', (select id from public.offices where name = 'Property Custodian Office')),
  ('44444444-4444-4444-8444-444444444444', 'admin', null),
  ('55555555-5555-4555-8555-555555555555', 'student', null),
  ('66666666-6666-4666-8666-666666666666', 'office_staff', (select id from public.offices where name = 'Property Custodian Office')),
  ('77777777-7777-4777-8777-777777777777', 'office_staff', (select id from public.offices where name = 'Science Laboratory Office'));

insert into public.categories (id, office_id, name)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', (select id from public.offices where name = 'Property Custodian Office'), 'Property Supplies'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', (select id from public.offices where name = 'Science Laboratory Office'), 'Science Supplies'),
  ('99999999-9999-4999-8999-999999999999', (select id from public.offices where name = 'Hospitality Management Lab Office'), 'Hospitality Supplies');

insert into public.locations (id, office_id, name)
values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', (select id from public.offices where name = 'Property Custodian Office'), 'Property Main Storage'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', (select id from public.offices where name = 'Science Laboratory Office'), 'Science Main Storage');

insert into public.items (id, office_id, category_id, item_code, name, unit_of_measure, tracking_type)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', (select id from public.offices where name = 'Property Custodian Office'), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'PROP-001', 'Property Marker', 'piece', 'quantity_stock'),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', (select id from public.offices where name = 'Science Laboratory Office'), 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'SCI-001', 'Science Gloves', 'pair', 'quantity_stock');

select ok((select relrowsecurity from pg_class where oid = 'public.categories'::regclass), 'categories has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.locations'::regclass), 'locations has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.items'::regclass), 'items has RLS enabled');

select ok(not has_table_privilege('anon', 'public.categories', 'select'), 'anon cannot select categories');
select ok(not has_table_privilege('anon', 'public.items', 'select'), 'anon cannot select items');
select ok(has_table_privilege('authenticated', 'public.items', 'select'), 'authenticated can select items');
select ok(not has_table_privilege('authenticated', 'public.items', 'delete'), 'authenticated cannot delete items');

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select results_eq(
  'select id from public.categories order by id',
  array['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']::uuid[],
  'office staff sees only their office categories'
);

select results_eq(
  'select id from public.items order by id',
  array['eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee']::uuid[],
  'office staff sees only their office items'
);

select lives_ok(
  $$insert into public.categories (office_id, name)
    values ((select id from public.offices where name = 'Property Custodian Office'), 'New Property Category')$$,
  'office staff can create a category in their office'
);

select throws_ok(
  $$insert into public.categories (office_id, name)
    values ((select id from public.offices where name = 'Science Laboratory Office'), 'Forbidden Category')$$,
  '42501',
  null,
  'office staff cannot create a category in another office'
);

select lives_ok(
  $$update public.items set name = 'Tampered Science Item'
    where id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'$$,
  'cross-office item update is filtered by RLS'
);

reset role;

select is(
  (select name from public.items where id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'),
  'Science Gloves',
  'cross-office item update did not change the row'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select throws_ok(
  $$insert into public.items (office_id, category_id, item_code, name, unit_of_measure, tracking_type)
    values (
      (select id from public.offices where name = 'Property Custodian Office'),
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'PROP-XOFFICE', 'Cross Office Category', 'piece', 'quantity_stock'
    )$$,
  '23503',
  null,
  'an item cannot use a category from another office'
);

select throws_ok(
  $$insert into public.items (office_id, category_id, item_code, name, unit_of_measure, tracking_type)
    values (
      (select id from public.offices where name = 'Property Custodian Office'),
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'PROP-001', 'Duplicate Code', 'piece', 'quantity_stock'
    )$$,
  '23505',
  null,
  'duplicate item codes are rejected within an office'
);

select throws_ok(
  $$update public.items set office_id = (select id from public.offices where name = 'Science Laboratory Office')
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  '42501',
  null,
  'office_id cannot be changed through the authenticated API'
);

reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

select lives_ok(
  $$insert into public.items (office_id, category_id, item_code, name, unit_of_measure, tracking_type)
    values (
      (select id from public.offices where name = 'Property Custodian Office'),
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'PROP-HEAD-001', 'Head Created Item', 'piece', 'quantity_stock'
    )$$,
  'office head can create an item in their office'
);

reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}';

select is(
  (select count(*) from public.items where item_code in ('PROP-001', 'SCI-001', 'PROP-HEAD-001')),
  3::bigint,
  'admin sees items from every office'
);

select lives_ok(
  $$insert into public.items (office_id, category_id, item_code, name, unit_of_measure, tracking_type)
    values (
      (select id from public.offices where name = 'Hospitality Management Lab Office'),
      '99999999-9999-4999-8999-999999999999',
      'HOSP-001', 'Admin Item', 'piece', 'quantity_stock'
    )$$,
  'admin can create an item in any office'
);

reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}';

select is((select count(*) from public.items), 0::bigint, 'student cannot read inventory items');

select throws_ok(
  $$insert into public.items (office_id, category_id, item_code, name, unit_of_measure, tracking_type)
    values (
      (select id from public.offices where name = 'Property Custodian Office'),
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'PROP-STUDENT', 'Student Item', 'piece', 'quantity_stock'
    )$$,
  '42501',
  null,
  'student cannot create inventory items'
);

reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"66666666-6666-4666-8666-666666666666","role":"authenticated"}';

select is((select count(*) from public.items), 0::bigint, 'pending user cannot read inventory items');

reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}';

select is((select count(*) from public.items), 0::bigint, 'suspended user cannot read inventory items');

reset role;

select * from finish();
rollback;
