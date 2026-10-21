-- Fictional baseline data: the three school offices described in the SISS plan.
insert into public.offices (name)
values
  ('Property Custodian Office'),
  ('Hospitality Management Lab Office'),
  ('Science Laboratory Office')
on conflict (name) do nothing;
