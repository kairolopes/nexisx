# ARCHITECTURE.md — Arquitetura do NexisX

> Documento de arquitetura técnica. Descreve **como** o sistema é construído e **por quê**.
> Para regras permanentes ver `PROJECT_RULES.md`; para estado e pendências ver `HANDOFF.md`;
> para decisões pontuais ver `docs/adr/`. Em conflito, vale a regra mais restritiva de segurança.

## Visão de alto nível

NexisX é um monólito **Next.js 14 (App Router)** servido por um único processo, com o
**Supabase** como backend (Auth + PostgreSQL + Storage + RLS). Não há backend dedicado nem
microsserviços: toda a lógica server-side vive em **Server Components** e **Server Actions**
do Next, e a segurança real é imposta pelo **RLS** no banco.

```
Browser ──▶ Next.js (App Router)
            │  app/(site)      → site público (Server Components)
            │  app/app/*       → área protegida (Server Components + Client islands)
            │  middleware.ts   → refresh de sessão + bloqueio de /app sem login
            │
            │  lib/db/queries.ts   (LEITURA tipada)
            │  lib/actions/*       (ESCRITA via Server Actions)
            │  lib/ai/*            (camada de IA provider-agnóstica — hoje mock)
            ▼
        Supabase  ── Auth (cookies via @supabase/ssr)
                  ── PostgreSQL + RLS (fonte de verdade da autorização)
                  ── Storage (buckets privados + URL assinada)
```

## Auth

- Supabase Auth, e-mail/senha, sessão por **cookies** via `@supabase/ssr`.
- Três clients: `lib/supabase/server.ts` (Server Components/Actions), `client.ts` (browser),
  `middleware.ts` (refresh de sessão).
- O perfil da sessão vem de `lib/auth.ts#getSessionProfile()`, que lê `auth.users` **e** a
  linha correspondente em `profiles`. **O papel é lido SOMENTE de `profiles`**, nunca de
  `user_metadata` (controlável pelo cliente).
- Em desenvolvimento sem Supabase configurado, `getSessionProfile()` devolve um perfil
  **demo admin** — apenas quando `NODE_ENV !== "production"`. Em produção, sem sessão → `null`.

## Roles (papéis)

- Definidos em `lib/types.ts`: `admin | responsavel | profissional | escola | consultor`.
- Signup entra **sempre** como `responsavel` (trigger `handle_new_user`). Promoção só por
  admin ou service_role/SQL direto (trigger `enforce_role_change` reverte tentativas de
  não-admin).
- Navegação por papel em `lib/navigation.ts` (`navForRole`).

## RLS — fonte de verdade da segurança

A autorização real **não** está no frontend nem nas Server Actions: está no **RLS** do
PostgreSQL. As camadas de UI e rota são defesa-em-profundidade, não a barreira final.

- Função central `can_access_child(child_id)` (SECURITY DEFINER): `true` se admin,
  responsável dono, profissional vinculado (`child_professionals`) ou escola autorizada
  (`child_schools.authorized`).
- Toda tabela com `child_id` herda políticas `_select`/`_write` geradas por loop em
  `supabase/schema_rls.sql`; o nome da tabela precisa estar no array `child_tables`.
- Tabelas derivadas (`mchat_answers`, `task_completions`) checam acesso pela entidade-pai.
- `ai_requests` (auditoria de IA) é **somente admin** (`is_admin()`).
- Ver ADR `docs/adr/0002-rls-como-fonte-de-seguranca.md`.

### Defesa em 3 camadas
1. **UI** — `navForRole()` filtra o menu.
2. **Rota** — `requireRole([...])` no topo de **toda** página restrita (`lib/guard.ts`)
   redireciona acesso por URL direta.
3. **Dados** — **RLS** no banco (fonte de verdade).

## Server Actions (escrita)

- Páginas **nunca** chamam o Supabase diretamente. Escrita só por Server Actions em
  `lib/actions/*` (`"use server"`).
- Padrão de cada action: `getActor([roles])` (autz, lança `AuthzError`) + validação
  (`lib/validation.ts`) + operação sob RLS, tudo envolvido por `runAction`
  (`lib/actions/helpers.ts`), que converte erros em `ActionResult`
  (`{ ok, data } | { ok: false, error }`). **Nunca lança stack para a UI.**
- Após escrita no client → `router.refresh()`.
- Ver ADR `docs/adr/0005-server-actions-para-escrita.md`.

## Supabase

- PostgreSQL + Auth + Storage num único projeto. **Sem Edge Functions.**
- **Sem sistema de migrations**: SQL idempotente aplicado manualmente no SQL Editor, na
  ordem `schema.sql → schema_rls.sql → storage.sql → screening_digital.sql` (→ `seed.sql`
  só em dev). Ver `DEPLOY.md`.
- Tipos do banco escritos à mão em `lib/db/types.ts` (dívida — ver `TECH_DEBT.md`).
- Ver ADR `docs/adr/0001-uso-do-supabase.md`.

## Storage

- 4 buckets **privados**: `facial-photos`, `genetic-reports`, `child-documents`,
  `screening-media`.
- Convenção de caminho **obrigatória**: `<child_id>/<uuid>.<ext>` — o 1º segmento é o
  `child_id`, o que permite às policies de `storage.objects` reusarem
  `can_access_child(storage_child_id(name))`.
- Acesso a arquivos **só por URL assinada temporária** (`getSignedFileUrl`, ~300s). Nada
  público.
- Upload por `lib/storage/index.ts` (valida MIME/extensão/tamanho/caminho) + Server Actions
  em `lib/actions/uploads.ts` e `lib/actions/screening.ts`.
- Ver ADR `docs/adr/0004-storage-privado-url-assinada.md`.

## IA (camada provider-agnóstica)

A aplicação importa IA **somente** de `lib/ai/index.ts` — nunca de um provedor concreto.

```
lib/ai/
  core/      types · errors · provider (interface AIProvider) · registry (resolveProvider)
  shared/    hash · cost (estimateCost) · audit
  providers/ mock.ts            ← ÚNICO provider registrado hoje
  behavioral/  features/, aggregate, capture-quality, explain, parser, service, fusion
               pipeline/ (18 etapas independentes + orquestrador)
  genetics/  service (summarizeGeneticReport) · ocr · parser · prompts   ← DORMENTE (não plugado)
```

- `resolveProvider(capability)` escolhe o provider por configuração (`AI_PROVIDER`,
  `AI_PROVIDER_FALLBACK`, default `mock`) e negocia capacidade; hoje só o `MockProvider`
  existe — **nenhum provider real, nenhum SDK de IA nas dependências.**
- A **Triagem Digital Assistiva** roda uma **pipeline de 18 etapas** (`lib/ai/behavioral/
  pipeline/`): ingestão → frames → pré-processamento → detecção da criança → rastreamento
  facial → rastreamento ocular → head pose → expressões → piscar → resposta a estímulos →
  movimento corporal → agregação temporal → vetor de features → qualidade da coleta →
  confiança → explicabilidade → fusão com M-CHAT → resultado estruturado. Cada etapa tem
  interface própria (`PipelineStage<I,O>`) e implementação **Mock determinística**, trocável
  futuramente por MediaPipe/OpenFace/OpenCV/YOLO/PyTorch sem alterar o orquestrador.
- Toda chamada de IA registra auditoria operacional (sem PII) em `ai_requests`.
- IA é **assistiva**: resultados **nunca fecham diagnóstico**; avisos obrigatórios sempre.
- Ver ADRs `0003-arquitetura-de-ia-provider-agnostic.md` e `0006-sem-provider-real-de-ia.md`.

## Fluxo de triagem (Triagem Digital Assistiva)

1. `requireRole(["admin","responsavel","profissional"])` em
   `app/app/triagem/comportamental/page.tsx`; `listChildren()` popula o seletor.
2. Cliente (`components/app/behavioral-screening.tsx`) coleta criança + consentimento +
   mídia (vídeo até 60s ou foto) + duração/timestamps de estímulos → `FormData`.
3. Server Action `createDigitalScreening` (`lib/actions/screening.ts`):
   valida → `uploadScreeningMedia` (bucket privado) → lê bytes server-side →
   `analyzeBehavioralScreening` (MockProvider, via pipeline) → grava
   `digital_screening_sessions`, `behavioral_signals`, fusão em `screening_fusions` (se houver
   M-CHAT) e auditoria em `ai_requests` → devolve resultado estruturado. Falha de IA grava
   sessão `status='erro'` + auditoria `success=false`.
4. A UI exibe qualidade, risco, confiança, sinais, explicabilidade, fusão e recomendação,
   com avisos obrigatórios. **Resultado é mock determinístico.**

## Fluxo de upload (genérico)

1. Client envia `FormData` com `childId`, `consent` e `file` à Server Action.
2. `lib/storage/index.ts` valida MIME/extensão/tamanho e monta caminho `<child_id>/<uuid>.<ext>`.
3. Upload no bucket privado; o registro (ex.: `uploaded_documents`, `facial_analyses`,
   `digital_screening_sessions`) guarda o caminho.
4. Leitura/download só por **URL assinada temporária** gerada server-side.

## Deploy

- Build: `npm ci && npm run lint && npm run typecheck && npm run build`. Alvo recomendado:
  **Vercel** (frontend/Server Actions) + **Supabase** (dados/auth/storage).
- Sem CI/CD de deploy automático. Há um **quality-gate** em GitHub Actions
  (`.github/workflows/quality-gate.yml`) rodando lint/typecheck/build.
- SQL aplicado manualmente; primeiro admin promovido por SQL. Ver `DEPLOY.md`.
