-- Seed Initial Offices and Test Users for SISS

-- 1. Ensure the three school offices exist
insert into public.offices (name)
values
  ('Property Custodian Office'),
  ('Hospitality Management Lab Office'),
  ('Science Laboratory Office')
on conflict (name) do nothing;

-- 2. Seed Test Users (Admin, Non-Working Personnel, Student)
DO $$
DECLARE
  v_admin_id uuid := 'a0000000-0000-0000-0000-000000000001';
  v_staff_id uuid := 'a0000000-0000-0000-0000-000000000002';
  v_student_id uuid := 'a0000000-0000-0000-0000-000000000003';
BEGIN
  -- 2.1 Admin User: admin@school.edu / Password123!
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
  ) VALUES (
    v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@school.edu', crypt('Password123!', gen_salt('bf')), now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}', '{"full_name":"System Administrator","school_id":"ADM-2026-001"}',
    false, now(), now()
  ) ON CONFLICT (id) DO NOTHING;

  -- 2.2 Non-Working Personnel: staff@school.edu / Password123!
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
  ) VALUES (
    v_staff_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'staff@school.edu', crypt('Password123!', gen_salt('bf')), now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}', '{"full_name":"Non-Working Personnel","school_id":"NWP-2026-002"}',
    false, now(), now()
  ) ON CONFLICT (id) DO NOTHING;

  -- 2.3 Student User: student@school.edu / Password123!
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
  ) VALUES (
    v_student_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'student@school.edu', crypt('Password123!', gen_salt('bf')), now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}', '{"full_name":"Juan Dela Cruz","school_id":"STD-2026-003"}',
    false, now(), now()
  ) ON CONFLICT (id) DO NOTHING;

  -- Ensure identities exist
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id)
  VALUES 
    (gen_random_uuid(), v_admin_id, jsonb_build_object('sub', v_admin_id, 'email', 'admin@school.edu'), 'email', now(), now(), now(), v_admin_id),
    (gen_random_uuid(), v_staff_id, jsonb_build_object('sub', v_staff_id, 'email', 'staff@school.edu'), 'email', now(), now(), now(), v_staff_id),
    (gen_random_uuid(), v_student_id, jsonb_build_object('sub', v_student_id, 'email', 'student@school.edu'), 'email', now(), now(), now(), v_student_id)
  ON CONFLICT DO NOTHING;

  -- Ensure profiles exist and are active
  INSERT INTO public.profiles (id, full_name, school_id, email, account_status, office_id)
  VALUES
    (v_admin_id, 'System Administrator', 'ADM-2026-001', 'admin@school.edu', 'active', null),
    (v_staff_id, 'Non-Working Personnel', 'NWP-2026-002', 'staff@school.edu', 'active', null),
    (v_student_id, 'Juan Dela Cruz', 'STD-2026-003', 'student@school.edu', 'active', null)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    school_id = EXCLUDED.school_id,
    email = EXCLUDED.email,
    account_status = 'active',
    office_id = EXCLUDED.office_id;

  -- Assign user roles
  INSERT INTO public.user_roles (user_id, role, office_id)
  VALUES
    (v_admin_id, 'admin', null),
    (v_staff_id, 'non_teaching', null),
    (v_student_id, 'student', null)
  ON CONFLICT DO NOTHING;
END $$;
