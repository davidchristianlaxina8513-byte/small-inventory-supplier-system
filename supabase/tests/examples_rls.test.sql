begin;
select plan(2);
select ok((select relrowsecurity from pg_class where oid = 'public.examples'::regclass), 'examples has RLS enabled');
select ok((select count(*) >= 1 from pg_indexes where schemaname = 'public' and tablename = 'examples' and indexdef like '%user_id%'), 'RLS policy column is indexed');
select * from finish();
rollback;
