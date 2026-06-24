-- =============================================================
-- NexisX — Seed de DESENVOLVIMENTO
-- Execute APÓS schema.sql e schema_rls.sql, em um projeto de dev.
--
-- ATENÇÃO: este script insere diretamente em auth.users (apenas para ambiente
-- local/dev). NÃO use em produção. Senha de todos os usuários demo: "nexisx123".
--
-- UUIDs fixos para facilitar relações e reexecução idempotente.
-- =============================================================

-- IDs fixos (perfis/usuários)
--   admin        11111111-1111-1111-1111-111111111111
--   responsavel  22222222-2222-2222-2222-222222222222
--   profissional 33333333-3333-3333-3333-333333333333
--   escola       44444444-4444-4444-4444-444444444444

-- -------------------------------------------------------------
-- 1) Usuários de autenticação (a trigger handle_new_user cria os profiles)
-- -------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  ('00000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111','authenticated','authenticated','admin@nexisx.com.br',        crypt('nexisx123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Admin NexisX"}','','','',''),
  ('00000000-0000-0000-0000-000000000000','22222222-2222-2222-2222-222222222222','authenticated','authenticated','responsavel@nexisx.com.br',  crypt('nexisx123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Ana Martins"}','','','',''),
  ('00000000-0000-0000-0000-000000000000','33333333-3333-3333-3333-333333333333','authenticated','authenticated','profissional@nexisx.com.br', crypt('nexisx123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Dra. Carla Nunes"}','','','',''),
  ('00000000-0000-0000-0000-000000000000','44444444-4444-4444-4444-444444444444','authenticated','authenticated','escola@nexisx.com.br',       crypt('nexisx123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Escola Aurora"}','','','','')
on conflict (id) do nothing;

-- Identidades (necessário para login por e-mail em algumas versões do Supabase)
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@nexisx.com.br"}','email', now(), now(), now()),
  (gen_random_uuid(),'22222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','{"sub":"22222222-2222-2222-2222-222222222222","email":"responsavel@nexisx.com.br"}','email', now(), now(), now()),
  (gen_random_uuid(),'33333333-3333-3333-3333-333333333333','33333333-3333-3333-3333-333333333333','{"sub":"33333333-3333-3333-3333-333333333333","email":"profissional@nexisx.com.br"}','email', now(), now(), now()),
  (gen_random_uuid(),'44444444-4444-4444-4444-444444444444','44444444-4444-4444-4444-444444444444','{"sub":"44444444-4444-4444-4444-444444444444","email":"escola@nexisx.com.br"}','email', now(), now(), now())
on conflict do nothing;

-- -------------------------------------------------------------
-- 2) Promover papéis (auth.uid() é null no seed → enforce_role_change permite)
-- -------------------------------------------------------------
update profiles set role = 'admin',        full_name = 'Admin NexisX'    where id = '11111111-1111-1111-1111-111111111111';
update profiles set role = 'responsavel',  full_name = 'Ana Martins'     where id = '22222222-2222-2222-2222-222222222222';
update profiles set role = 'profissional', full_name = 'Dra. Carla Nunes' where id = '33333333-3333-3333-3333-333333333333';
update profiles set role = 'escola',       full_name = 'Escola Aurora'   where id = '44444444-4444-4444-4444-444444444444';

-- -------------------------------------------------------------
-- 3) Entidades de domínio
-- -------------------------------------------------------------
insert into guardians (id, profile_id, full_name, relationship, phone, email)
values ('a0000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','Ana Martins','Mãe','(11) 90000-0001','responsavel@nexisx.com.br')
on conflict (id) do nothing;

insert into professionals (id, profile_id, full_name, specialty, registration)
values ('b0000000-0000-0000-0000-000000000001','33333333-3333-3333-3333-333333333333','Dra. Carla Nunes','Neuropediatra','CRM 00000')
on conflict (id) do nothing;

insert into schools (id, profile_id, name, city, contact_email)
values ('c0000000-0000-0000-0000-000000000001','44444444-4444-4444-4444-444444444444','Escola Aurora','São Paulo','escola@nexisx.com.br')
on conflict (id) do nothing;

-- 2 crianças
insert into children (id, full_name, birth_date, guardian_id, school_id, notes)
values
  ('d0000000-0000-0000-0000-000000000001','Helena Martins','2023-10-12','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Em triagem.'),
  ('d0000000-0000-0000-0000-000000000002','Theo Martins','2020-03-05','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Em acompanhamento.')
on conflict (id) do nothing;

-- Vínculos
insert into child_professionals (child_id, professional_id)
values
  ('d0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001')
on conflict do nothing;

insert into child_schools (child_id, school_id, authorized)
values
  ('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001', true),
  ('d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000001', true)
on conflict do nothing;

-- -------------------------------------------------------------
-- 4) Tarefas
-- -------------------------------------------------------------
insert into tasks (id, child_id, title, category, cadence, points, status, created_by)
values
  ('e0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002','Rotina da manhã com pictogramas','Casa','diaria',10,'pendente','33333333-3333-3333-3333-333333333333'),
  ('e0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000002','Atividade de associação (cores)','Terapia','semanal',15,'em_andamento','33333333-3333-3333-3333-333333333333'),
  ('e0000000-0000-0000-0000-000000000003','d0000000-0000-0000-0000-000000000002','Exercício de respiração','Regulação','diaria',5,'concluida','33333333-3333-3333-3333-333333333333')
on conflict (id) do nothing;

insert into task_completions (task_id, completed_by)
values ('e0000000-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222')
on conflict do nothing;

-- -------------------------------------------------------------
-- 5) Diário dos pais
-- -------------------------------------------------------------
insert into parent_diary_entries (child_id, mood, sleep, feeding, achievements, notes, created_by)
values
  ('d0000000-0000-0000-0000-000000000002','🙂 Bom','Dormiu bem','Aceitou novo alimento','Brincou com colegas','Dia tranquilo no geral.','22222222-2222-2222-2222-222222222222'),
  ('d0000000-0000-0000-0000-000000000002','😐 Neutro','Fragmentado','Seletiva',null,'Mudança de rotina deixou-o agitado.','22222222-2222-2222-2222-222222222222')
on conflict do nothing;

-- -------------------------------------------------------------
-- 6) Linha do tempo
-- -------------------------------------------------------------
insert into neuro_timeline_events (child_id, kind, title, description, created_by)
values
  ('d0000000-0000-0000-0000-000000000001','triagem','M-CHAT aplicado','Pontuação 5/20 — risco moderado.','33333333-3333-3333-3333-333333333333'),
  ('d0000000-0000-0000-0000-000000000001','relatorio','Relatório preliminar gerado','Encaminhamento para neuropediatra.','33333333-3333-3333-3333-333333333333'),
  ('d0000000-0000-0000-0000-000000000002','consulta','Consulta de acompanhamento','Avaliação trimestral.','33333333-3333-3333-3333-333333333333')
on conflict do nothing;

-- -------------------------------------------------------------
-- 7) Solicitações (comercial e genética)
-- -------------------------------------------------------------
insert into sensory_room_requests (requester_name, email, phone, environment, message, status)
values ('Escola Aurora','escola@nexisx.com.br','(11) 3000-0000','Escola','Interesse em sala sensorial para sala de recursos.','novo')
on conflict do nothing;

insert into genetic_exam_requests (child_id, exam_type, status, created_by)
values ('d0000000-0000-0000-0000-000000000001','Exoma','solicitado','33333333-3333-3333-3333-333333333333')
on conflict do nothing;
