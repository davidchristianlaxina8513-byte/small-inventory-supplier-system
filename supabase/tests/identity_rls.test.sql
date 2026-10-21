begin;

select plan(33);

-- Test principals are created as the database owner; RLS is exercised via role switching.
insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'student@test.local', now(), now(), now(), '{"full_name":"Student One"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'admin@test.local', now(), now(), now(), '{"full_name":"Admin One"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'pending@test.local', now(), now(), now(), '{"full_name":"Pending One"}'::jsonb);

set local request.jwt.claims = '{}';

update public.profiles set account_status = 'active' where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
);

insert into public.user_roles (user_id, role) values
  ('11111111-1111-4111-8111-111111111111', 'student'),
  ('22222222-2222-4222-8222-222222222222', 'admin');

select is(
  (select email from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'student@test.local',
  'auth email is mirrored to the profile'
);

update auth.users
set email = 'student.updated@test.local'
where id = '11111111-1111-4111-8111-111111111111';

select is(
  (select email from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'student.updated@test.local',
  'auth email changes sync to the profile'
);

select is((select count(*) from public.offices), 3::bigint, 'three offices are seeded');

select ok((select relrowsecurity from pg_class where oid = 'public.offices'::regclass), 'offices has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.user_roles'::regclass), 'user_roles has RLS enabled');

select ok(not has_table_privilege('anon', 'public.profiles', 'select'), 'anon cannot select profiles');
select ok(has_table_privilege('authenticated', 'public.profiles', 'select'), 'authenticated can select profiles');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'insert'), 'authenticated cannot insert profiles');

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select results_eq(
  'select id from public.profiles order by id',
  array['11111111-1111-4111-8111-111111111111']::uuid[],
  'student sees only their own profile'
);

select results_eq(
  'select role::text from public.user_roles order by role',
  array['student']::text[],
  'student sees only their own role'
);

select is(public.has_role('student'), true, 'active student passes has_role');

select is(
  (select email from public.profiles where id = '22222222-2222-4222-8222-222222222222'),
  null,
  'student cannot read another user email'
);

select throws_ok(
  $$insert into public.user_roles (user_id, role)
    values ('11111111-1111-4111-8111-111111111111', 'admin')$$,
  '42501',
  null,
  'student cannot grant themselves the admin role'
);

select lives_ok(
  $$update public.profiles set account_status = 'suspended'
    where id = '11111111-1111-4111-8111-111111111111'$$,
  'student update statement is filtered by RLS'
);

select is(
  (select account_status::text from public.profiles
    where id = '11111111-1111-4111-8111-111111111111'),
  'active',
  'student cannot change their own account status'
);

select is(public.is_admin(), false, 'student is not an admin');
select is(public.is_active_user(), true, 'active student passes the status check');

reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

select is(public.is_active_user(), false, 'pending user fails the status check');

reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select is(public.is_admin(), true, 'admin role is recognized');

select is(
  (select email from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'student.updated@test.local',
  'admin can read another user email'
);

select throws_ok(
  $$update public.profiles
    set email = 'changed@test.local'
    where id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  null,
  'email cannot be changed through the profile API'
);

select lives_ok(
  $$update public.profiles
    set account_status = 'active'
    where id = '11111111-1111-4111-8111-111111111111'$$,
  'admin can still update allowed profile columns'
);

select throws_ok(
  $$update public.profiles
    set account_status = 'suspended'
    where id = '22222222-2222-4222-8222-222222222222'$$,
  '42501',
  null,
  'admin cannot suspend their own account'
);

select throws_ok(
  $$delete from public.user_roles
    where user_id = '22222222-2222-4222-8222-222222222222'
      and role = 'admin'$$,
  '42501',
  null,
  'last active admin role cannot be deleted'
);

select throws_ok(
  $$update public.user_roles
    set role = 'student'
    where user_id = '22222222-2222-4222-8222-222222222222'
      and role = 'admin'$$,
  '42501',
  null,
  'last active admin role cannot be downgraded'
);

select results_eq(
  $$select id from public.profiles
    where id in (
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333'
    )
    order by id$$,
  array[
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333'
  ]::uuid[],
  'admin sees every test profile'
);

select lives_ok(
  $$insert into public.user_roles (user_id, role, office_id)
    values (
      '33333333-3333-4333-8333-333333333333',
      'office_staff',
      (select id from public.offices where name = 'Science Laboratory Office')
    )$$,
  'admin can assign an office-scoped role'
);

reset role;
set local request.jwt.claims = '{}';

insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-000000000000',
  '44444444-4444-4444-8444-444444444444',
  'authenticated',
  'authenticated',
  'admin2@test.local',
  now(),
  now(),
  now(),
  '{"full_name":"Admin Two"}'::jsonb
);

update public.profiles set account_status = 'active'
where id = '44444444-4444-4444-8444-444444444444';

insert into public.user_roles (user_id, role) values
  ('44444444-4444-4444-8444-444444444444', 'admin');

set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select lives_ok(
  $$delete from public.user_roles
    where user_id = '44444444-4444-4444-8444-444444444444'
      and role = 'admin'$$,
  'an admin can remove another admin when one remains'
);

reset role;
set local request.jwt.claims = '{}';

update public.profiles set account_status = 'suspended'
where id = '22222222-2222-4222-8222-222222222222';

set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select is(public.is_admin(), false, 'suspended admin loses administrator authority');

select is(public.has_role('admin'), false, 'suspended admin fails has_role');

select throws_ok(
  $$insert into public.user_roles (user_id, role)
    values ('33333333-3333-4333-8333-333333333333', 'teacher')$$,
  '42501',
  null,
  'suspended admin cannot assign roles'
);

reset role;

select throws_ok(
  $$insert into public.user_roles (user_id, role)
    values ('33333333-3333-4333-8333-333333333333', 'office_staff')$$,
  '23514',
  null,
  'office-scoped roles require an office'
);

select * from finish();
rollback;
