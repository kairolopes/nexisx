-- =============================================================
-- NexisX — Triagem Digital Assistiva (Análise Comportamental Digital)
-- SQL ADITIVO — execute APÓS schema.sql, schema_rls.sql e storage.sql.
--
-- Conceito alinhado ao artigo "Early detection of autism using digital behavioral
-- phenotyping" (Nature Medicine, 2023): fenotipagem comportamental digital por
-- VÍDEO, combinada com o M-CHAT. É TRIAGEM assistiva — NUNCA diagnóstico.
--
-- Este arquivo é idempotente e NÃO altera `facial_analyses` (mantida intacta como
-- estrutura legada). Reaproveita as funções existentes public.can_access_child(),
-- public.is_admin() e public.storage_child_id().
-- =============================================================

-- -------------------------------------------------------------
-- 1) Tabelas
-- -------------------------------------------------------------

-- Sessão de coleta da triagem digital (vídeo ou foto). A foto é apenas uma etapa
-- inicial simples; a análise principal é por vídeo.
create table if not exists digital_screening_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  media_kind text not null default 'video' check (media_kind in ('video','photo')),
  media_path text,                       -- caminho no bucket screening-media (<child_id>/<uuid>.<ext>)
  consent boolean not null default false,
  capture_quality numeric,               -- 0..1 — score de QUALIDADE da coleta
  risk_score numeric,                    -- 0..1 — risco agregado de triagem
  risk_level risk_level,                 -- baixo | moderado | alto
  prediction_confidence numeric,         -- 0..1 — score de CONFIANÇA da predição
  recommendation text
    check (recommendation is null or recommendation in ('encaminhar','repetir_coleta','acompanhar')),
  recapture_required boolean not null default false,
  status text not null default 'pendente'
    check (status in ('pendente','processando','concluido','erro','baixa_qualidade')),
  -- Metadados de IA (NUNCA o texto bruto retornado pelo modelo):
  provider text,
  model text,
  prompt_version text,
  request_id text,
  latency_ms int,
  estimated_cost numeric,
  processed_at timestamptz,
  error_reason text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Um registro por SINAL comportamental medido — base da explicabilidade.
create table if not exists behavioral_signals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references digital_screening_sessions(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,  -- derivado p/ RLS direta
  signal text not null,                  -- social_attention | gaze | head_movement | ...
  indicator numeric,                     -- 0..1
  confidence numeric,                    -- 0..1
  note text,                             -- explicabilidade (texto tratado, não bruto)
  created_at timestamptz not null default now()
);

-- Fusão da triagem comportamental com o M-CHAT.
create table if not exists screening_fusions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  session_id uuid references digital_screening_sessions(id) on delete set null,
  mchat_session_id uuid references mchat_sessions(id) on delete set null,
  combined_risk risk_level,
  combined_confidence numeric,
  recommendation text
    check (recommendation is null or recommendation in ('encaminhar','repetir_coleta','acompanhar')),
  rationale text,
  created_at timestamptz not null default now()
);

-- Auditoria operacional das chamadas de IA — SEM PII e SEM texto bruto do modelo.
create table if not exists ai_requests (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model text not null,
  capability text not null,              -- behavioral.digitalScreening | text.geneticSummary | ...
  prompt_version text,
  request_id text,
  duration_ms int,
  estimated_cost numeric,
  success boolean not null default false,
  error text,                            -- categoria do erro (nunca conteúdo clínico)
  child_id uuid references children(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Índices úteis
create index if not exists idx_dss_child on digital_screening_sessions(child_id);
create index if not exists idx_bsig_session on behavioral_signals(session_id);
create index if not exists idx_bsig_child on behavioral_signals(child_id);
create index if not exists idx_fusion_child on screening_fusions(child_id);
create index if not exists idx_ai_requests_created on ai_requests(created_at);
create index if not exists idx_ai_requests_child on ai_requests(child_id);

-- -------------------------------------------------------------
-- 2) RLS
-- -------------------------------------------------------------
alter table digital_screening_sessions enable row level security;
alter table behavioral_signals         enable row level security;
alter table screening_fusions          enable row level security;
alter table ai_requests                enable row level security;

-- Tabelas ligadas à criança: mesma regra do RLS das demais (can_access_child).
-- Idempotente: remove antes de recriar. ATENÇÃO: ao criar novas tabelas com
-- child_id, mantenha-as nesta lista (conforme CLAUDE.md / DATABASE.md).
do $$
declare t text;
  child_tables text[] := array[
    'digital_screening_sessions','behavioral_signals','screening_fusions'
  ];
begin
  foreach t in array child_tables loop
    execute format('drop policy if exists %1$s_select on %1$s;', t);
    execute format('drop policy if exists %1$s_write on %1$s;', t);
    execute format(
      'create policy %1$s_select on %1$s for select using (public.can_access_child(child_id));', t);
    execute format(
      'create policy %1$s_write on %1$s for all using (public.can_access_child(child_id)) with check (public.can_access_child(child_id));', t);
  end loop;
end $$;

-- ai_requests: SOMENTE admin (dado operacional/custo, não clínico). Nunca público.
drop policy if exists ai_requests_admin on ai_requests;
create policy ai_requests_admin on ai_requests for all
  using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- 3) Storage — bucket privado screening-media (vídeo + foto)
--    Convenção de caminho: <child_id>/<uuid>.<ext>
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('screening-media', 'screening-media', false)
on conflict (id) do nothing;

do $$
declare b text := 'screening-media';
begin
  execute format('drop policy if exists %I on storage.objects;', b || '_select');
  execute format('drop policy if exists %I on storage.objects;', b || '_insert');
  execute format('drop policy if exists %I on storage.objects;', b || '_update');
  execute format('drop policy if exists %I on storage.objects;', b || '_delete');

  execute format($f$
    create policy %1$I on storage.objects for select
    using (
      bucket_id = %2$L
      and public.storage_child_id(name) is not null
      and public.can_access_child(public.storage_child_id(name))
    );$f$, b || '_select', b);

  execute format($f$
    create policy %1$I on storage.objects for insert
    with check (
      bucket_id = %2$L
      and public.storage_child_id(name) is not null
      and public.can_access_child(public.storage_child_id(name))
    );$f$, b || '_insert', b);

  execute format($f$
    create policy %1$I on storage.objects for update
    using (
      bucket_id = %2$L
      and public.can_access_child(public.storage_child_id(name))
    );$f$, b || '_update', b);

  execute format($f$
    create policy %1$I on storage.objects for delete
    using (
      bucket_id = %2$L
      and public.can_access_child(public.storage_child_id(name))
    );$f$, b || '_delete', b);
end $$;
