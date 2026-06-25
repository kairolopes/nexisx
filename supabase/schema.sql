-- =============================================================
-- NexisX — Esquema do banco de dados (PostgreSQL / Supabase)
-- Inclui tabelas, relacionamentos, índices, funções e RLS.
-- Execute no SQL Editor do Supabase.
-- =============================================================

-- Extensões
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- Tipos
-- -------------------------------------------------------------
do $$ begin
  create type role_type as enum ('admin','responsavel','profissional','escola','consultor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type risk_level as enum ('baixo','moderado','alto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('pendente','em_andamento','concluida');
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------------
-- profiles (1:1 com auth.users)
-- -------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role role_type not null default 'responsavel',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Cria profile automaticamente ao criar usuário.
-- SEGURANÇA: o papel (role) NUNCA é lido de raw_user_meta_data — esse dado vem do
-- cliente e poderia ser forjado (escalonamento de privilégio). Todo novo usuário
-- entra como 'responsavel'. A promoção para admin/profissional/escola/consultor só
-- pode ser feita por um admin (políticas RLS de profiles) ou pela service_role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'responsavel'  -- papel padrão fixo; nunca vindo do cliente
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- SEGURANÇA: impede que um usuário comum altere o próprio papel via UPDATE em profiles.
-- Mesmo com a policy profiles_self_update, esta trigger trava a troca de role por
-- quem não é admin. Quem pode promover: admin (is_admin) ou service_role/SQL direto
-- (contexto sem auth.uid(), usado apenas no backend confiável).
create or replace function public.enforce_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null      -- service_role / SQL direto: contexto confiável
     and not public.is_admin() then
    new.role := old.role;  -- ignora silenciosamente a tentativa de troca de papel
  end if;
  return new;
end $$;

drop trigger if exists on_profile_role_update on public.profiles;
create trigger on_profile_role_update
  before update on public.profiles
  for each row execute function public.enforce_role_change();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: papel do usuário atual
create or replace function public.current_role()
returns role_type language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- -------------------------------------------------------------
-- Entidades base
-- -------------------------------------------------------------
create table if not exists guardians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  relationship text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists professionals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  specialty text,
  registration text,
  created_at timestamptz not null default now()
);

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  city text,
  contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  guardian_id uuid references guardians(id) on delete set null,
  school_id uuid references schools(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- Vínculos N:N
create table if not exists child_professionals (
  child_id uuid references children(id) on delete cascade,
  professional_id uuid references professionals(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (child_id, professional_id)
);

create table if not exists child_schools (
  child_id uuid references children(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  authorized boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (child_id, school_id)
);

-- -------------------------------------------------------------
-- Triagem
-- -------------------------------------------------------------
create table if not exists facial_analyses (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  image_path text,
  consent boolean not null default false,
  status text not null default 'pendente',
  result text,
  observations text,
  recommendation text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists mchat_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  score int,
  risk risk_level,
  completed_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists mchat_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references mchat_sessions(id) on delete cascade,
  question_id int not null,
  answer text not null check (answer in ('yes','no'))
);

create table if not exists screening_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  facial_analysis_id uuid references facial_analyses(id) on delete set null,
  mchat_session_id uuid references mchat_sessions(id) on delete set null,
  priority text,
  recommendation text,
  next_steps text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Acompanhamento
-- -------------------------------------------------------------
create table if not exists neuro_profiles (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade unique,
  diagnoses text,
  hypotheses text,
  clinical_history text,
  therapeutic_history text,
  sensory_preferences text,
  sensory_triggers text,
  communication text,
  feeding text,
  sleep text,
  medications text,
  important_notes text,
  created_at timestamptz not null default now()
);

create table if not exists neuro_timeline_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  kind text,
  title text not null,
  description text,
  event_date timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  title text not null,
  category text,
  cadence text,
  points int not null default 0,
  status task_status not null default 'pendente',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  completed_by uuid references profiles(id)
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  phases int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  score int not null default 0,
  phase int not null default 1,
  played_at timestamptz not null default now()
);

create table if not exists parent_diary_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  mood text,
  sleep text,
  feeding text,
  crisis text,
  triggers text,
  achievements text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists professional_notes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  professional_id uuid references professionals(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists school_notes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  school_id uuid references schools(id) on delete set null,
  behavior text,
  adaptation text,
  communication text,
  social_interaction text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists evolution_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  period text,
  improvements text,
  attention_points text,
  next_steps text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Comercial / Genética / Documentos
-- -------------------------------------------------------------
create table if not exists sensory_room_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  email text,
  phone text,
  environment text,
  message text,
  status text not null default 'novo',
  created_at timestamptz not null default now()
);

create table if not exists genetic_exam_requests (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete set null,
  exam_type text,
  status text not null default 'solicitado',
  family_summary text,
  technical_summary text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  file_path text not null,
  doc_type text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists admin_notes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Índices úteis
create index if not exists idx_children_guardian on children(guardian_id);
create index if not exists idx_children_school on children(school_id);
create index if not exists idx_timeline_child on neuro_timeline_events(child_id);
create index if not exists idx_tasks_child on tasks(child_id);

-- =============================================================
-- RLS — habilitar e definir políticas
-- (Defina aqui ou rode em seguida o arquivo supabase/schema_rls.sql)
-- =============================================================
