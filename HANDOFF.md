# HANDOFF.md — Transferência completa do projeto NexisX

> Documento de handoff técnico exaustivo. Reconstruído **exclusivamente** a partir do
> código-fonte, da documentação versionada (`README`, `CONTEXT`, `PRODUCT`, `DATABASE`,
> `DEPLOY`, `CLAUDE`, `CHANGELOG`), dos SQLs em `supabase/` e do histórico Git.
> Objetivo: permitir que outro engenheiro ou outra IA continue o projeto **sem** acesso à
> conversa anterior. Para um resumo de 5 minutos, ver `AI_CONTEXT.md`.
>
> Estado capturado: branch `main`, HEAD `7228e9b` (= `origin/main`), tags `v1.0-foundation`
> e `v0.2.5-fase-2-5`. Versão do `package.json`: `0.1.0`.
>
> **Atualização (Fase 3):** este documento foi originalmente escrito em `c2e3c50`. Desde
> então foram adicionados a **camada de IA provider-agnóstica** (`lib/ai/`) e a **Triagem
> Digital Assistiva** (4 tabelas novas → 28 no total; bucket `screening-media`). Para a
> arquitetura completa ver `ARCHITECTURE.md`; para decisões ver `docs/adr/`; para dívidas e
> riscos ver `TECH_DEBT.md`; roadmap em `ROADMAP.md`.

---

## 1. Visão geral do projeto

### Objetivo
NexisX é um **portal SaaS premium de neurodesenvolvimento, triagem inteligente e
ambientes sensoriais**. Une, num único produto:
- um **site público institucional** (marketing/educacional), e
- **sistemas internos protegidos por login** com controle por papéis e RLS.

A jornada coberta: descoberta (site) → triagem (análise facial assistida + M-CHAT) →
acompanhamento contínuo do neurodivergente → genética/exoma → salas sensoriais →
administração.

### Público
- **Famílias / responsáveis** — acompanham filhos, registram o dia a dia (diário, tarefas).
- **Profissionais** — gerenciam pacientes vinculados, registram evolução/pareceres.
- **Escolas / clínicas** — registram comportamento, adaptação e interação social.
- **Consultores** — gerenciam solicitações comerciais (salas sensoriais e exames).
- **Administradores** — operam tudo.

### Problema resolvido
Centralizar e organizar a jornada de triagem e acompanhamento de neurodesenvolvimento
(ex.: TEA) numa plataforma única, com **triagem orientadora** (não diagnóstica),
acompanhamento longitudinal e segurança de dados sensíveis de crianças (LGPD by design,
RLS por papel).

### Arquitetura (resumo)
- **Next.js 14 App Router** com dois route groups:
  - `app/(site)` — site público.
  - `app/app` — área protegida (Server Components por padrão).
  - `app/login` — autenticação.
- **Defesa em profundidade** (3 camadas de autorização):
  1. **UI** — `navForRole()` filtra a navegação (`lib/navigation.ts`).
  2. **Rota (server)** — `requireRole([...])` no topo de cada Server Component restrito
     (`lib/guard.ts`).
  3. **Dados** — **RLS** no Postgres é a fonte de verdade (`supabase/schema_rls.sql`).
- **Camada de dados isolada:** páginas nunca chamam o Supabase direto. Leitura →
  `lib/db/queries.ts` (tipada, tolerante a falha). Escrita → Server Actions em
  `lib/actions/*` (validadas + autorizadas), retornando `ActionResult`.
- **Storage privado** com URLs assinadas temporárias; policies reaproveitam
  `can_access_child()`.
- **Design system próprio** (tokens HSL em `app/globals.css`, componentes estilo shadcn
  sobre Radix UI, Framer Motion, Canvas 2D para o hero).

### Stack completa
| Camada | Tecnologia |
|---|---|
| Framework | Next.js `14.2.13` (App Router) + React `18.3.1` |
| Linguagem | TypeScript `5.6.2` (strict), alias `@/*` → raiz |
| Estilo | Tailwind CSS `3.4.12` + `tailwindcss-animate`; tokens HSL; componentes shadcn-like |
| Primitivos acessíveis | Radix UI: `avatar, dialog, select, separator, tabs, tooltip` |
| Animação | Framer Motion `11.5.4` (+ `AnimatePresence`) |
| Efeitos | Canvas 2D + `requestAnimationFrame` (ParticleField); keyframes Tailwind |
| Ícones | `lucide-react` `0.441.0` |
| Utilitários CSS | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Backend | Supabase: Auth (`@supabase/ssr 0.5.2`), Postgres, Storage, RLS (`@supabase/supabase-js 2.45.4`) |
| Fontes | Sora (display) + Inter (sans) via `next/font/google` |
| Lint/types | ESLint (`next/core-web-vitals`), `tsc --noEmit` |

Sem biblioteca de teste configurada. Sem CI/CD versionado. Deploy alvo recomendado:
Vercel + Supabase.

---

## 2. Estado atual

> **Camada de IA (`lib/ai/`) — adicionada na Fase 3, não descrita nas seções originais
> abaixo.** A app importa IA só de `lib/ai/index.ts`. `resolveProvider(capability)` lê
> `AI_PROVIDER`/`AI_PROVIDER_FALLBACK` (default `mock`); **só o `MockProvider` existe** (sem
> SDK de IA nas dependências). A **Triagem Digital Assistiva** (`/app/triagem/comportamental`,
> `components/app/behavioral-screening.tsx`, `lib/actions/screening.ts`) roda uma **pipeline
> de 18 etapas independentes** (`lib/ai/behavioral/pipeline/`), mock determinístico, trocável
> por MediaPipe/OpenFace/OpenCV/YOLO/PyTorch. Grava `digital_screening_sessions`,
> `behavioral_signals`, `screening_fusions` (se houver M-CHAT) e auditoria em `ai_requests`.
> O domínio `lib/ai/genetics` existe mas está **dormente** (não plugado). Ver `ARCHITECTURE.md`.

### Pronto e funcionando (conectado a dados reais via Supabase)
- **Auth + roles + RLS** completos (3 camadas). Signup entra sempre como `responsavel`.
- **Triagem Digital Assistiva** — fluxo ponta a ponta com **IA mock**; banco/Storage aplicados
  no Supabase real (teste E2E ainda **não concluído** — ver `ROADMAP.md` P0).
- **Camada de dados** (`lib/db/queries.ts`) e **Server Actions** (`lib/actions/*`)
  validadas e autorizadas.
- **Dashboard** — contadores reais + atividade recente da timeline.
- **Crianças** — lista e perfil (idade calculada, diário recente, timeline, contagens),
  com `notFound()` e empty states. Perfil organizado em Tabs (Visão geral · Linha do
  tempo · Documentos).
- **Linha do tempo** — eventos reais (`neuro_timeline_events`).
- **Tarefas** — leitura + criar + concluir (pontuação, `task_completions`).
- **Diário dos pais** — leitura + criação.
- **Solicitações comerciais / salas (admin/consultor)** — listas reais; **formulário
  público de contato grava lead real** (anônimo permitido pela RLS).
- **Exames genéticos** — criação + lista.
- **Triagem M-CHAT** — salva `mchat_sessions` + `mchat_answers`; gera `screening_reports`
  (quando profissional/admin).
- **Análise facial** — **upload real da foto** (bucket `facial-photos`), `image_path`
  salvo em `facial_analyses`. Resultado **simulado** (sem IA).
- **Laudos / Documentos** — upload real (`genetic-reports`, `child-documents`) + lista com
  download por **URL assinada temporária** (5 min).
- **Responsáveis, Profissionais, Escolas, Usuários, Relatórios de triagem, Relatórios
  evolutivos** — listas/agregações reais.
- **Gestão de admin (Sprint 2):** cadastro de responsável, profissional e escola;
  vinculação profissional/escola ↔ criança; convite de usuário por e-mail (service_role);
  promoção de papel por admin. Todos os botões das páginas admin agora têm ação real.
  Auth callback (`/auth/callback`) para convite, magic link e OAuth.

### Ainda mock / protótipo (NÃO levar a produção sem integração real)
| Item | Estado | Pendência |
|---|---|---|
| **Análise facial (resultado de IA)** | upload real ✅; resultado **simulado** | integrar serviço de inferência (IA) |
| **Relatórios em PDF** | inexistente | gerar/exportar PDF |
| **Resumos de genética** | campos `family_summary`/`technical_summary` existem | geração automática (IA) |
| **Jogos** | protótipo visual (jogo da memória) | persistir `game_sessions`; mais jogos |
| **Visão geral da triagem** | guia estático de etapas | torná-la orientada ao estado real |
| **Configurações** | formulário **não persiste** | tabela de settings (fase futura) |
| **Convite/cadastro de usuários** | ✅ implementado (`inviteUser`, `InviteUserDialog`, `/auth/callback`) | — |
| **IA (toda)** | mock determinístico (sem SDK/provider real) | integrar provider real por etapa da pipeline / capacidade |
| **Resumo de genética por IA** | código em `lib/ai/genetics` **dormente** | plugar a `genetic_exam_requests` quando houver provider |
| **Testes automatizados** | inexistentes; só lint/typecheck/build + CI quality-gate | implementar `TEST_PLAN.md` |

### Dependências externas
- **Supabase** (Auth + Postgres + Storage + RLS) — núcleo. Sem `NEXT_PUBLIC_SUPABASE_*`
  configurado, `/app` só abre em **dev** com perfil **demo admin**; em produção redireciona
  para `/login`.
- **IA de análise facial** — ainda não integrada (resultado é mock).
- **Geração de PDF** — ausente.
- **Storage** — buckets `facial-photos`, `genetic-reports`, `child-documents` (privados).

---

## 3. Histórico técnico (reconstruído via Git)

Branch atual: `main` (sincronizada com `origin/main`). Tag: `v0.2.5-fase-2-5`.

### Branches (objetivo de cada uma)
Todas são branches de feature já consolidadas em `main` pelo merge `10af6f4`.
| Branch | Fase | Objetivo |
|---|---|---|
| `feat/fase-2-auth-roles` | Fase 2 · Bloco A | Hardening de auth/roles, triggers, guard |
| `feat/fase-2-data-actions` | Fase 2 · Bloco B | Camada de dados tipada + Server Actions |
| `feat/fase-2-connect-screens` | Fase 2 · Bloco C | Conectar telas a dados reais (remover mocks) |
| `feat/fase-2-storage` | Fase 2 · Bloco D | Supabase Storage (uploads seguros + signed URLs) |
| `feat/fase-2-hardening` | Fase 2 · Bloco E | Hardening final + DEPLOY.md |
| `feat/fase-2-5-design-tokens` | Fase 2.5 · Onda 1 | Design tokens premium (elevação, superfícies) |
| `feat/fase-2-5-feedback-motion` | Fase 2.5 · Onda 2 | Skeleton/Loading/Error/Toast + transições |
| `feat/fase-2-5-components` | Fase 2.5 · Onda 3 | Biblioteca de componentes Radix |
| `feat/fase-2-5-platform-polish` | Fase 2.5 · Onda 4 | Microinterações da plataforma |
| `feat/fase-2-5-public-site` | Fase 2.5 · Onda 5 | Site público premium (mockups em código) |

### Commits importantes (linha do tempo)
```
7487657  Fase 1 — site público, área interna, schema + RLS, docs (v0.1.0, 2026-06-24)
4c8da74  feat(auth): harden roles and protected routes        (Bloco A)
85f506d  feat(data): typed database layer and server actions   (Bloco B)
e122241  feat(data): connect core screens to Supabase actions  (Bloco C)
8ea372d  feat(storage): secure uploads for facial photos/reports (Bloco D)
1605c5f  chore(hardening): finalize phase 2 production readiness (Bloco E)
37acb75  chore(ui): refine design tokens and base components     (Onda 1)
90c5bb5  chore(ui): premium loading error and feedback states    (Onda 2)
114327c  chore(ui): accessible premium component library         (Onda 3)
d352c2d  chore(ui): polish platform experience/microinteractions (Onda 4)
e92c2f5  chore(ui): extend stagger and hover polish to lists     (Onda 4)
89a4b1d  chore(ui): elevate public site storytelling/visuals     (Onda 5)
10af6f4  merge: consolidate Fase 2 and Fase 2.5 into main
c2e3c50  fix(storage): correct Supabase policy SQL syntax        (HEAD)
```

### O que foi implementado em cada fase
- **Fase 1 (v0.1.0):** estrutura base; site público completo (hero Canvas 2D, páginas
  institucionais); login + middleware; triagem (M-CHAT funcional, análise facial UI);
  acompanhamento (crianças, timeline, tarefas, jogos protótipo, diário, relatórios);
  genética; comercial; admin (dashboard, gráficos, tabelas); `schema.sql` + `schema_rls.sql`;
  design system. **Telas ainda com mocks.**
- **Fase 2 (A→E):** segurança real (triggers, guard); camada de dados + actions; conexão
  das telas ao Supabase; Storage seguro; hardening + `DEPLOY.md`.
- **Fase 2.5 (Ondas 1→5):** acabamento premium — tokens de design, feedback/estados,
  biblioteca Radix, microinterações e site público com mockups feitos 100% em código.
  **Sem tocar em auth/banco/Storage/roles.**

---

## 4. Banco de dados

Postgres no Supabase. Arquivos (rodar **nesta ordem** no SQL Editor):
1. `supabase/schema.sql` — extensão `pgcrypto`, enums, tabelas, índices, triggers, funções.
2. `supabase/schema_rls.sql` — habilita RLS e cria políticas.
3. `supabase/storage.sql` — buckets privados + policies de Storage.
4. `supabase/seed.sql` — **APENAS dev** (insere direto em `auth.users`; senha `nexisx123`).

### Enums
- `role_type`: `admin | responsavel | profissional | escola | consultor`
- `risk_level`: `baixo | moderado | alto`
- `task_status`: `pendente | em_andamento | concluida`

### Tabelas (24) e relacionamentos
**Identidade/papéis**
- `profiles` — 1:1 com `auth.users` (PK `id` → `auth.users(id)` CASCADE); `role role_type
  NOT NULL DEFAULT 'responsavel'`, `full_name`, `phone`, `avatar_url`.

**Entidades base**
- `guardians` (`profile_id` → profiles SET NULL; `full_name`, `relationship`, `phone`, `email`)
- `professionals` (`profile_id` SET NULL; `full_name`, `specialty`, `registration`)
- `schools` (`profile_id` SET NULL; `name`, `city`, `contact_email`)
- `children` (`guardian_id` → guardians SET NULL; `school_id` → schools SET NULL;
  `full_name`, `birth_date`, `notes`; índices em `guardian_id`, `school_id`)

**Vínculos N:N**
- `child_professionals` (PK composta `child_id, professional_id`; FKs CASCADE)
- `child_schools` (PK composta `child_id, school_id`; FKs CASCADE; `authorized bool DEFAULT
  true` — controla acesso da escola)

**Triagem**
- `facial_analyses` (`child_id` CASCADE; `image_path`, `consent`, `status`, `result`,
  `observations`, `recommendation`, `created_by`)
- `mchat_sessions` (`child_id` CASCADE; `score`, `risk`, `completed_at`, `created_by`)
- `mchat_answers` (`session_id` → mchat_sessions CASCADE; `question_id`, `answer CHECK in
  ('yes','no')`) — **derivada**, sem `child_id`
- `screening_reports` (`child_id` CASCADE; `facial_analysis_id` SET NULL; `mchat_session_id`
  SET NULL; `priority`, `recommendation`, `next_steps`)

**Acompanhamento**
- `neuro_profiles` (`child_id` CASCADE **UNIQUE** — 1:1; muitos campos clínicos texto)
- `neuro_timeline_events` (`child_id` CASCADE; `kind`, `title`, `description`, `event_date`,
  `created_by`; índice em `child_id`)
- `tasks` (`child_id` CASCADE; `title`, `category`, `cadence`, `points DEFAULT 0`, `status`,
  `created_by`; índice em `child_id`)
- `task_completions` (`task_id` CASCADE; `completed_at`, `completed_by`) — **derivada**
- `games` (catálogo global; `title`, `category`, `phases`) — sem `child_id`
- `game_sessions` (`game_id` CASCADE; `child_id` CASCADE; `score`, `phase`, `played_at`)
- `parent_diary_entries` (`child_id` CASCADE; `mood`, `sleep`, `feeding`, `crisis`,
  `triggers`, `achievements`, `notes`, `created_by`)
- `professional_notes` (`child_id` CASCADE; `professional_id` SET NULL; `note`)
- `school_notes` (`child_id` CASCADE; `school_id` SET NULL; `behavior`, `adaptation`,
  `communication`, `social_interaction`, `notes`)
- `evolution_reports` (`child_id` CASCADE; `period`, `improvements`, `attention_points`,
  `next_steps`)

**Comercial / Genética / Docs**
- `sensory_room_requests` (lead público; **sem** `child_id`; `requester_name`, `email`,
  `phone`, `environment`, `message`, `status DEFAULT 'novo'`)
- `genetic_exam_requests` (`child_id` → children **SET NULL**; `exam_type`, `status DEFAULT
  'solicitado'`, `family_summary`, `technical_summary`, `created_by`)
- `uploaded_documents` (`child_id` CASCADE; `file_path NOT NULL`, `doc_type`, `uploaded_by`)
- `admin_notes` (sem `child_id`; `body`, `created_by`)

### Funções e triggers
- `handle_new_user()` (SECURITY DEFINER) — trigger `on_auth_user_created` AFTER INSERT em
  `auth.users`. Cria `profiles` com `role` **fixo `'responsavel'`** (nunca lê papel do
  cliente). `ON CONFLICT (id) DO NOTHING`.
- `enforce_role_change()` (SECURITY DEFINER) — trigger BEFORE UPDATE em `profiles`. Se
  `role` mudou **e** há `auth.uid()` **e** o autor não é admin → reverte silenciosamente
  (`new.role := old.role`). Com `auth.uid()` nulo (service_role/seed) a troca é permitida.
- `current_role()` (STABLE SECURITY DEFINER) — papel do `auth.uid()` atual.
- `is_admin()` (STABLE SECURITY DEFINER) — booleano.
- `can_access_child(c_id uuid)` (SECURITY DEFINER) — **coração da autorização**: true se
  admin, responsável dono, profissional vinculado (`child_professionals`) ou escola
  autorizada (`child_schools.authorized = true`).

### RLS (estratégia)
RLS habilitado em **todas as 24 tabelas**. Tabelas com `child_id` recebem políticas geradas
por loop (`do $$`): `_select` (`using can_access_child(child_id)`) e `_write` FOR ALL
(`using`+`with check`).

**Array `child_tables` (13)** — herdam as políticas padrão:
`facial_analyses, mchat_sessions, screening_reports, neuro_profiles, neuro_timeline_events,
tasks, parent_diary_entries, professional_notes, school_notes, evolution_reports,
genetic_exam_requests, uploaded_documents, game_sessions`.
> ⚠️ Ao criar nova tabela com `child_id`, **adicione-a a esse array** (instrução do CLAUDE.md).

**Derivadas:** `mchat_answers` (policy via EXISTS em `mchat_sessions`) e `task_completions`
(via EXISTS em `tasks`).

**Políticas explícitas:** `profiles` (próprio id ou admin); `children`
(select=`can_access_child(id)`, write só admin); `guardians/professionals/schools` (lê o
próprio `profile_id` ou admin, write só admin); vínculos (select via `can_access_child`,
write só admin); `games` (select qualquer autenticado, write só admin);
`sensory_room_requests` (select/update admin ou `consultor`; **INSERT `with check (true)`
— lead público anônimo**); `admin_notes` (só admin).

**Resumo por papel:** admin = tudo · responsavel = seus filhos · profissional = crianças
vinculadas · escola = crianças autorizadas · consultor = solicitações comerciais/exames.

### Storage
3 buckets **privados**: `facial-photos`, `genetic-reports`, `child-documents`.
Convenção de caminho: `<child_id>/<uuid>.<ext>` — o 1º segmento é o `child_id`. A função
`storage_child_id(name)` (IMMUTABLE) extrai e faz cast desse segmento (retorna null se
inválido). 4 policies por bucket (select/insert/update/delete) que reusam
`can_access_child(storage_child_id(name))`. Acesso a arquivos **só por URL assinada
temporária** (`getSignedFileUrl`, expiração padrão 300s).

### Seed (dev) — usuários demo, senha `nexisx123`
`admin@`, `responsavel@` (Ana Martins), `profissional@` (Dra. Carla Nunes), `escola@`
(Escola Aurora). + 2 crianças (Helena, Theo), vínculos, 3 tarefas, diário, 3 eventos de
timeline, 1 lead de sala, 1 exame de exoma.

### Fluxo de autenticação
Supabase Auth via `@supabase/ssr` (cookies). `middleware.ts` → `lib/supabase/middleware.ts`:
em qualquer rota `/app/*` sem `user`, redireciona para `/login?redirect=<path>`. Signup
dispara `handle_new_user` (cria `profiles` como `responsavel`). Promoção de papel só por
admin ou service_role/SQL direto.

---

## 5. Fluxo completo do sistema

### Login → área interna
1. Usuário acessa `/app/*`. `middleware` checa sessão; sem ela → `/login`.
2. Cada Server Component restrito chama `requireSession()`/`requireRole([...])`
   (`lib/guard.ts`) — sem sessão → `/login`; papel errado → `/app`.
3. `lib/auth.ts#getSessionProfile()` lê o `user` e o `profile` (papel **só** de `profiles`).
   Em dev sem Supabase → perfil demo admin; em produção → `null`.
4. Layout `app/app/layout.tsx` monta sidebar (`navForRole`) + topbar.

### Módulos (rotas em `app/app/`)
- **Dashboard** (`/app`) — `countRows` + atividade recente; `FeaturedStat`, `StatCard`,
  `AnimatedCounter`, `MotionList`.
- **Triagem** (`/app/triagem`) — visão geral (guia estático de 10 etapas).
  - **Análise facial** (`/triagem/analise-facial`) — upload foto → `submitFacialAnalysis`
    (FormData) → bucket `facial-photos` + `facial_analyses`. Resultado **simulado**.
  - **M-CHAT** (`/triagem/mchat`) — 20 itens (`lib/mchat.ts`), progresso, Sim/Não,
    classificação (`score>=8` alto, `>=3` moderado, senão baixo) →
    `saveMchatSession`+`saveMchatAnswers`; se profissional/admin gera `screening_reports`.
  - **Relatórios de triagem** (`/triagem/relatorios`) — lista `screening_reports`.
- **Crianças** (`/app/criancas`, `/[id]`) — lista + perfil (Tabs, Avatar, idade via
  `lib/age.ts`, diário/timeline/documentos).
- **Linha do tempo** (`/app/linha-do-tempo`) — `neuro_timeline_events`.
- **Tarefas** (`/app/tarefas`) — board; `createTask`, `completeTask` (pontuação + selo).
- **Jogos** (`/app/jogos`) — grade de categorias + jogo da memória (**sem persistência**).
- **Diário** (`/app/diario`) — `createDiaryEntry`.
- **Relatórios evolutivos** (`/app/relatorios-evolutivos`) — agregações reais.
- **Genética** (`/app/genetica`) — `createGeneticExamRequest` (Dialog).
- **Laudos** (`/app/laudos`) — upload `genetic-reports` + download por signed URL.
- **Salas sensoriais / Solicitações** (`/app/salas-sensoriais`, `/solicitacoes`) — leads.
- **Admin** (`/responsaveis`, `/profissionais`, `/escolas`, `/usuarios`) — listas reais.
- **Configurações** (`/app/configuracoes`) — **não persiste**.

### Site público (`app/(site)`)
Home (hero Canvas 2D + `ProductMockup` + `Journey` + `TriagemExplainer` + `Credibility`),
Sobre, Salas Sensoriais (galeria com efeitos de luz em código), DNA/Exoma (`GeneticsFlow`),
Famílias, Profissionais, Escolas e Clínicas, Contato (`contact-form` → grava lead real).

---

## 6. Arquitetura Frontend

### Rotas (`app/`)
- Root: `layout.tsx` (fontes Inter+Sora, `ToastProvider`, metadata), `not-found.tsx`,
  `global-error.tsx`, `globals.css`.
- `(site)/`: `layout.tsx`, `loading.tsx`, `error.tsx`, `page.tsx` (home) + 7 páginas.
- `app/`: `layout.tsx` (sidebar+topbar), `template.tsx` (transição de página), `loading.tsx`,
  `error.tsx`, `page.tsx` (dashboard) + segmentos com seus `loading.tsx`.
- `login/page.tsx`.

### Componentes (mapa)
- **`components/ui/`** (base, estilo shadcn / Radix): `avatar, badge, button, card, dialog,
  input, label, progress, select, separator, sheet, skeleton, tabs, textarea, toast, tooltip`.
- **`components/app/`** (plataforma): `animated-counter, bar-chart, data-table, diary-form,
  documents-list, empty-state, error-state, facial-analysis, file-uploader,
  genetic-request-form, icon, loading-state, mchat-form, memory-game, motion (MotionList/
  MotionItem), page-header, sidebar, stat-card, tasks-board, timeline, topbar`.
- **`components/site/`** (marketing): `contact-form, credibility, footer, genetics-flow,
  journey, logo, navbar, notice, page-hero, product-mockup, sensory-gallery,
  triagem-explainer`.
- **`components/auth/`**: `login-form`.
- **`components/effects/`**: `particle-field` (Canvas 2D), `reveal` (Reveal/Stagger).

### Providers / Hooks
- **`ToastProvider`** (`components/ui/toast.tsx`) — montado no root layout; expõe
  `useToast()` (`success/error/warning/info`); auto-dismiss ~4,2s; Framer Motion;
  fallback seguro fora do provider.
- Hooks padrão React (`useTransition` para bloquear duplo clique nas ações).

### Server vs Client
- **Server Components** (default em `app/app/**`): leem via `lib/db/queries.ts`, chamam
  guards, renderizam dados.
- **Client Components** (`"use client"`): formulários, jogos, animações com estado,
  consumidores de `useToast`, Radix overlays. Chamam Server Actions e usam
  `router.refresh()` após escrita.

---

## 7. Arquitetura Backend

### Como funciona hoje
- **Sem backend dedicado** além do Supabase + Server Actions do Next.
- **Leitura:** `lib/db/queries.ts` (client server-side → cookies → RLS). Helpers `safeList`
  (retorna `[]`) e `safeOne` (retorna `null`) toleram erro para não quebrar a tela.
- **Escrita:** Server Actions (`"use server"`) em `lib/actions/*`, envolvidas por
  `runAction` (`lib/actions/helpers.ts`) que converte `ValidationError`/`AuthzError` em
  `ActionResult` e mascara erros inesperados. Cada action: `getActor([roles])` (autz) +
  validação (`lib/validation.ts`) + insert/update sob RLS.
- **Storage:** `lib/storage/index.ts` (upload com validação de MIME/extensão/tamanho/path +
  `getSignedFileUrl` + `deleteFileIfAllowed`); actions em `lib/actions/uploads.ts` (FormData).

Server Actions principais: `createChild/updateChild`, `createDiaryEntry`,
`createGeneticExamRequest`, `saveMchatSession/saveMchatAnswers`, `createScreeningReport`,
`createSensoryRoomRequest` (público, sem autz), `createTask/completeTask`,
`submitFacialAnalysis/uploadGeneticReportDoc/uploadChildDocumentDoc`.

### O que ainda falta
- IA de análise facial (resultado é mock em `submitFacialAnalysis`).
- Geração de PDF dos relatórios.
- Resumos automáticos de genética.
- Persistência de `game_sessions` e de configurações.
- ~~Fluxo de convite/atribuição de papéis por admin.~~ ✅ **Concluído (Sprint 2).**

### Como deverá evoluir
1. Integrar serviço de inferência facial → substituir resultado simulado.
2. Serviço/endpoint de geração de PDF (relatórios de triagem/evolutivos).
3. IA para resumos de genética (preencher `family_summary`/`technical_summary`).
4. Persistir jogos e settings (nova tabela `settings`).
5. Fluxo de convite (service_role) com atribuição de papel.

---

## 8. UX/UI

- **Identidade:** sofisticado, futurista e acolhedor (saúde + tecnologia); glassmorphism
  leve, gradientes, Sora (display) + Inter (sans), muito espaço em branco, responsivo.
- **Design tokens** (`app/globals.css`, HSL): cores (`--primary` ciano `199 89% 46%`,
  `--secondary` teal, `--accent` roxo), `--muted-foreground` com contraste AA (~5:1),
  dark mode completo (`.dark`).
- **Sistema de sombras / elevação:** `--shadow-1..4` (multicamada) → utilitários
  `elevation-1..4` e `shadow-elevation-1..4` (Tailwind).
- **Radius:** `--radius` 1rem + escala `sm/md/lg/xl`.
- **Superfícies/utilitários:** `surface-card`, `surface-panel`, `glass`/`glass-card`,
  `gradient-border`, `text-gradient`, `text-balance`/`text-pretty`, `gradient-mesh`,
  `shimmer`, `no-scrollbar`, tipografia fluida (`heading-xl/lg/md`), `section-spacing`,
  `container-premium`.
- **Motion:** Framer Motion; `MotionList`/`MotionItem` (stagger no mount),
  `AnimatedCounter` (IntersectionObserver), `Reveal`/`Stagger`, transição de página
  (`app/app/template.tsx`). **`prefers-reduced-motion` desliga animações** (regra global no
  CSS).
- **Feedback / estados:** `Skeleton` (varredura) + `LoadingState` (Header/StatGrid/CardGrid/
  ListSkeleton) + `loading.tsx` por segmento; `ErrorState` + `error.tsx`/`global-error.tsx`
  (sem stack trace); `Toaster` global. Toda ação de escrita dá toast; botões bloqueiam
  duplo clique via `useTransition`.
- **Componentes Radix:** `Dialog`, `Sheet`, `Select`, `Tabs`, `Avatar`, `Tooltip`
  (+`InfoTooltip`), `Separator`. **Todos os `<select>` nativos foram substituídos pelo
  `Select` premium.**
- **Keyframes Tailwind:** `fade-up`, `float`, `shimmer`, `skeleton-sweep`, `pulse-glow`,
  `gradient-pan`.
- **Foco de teclado:** `:focus-visible` global com anel consistente; `aria-label` em ícones.
- **Avisos obrigatórios** preservados (análise facial e M-CHAT **não fecham diagnóstico**;
  genética **não substitui geneticista**). Sem depoimentos/clientes inventados.

---

## 9. Segurança (o que NUNCA deve ser alterado/enfraquecido)

- **Papel é fonte única em `profiles`** — nunca ler de `user_metadata`/`raw_user_meta_data`
  (controlável pelo cliente).
- **Defesa em 3 camadas:** menu por papel (`navForRole`) → `requireRole()` na rota → **RLS**
  no banco (fonte de verdade).
- **Toda página restrita** chama `requireRole([...])` no topo do Server Component.
- **Signup sempre `responsavel`** (`handle_new_user`); promoção só por admin/service_role
  (`enforce_role_change` reverte troca de papel por não-admin).
- **RLS habilitado em todas as tabelas;** `can_access_child()` é o centro da autorização.
  Nova tabela com `child_id` → adicionar ao array `child_tables`.
- **Storage:** buckets **privados**; acesso só por **URL assinada temporária** (5 min);
  policies reusam `can_access_child` via caminho `<child_id>/...`.
- **`SUPABASE_SERVICE_ROLE_KEY` jamais no client** (só backend/rotinas administrativas).
- **Server Actions** sempre validam (`lib/validation.ts`) e autorizam (`getActor`), e
  retornam `ActionResult` — **nunca lançam stack para a UI**.
- **Modo demo admin só em dev** (`NODE_ENV !== "production"`); em produção, sem sessão →
  `null` → `/login`. Nunca há fallback admin em produção.
- **Seed** insere direto em `auth.users` → **só dev** (senha `nexisx123`).

---

## 10. Deploy

### Variáveis de ambiente
| Variável | Obrigatória | Uso | Observação |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | client+server | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | client+server | chave pública (RLS é o controle) |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | **só backend** | nunca no client |
| `NEXT_PUBLIC_SITE_URL` | ✅ | auth/redirects | ex.: `https://app.nexisx.com.br` |

(`.env.example` versionado; `.env.local` existe localmente.)

### Passos
1. Criar projeto Supabase; copiar URL + ANON_KEY.
2. SQL Editor, **nesta ordem**: `schema.sql` → `schema_rls.sql` → `storage.sql`
   (→ `seed.sql` **só em dev**).
3. Confirmar RLS habilitado em todas as tabelas; buckets privados (`public=false`).
4. Habilitar Auth e-mail/senha (recomendado: confirmação de e-mail ON).
5. **Promover o primeiro admin manualmente:**
   `update profiles set role = 'admin' where id = '<uuid>';`
6. Build/deploy: `npm install && npm run lint && npm run typecheck && npm run build`;
   Vercel recomendado (build command `npm run build`; variáveis no painel).

### Checklist de RLS (com 2 contas)
- Responsável A vê só seus filhos; profissional só vinculados.
- `/app/usuarios` como responsável → redireciona `/app`.
- `update profiles set role='admin'` no próprio perfil (responsável) → **bloqueado**.
- Signup novo → sempre `responsavel`.
- Upload fora de escopo → negado; URL assinada expira (~5 min) e não é pública.

---

## 10a. Status da branch `feat/sprint-2-admin-management`

> **Pronto para PR — homologação manual no Supabase ainda pendente.**
> Não aprovado para merge em `main` nem para produção até os fluxos abaixo serem executados.

| Item | Status |
|---|---|
| typecheck | ✅ zero erros |
| lint | ✅ zero warnings |
| test | ✅ 39/39 |
| build | ✅ 35 páginas |
| `.env.homolog.example` sem segredo real | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` isolado no server | ✅ |
| `/app/diagnostico` protegido por `requireRole(["admin"])` | ✅ |
| Ambiente de homologação documentado (`DEPLOY.md`) | ✅ |
| Fluxos manuais no Supabase real | ⏳ pendente |
| Aprovado para produção | ❌ não |

---

## 10b. Homologação — Sprint 2 (branch `feat/sprint-2-admin-management`)

> Ambiente de homologação = Supabase real + `npm run dev` local (não há ambiente de
> staging separado neste estágio). Executar **antes** de fazer merge na `main`.

### Pré-requisitos obrigatórios

- [ ] `.env.local` (dev) ou `.env.homolog` (homolog) preenchido — ver `.env.homolog.example`.
- [ ] **Supabase Dashboard → Authentication → URL Configuration:**
  - `Site URL` = valor de `NEXT_PUBLIC_SITE_URL`
  - `Redirect URLs` contém `{SITE_URL}/auth/callback`
  - **Sem essa configuração o fluxo de convite falha silenciosamente.**
- [ ] SQLs aplicados na ordem: `schema → schema_rls → storage → screening_digital` (seed só dev).
- [ ] `npm run dev` sobe sem erro.
- [ ] Acesso a `/app/diagnostico` como admin confirma todos os checks verdes.

### Checklist de fluxos — Admin

- [ ] **Login admin:** entrar com conta admin real; sidebar exibe todos os itens.
- [ ] **Convidar usuário:** Usuários → "Convidar usuário" → inserir e-mail → toast de sucesso →
      e-mail recebido com link → clicar no link → `/auth/callback` processa → redireciona para `/app` →
      perfil criado como `responsavel`.
- [ ] **Promover papel:** Usuários → "Alterar papel" → selecionar o usuário convidado → papel
      `profissional` → salvar → papel atualizado na lista.
- [ ] **Criar responsável:** Responsáveis → "Adicionar" → preencher nome+e-mail → toast de sucesso →
      aparece na lista.
- [ ] **Criar profissional:** Profissionais → "Adicionar" → preencher nome+especialidade →
      toast de sucesso → aparece na lista.
- [ ] **Criar escola:** Escolas → "Adicionar" → preencher nome+cidade → toast de sucesso →
      aparece na lista.
- [ ] **Vincular profissional a criança:** Profissionais → "Vincular a criança" → selecionar criança
      e profissional → toast de sucesso → confirmar em Crianças que o profissional está vinculado.
- [ ] **Vincular escola a criança:** Escolas → "Vincular a criança" → selecionar criança e escola →
      authorized = true → toast de sucesso.
- [ ] **RLS — isolamento:** logar com conta `responsavel` (não admin) → tentar acessar
      `/app/usuarios` → redireciona para `/app` (requireRole bloqueou).

### Checklist de fluxos — Triagem Digital Assistiva

- [ ] Criar criança (ou usar existente do seed).
- [ ] Triagem → Triagem Digital Assistiva → selecionar criança → aceitar consentimento.
- [ ] Enviar foto (ou vídeo curto) → processar → resultado exibido (score, sinais, recomendação).
- [ ] Confirmar no Supabase Dashboard (Table Editor) que foram criados registros em:
  - `digital_screening_sessions` (status `concluido`)
  - `behavioral_signals` (sinais da sessão)
  - `ai_requests` (auditoria, visível só para admin)

### Resultado (preencher após execução)

| Fluxo | Status | Observação |
|---|---|---|
| Login admin | — | |
| Convidar usuário | — | |
| Callback /auth/callback | — | |
| Criar responsável | — | |
| Criar profissional | — | |
| Criar escola | — | |
| Vincular profissional → criança | — | |
| Vincular escola → criança | — | |
| Promover papel | — | |
| Triagem Digital — fluxo | — | |
| Triagem Digital — persistência no banco | — | |

> Atualizar esta tabela com ✅ / ❌ / ⚠️ após execução. Bugs encontrados → corrigir na
> branch antes do merge. Todos ✅ → abrir PR para `main`.

---

## 11. Pendências (por prioridade + dependências)

**P1 — bloqueia produção plena**
- Integrar **IA de análise facial** (substituir mock em `submitFacialAnalysis`). _Dep.:_
  serviço externo de inferência.
- **Geração de PDF** dos relatórios. _Dep.:_ lib/serviço de PDF.

**P2 — funcional**
- Persistir **`game_sessions`** + mais jogos. _Dep.:_ action + UI.
- ~~**Fluxo de convite/atribuição de papéis** por admin.~~ ✅ **Concluído (Sprint 2).**
- **Configurações** persistentes. _Dep.:_ nova tabela `settings`.

**P3 — melhorias**
- **Resumos de genética por IA** (preencher `family_summary`/`technical_summary`).
- Tornar a **visão geral da triagem** orientada ao estado real (hoje guia estático).
- Detalhe do relatório de triagem.

---

## 12. Dívida técnica

- **Tipos do banco escritos à mão** (`lib/db/types.ts`) — considerar codegen do Supabase CLI.
- **`lib/db/queries.ts` engole erros** (`safeList`/`safeOne` → lista vazia/null): bom para
  resiliência da UI, mas pode mascarar falhas reais de RLS/config. Considerar logging.
- **Sem testes automatizados** e **sem CI/CD** versionado.
- **Resultado de análise facial simulado** dentro da action (mock acoplado).
- **`configuracoes` não persiste** (placeholder).
- **Jogos sem persistência** (`game_sessions` não usada).
- `next.config.mjs` permite `images.remotePatterns` `hostname: "**"` (amplo) — restringir
  em produção.
- Único `eslint-disable` localizado: `components/app/facial-analysis.tsx:83`
  (`@next/next/no-img-element`, preview local). Nenhum `TODO/FIXME/@ts-ignore` no código.

---

## 13. Roadmap (próximas fases sugeridas)

1. **Fase 3 — IA & PDF:** inferência facial real, geração de PDF, resumos de genética.
2. **Fase 4 — Jogos & gamificação:** persistir `game_sessions`, novos jogos, métricas.
3. **Fase 5 — Gestão de usuários:** convites, atribuição de papéis, settings persistentes.
4. **Fase 6 — Observabilidade & qualidade:** testes (unit/e2e), CI/CD, logging/erros,
   restringir `remotePatterns`.

---

## 14. Como outra IA deve continuar

### Regras inegociáveis (preservar sempre)
1. **Idioma:** UI e textos em **português (pt-BR)**.
2. **Papel = `profiles`**, nunca `user_metadata`. Signup sempre `responsavel`.
3. **Defesa em 3 camadas** (menu → `requireRole` → RLS). Toda página restrita chama
   `requireRole([...])` no topo.
4. **RLS é a fonte de verdade.** Nova tabela com `child_id` → políticas padrão + incluir no
   array `child_tables` de `schema_rls.sql`.
5. **Storage privado + URL assinada;** caminho `<child_id>/<uuid>.<ext>`.
6. **`SUPABASE_SERVICE_ROLE_KEY` nunca no client.**
7. **Manter avisos obrigatórios** (não fecham diagnóstico). Sem clientes/depoimentos falsos.
8. **Modo demo admin só em dev.**

### Padrões arquiteturais (seguir)
- **Leitura** sempre via `lib/db/queries.ts` (tipada); **nunca** chamar Supabase direto nas
  páginas.
- **Escrita** sempre via Server Action em `lib/actions/*`: `getActor([roles])` + validação
  (`lib/validation.ts`) + `runAction` → `ActionResult`. Nunca lançar stack para a UI.
- **Clients Supabase:** `lib/supabase/server.ts` (Server Components/Actions),
  `client.ts` (browser), `middleware.ts` (refresh de sessão).
- **Server Components por padrão** em `app/app/**`; só usar `"use client"` quando há estado/
  interação. Após escrita no client, `router.refresh()`.
- **UI:** reutilizar `components/ui` (Radix/shadcn) e os utilitários premium do `globals.css`
  (preferir a valores avulsos). Preferir `Select` premium a `<select>` nativo.
- **Motion** sempre respeitando `prefers-reduced-motion`.
- **Toda ação de escrita** dá feedback por toast (`useToast`) e bloqueia duplo clique
  (`useTransition`).

### Nunca refazer (já consolidado e correto)
- Auth/roles/triggers, RLS e `can_access_child`, camada de dados + actions, Storage seguro,
  design tokens/elevação, biblioteca de componentes Radix, microinterações e site público.

### Antes de concluir qualquer mudança
Rodar **`npm run lint`**, **`npm run typecheck`** e **`npm run build`** (instrução do
CLAUDE.md).
