# AI_CONTEXT.md — Contexto essencial do NexisX (leitura < 5 min)

> Para o handoff completo, ver `HANDOFF.md`. Este arquivo é o briefing mínimo para outra IA
> continuar de onde o projeto parou.

## O que é
Portal SaaS de **neurodesenvolvimento, triagem e salas sensoriais**. Site público +
área interna protegida por login, papéis e RLS. Público: famílias, profissionais, escolas,
consultores, admin.

## Stack
Next.js 14 (App Router) + TS strict · Tailwind + shadcn/Radix · Framer Motion · Canvas 2D ·
Supabase (Auth + Postgres + Storage + RLS). Alias `@/*` → raiz. Estado: branch `main`, HEAD
`7228e9b` (= `origin/main`), tags `v1.0-foundation` e `v0.2.5-fase-2-5`, version `0.1.0`.
**Sem SDK de IA nas dependências** (nenhum provider real).

## Estrutura
```
app/(site)   site público     app/app   área protegida     app/login
components/ui (Radix) · components/app · components/site · components/effects
lib/supabase (server|client|middleware) · lib/db (queries.ts, types.ts)
lib/actions/* (Server Actions) · lib/storage · lib/{auth,guard,navigation,mchat,validation,age,types}.ts
lib/ai/ (camada de IA provider-agnóstica): core (registry/resolveProvider) · providers/mock
        · behavioral (pipeline de 18 etapas + features/aggregate/fusion) · genetics (dormente)
supabase/ schema.sql · schema_rls.sql · storage.sql · screening_digital.sql · seed.sql
```

## Camada de IA (`lib/ai/`) — provider-agnóstica
A app importa IA SÓ de `lib/ai/index.ts`. `resolveProvider(capability)` lê `AI_PROVIDER`/
`AI_PROVIDER_FALLBACK` (default `mock`); **só o `MockProvider` existe** (determinístico, sem
custo/IA real). A **Triagem Digital Assistiva** roda uma **pipeline de 18 etapas
independentes** (`behavioral/pipeline/`), cada uma com `PipelineStage<I,O>` e mock trocável por
MediaPipe/OpenFace/OpenCV/YOLO/PyTorch sem alterar o resto. Auditoria de IA (sem PII) em
`ai_requests`. Domínio `genetics` existe mas **dormente** (não plugado em tela/action). Ver
`ARCHITECTURE.md` e `docs/adr/0003`, `0006`.

## Regras inegociáveis (NÃO violar)
1. **Idioma pt-BR** em toda UI/texto.
2. **Papel vem só de `profiles`**, nunca de `user_metadata`. Signup → sempre `responsavel`;
   promoção só admin/service_role (triggers `handle_new_user`, `enforce_role_change`).
3. **Defesa em 3 camadas:** `navForRole` (menu) → `requireRole([...])` no topo de **toda**
   página restrita → **RLS** no banco (fonte de verdade).
4. **RLS:** `can_access_child()` é o centro. Nova tabela com `child_id` → adicionar ao array
   `child_tables` em `schema_rls.sql`.
5. **Storage privado** + acesso só por **URL assinada (5 min)**; caminho
   `<child_id>/<uuid>.<ext>`.
6. **`SUPABASE_SERVICE_ROLE_KEY` nunca no client.**
7. **Manter avisos** (triagem/análise facial/genética **não fecham diagnóstico**); sem
   depoimentos inventados.
8. **Demo admin só em dev** (`NODE_ENV !== "production"`).

## Padrões arquiteturais (seguir)
- **Leitura:** sempre `lib/db/queries.ts` (tipada, tolerante a falha). Páginas nunca chamam
  Supabase direto.
- **Escrita:** Server Action em `lib/actions/*` → `getActor([roles])` + validação
  (`lib/validation.ts`) + `runAction` → `ActionResult` (`{ok,data}|{ok:false,error}`). Nunca
  lançar stack para a UI.
- **Server Components por padrão** em `app/app/**`; `"use client"` só p/ estado/interação;
  após escrita → `router.refresh()`.
- **UI:** reutilizar `components/ui` + utilitários premium do `globals.css` (elevação,
  surface-card, glass, heading-*). Usar `Select` premium, não `<select>`. Motion respeita
  `prefers-reduced-motion`. Ação de escrita → toast (`useToast`) + `useTransition`.
- Clients: `lib/supabase/server.ts` (server), `client.ts` (browser), `middleware.ts` (sessão).

## Banco (28 tabelas)
Enums: `role_type(admin|responsavel|profissional|escola|consultor)`,
`risk_level(baixo|moderado|alto)`, `task_status(pendente|em_andamento|concluida)`.
Núcleo: `profiles`(1:1 auth.users), `guardians/professionals/schools`, `children`,
vínculos `child_professionals`/`child_schools(authorized)`. Triagem: `facial_analyses`,
`mchat_sessions`/`mchat_answers`, `screening_reports`. Acompanhamento: `neuro_profiles`,
`neuro_timeline_events`, `tasks`/`task_completions`, `games`/`game_sessions`,
`parent_diary_entries`, `professional_notes`, `school_notes`, `evolution_reports`.
Comercial/genética/docs: `sensory_room_requests`(lead público), `genetic_exam_requests`,
`uploaded_documents`, `admin_notes`.
Triagem Digital Assistiva (aditivo, `screening_digital.sql`): `digital_screening_sessions`,
`behavioral_signals`, `screening_fusions` (RLS por `can_access_child`) e `ai_requests`
(auditoria de IA — **só admin**). `facial_analyses` permanece intacta (legado).
Buckets privados (4): `facial-photos`, `genetic-reports`, `child-documents`, `screening-media`.

## Pronto vs mock
**Pronto (dados reais):** auth/roles/RLS, dashboard, crianças/perfil, timeline, tarefas,
diário, exames genéticos, M-CHAT, **upload real** de foto facial/laudos/documentos, leads,
listas admin, relatórios. **Triagem Digital Assistiva** ponta a ponta com **IA mock** (banco/
Storage aplicados no Supabase real; teste E2E ainda **não concluído** — ver ROADMAP P0).
**Gestão de admin (Sprint 2):** cadastro de responsável/profissional/escola, vinculação
profissional/escola ↔ criança, convite de usuário por e-mail (`service_role`), promoção de
papel; auth callback (`/auth/callback`) para convite/magic-link/OAuth.
**Mock/protótipo:** **toda IA é mock** (análise facial com resultado fixo; pipeline
comportamental determinística; resumos de genética **dormentes**), PDF inexistente, jogos
(sem `game_sessions`), visão geral da triagem (guia estático), configurações (não persiste).
**Testes automatizados:** 39 testes Vitest em `tests/` (M-CHAT, validação, actions, idade, IA
mock). Sem suite E2E; CI quality-gate (lint → typecheck → build).

## Próximos passos (prioridade) — detalhe em `ROADMAP.md`
1. **P0:** validar E2E a Triagem Digital no Supabase real; configurar `Redirect URLs` no
   Supabase Dashboard para `{SITE_URL}/auth/callback` (necessário para convites funcionarem).
2. **P1:** suite de testes (`TEST_PLAN.md`) + CI de testes; geração de PDF; logging/observabilidade.
3. **P2:** 1º provider de IA real numa etapa da pipeline; persistir `game_sessions`/settings.
4. **P3:** codegen de tipos; migrations versionadas; Sentry/OTel.

## Deploy
Vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (só backend), `NEXT_PUBLIC_SITE_URL`. SQL na ordem
`schema → schema_rls → storage` (seed só dev). Promover 1º admin via SQL.
**Antes de concluir mudanças: `npm run lint && npm run typecheck && npm run build`.**
