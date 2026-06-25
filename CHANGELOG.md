# Changelog

Todos os marcos relevantes do projeto.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/).

## [Não lançado] — Fase 3 · Pipeline de processamento comportamental (arquitetura)

Refatora a Triagem Digital Assistiva numa **pipeline de 18 etapas independentes**, alinhada
ao fluxo de fenotipagem comportamental digital do artigo da Nature Medicine (2023). Apenas
a **arquitetura** + implementações **Mock determinísticas** — sem provider real, sem
alterar banco/Storage/UI/rotas. `facial_analyses` intacta.

### Adicionado (`lib/ai/behavioral/pipeline/`)
- **`types.ts`** — contratos tipados entre etapas (`PipelineStage<I,O>`, `VideoSource`,
  `FrameSet`, `PreprocessedFrameSet`, `ChildDetection`, `FaceTracks`, `SignalSeries`,
  `SignalStageResult`, `AggregatedSignals`, `FeatureVector`, `BehavioralPipelineResult`...).
- **`series.ts`** — gerador determinístico de séries temporais por sinal.
- **18 etapas** em `pipeline/stages/`, cada uma com interface própria e classe `Mock*`:
  ingest, frames, preprocess, detect-child, track-face, track-eyes, head-pose, expressions,
  blink, response, body-movement, temporal-aggregate, feature-vector, capture-quality,
  confidence, explainability, fusion, result. Nenhuma depende de provider; cada uma é
  trocável por MediaPipe/OpenFace/OpenCV/YOLO/PyTorch sem afetar o restante.
- **`pipeline/index.ts`** — orquestrador `runBehavioralPipeline` (contrato público) e
  `runBehavioralPipelineDetailed` (com vetor de features, séries e qualidade da coleta).

### Alterado
- **`lib/ai/providers/mock.ts`** — `behavioralScreening` passa a **delegar à pipeline**
  (remove a composição inline); reaproveita features/aggregate/explain/capture-quality como
  implementação interna das etapas (fonte única).
- **`lib/ai/index.ts`** — exporta `runBehavioralPipeline`, `runBehavioralPipelineDetailed`
  e os tipos `PipelineStage`/`PipelineContext`/`BehavioralPipelineResult`.
- **`CONTEXT.md`** — documenta a pipeline.

## [Não lançado] — Fase 3 · Triagem Digital Assistiva (UI)

Tela premium da Triagem Digital Assistiva, consumindo a Server Action
`createDigitalScreening` (MockProvider). Sem provedor real; sem alterar banco/Storage;
`facial_analyses` intacta.

### Adicionado
- **`app/app/triagem/comportamental/page.tsx`** — rota da Triagem Digital Assistiva
  (Server Component com `requireRole` + `listChildren`).
- **`components/app/behavioral-screening.tsx`** — client: seleção de criança,
  consentimento, upload de vídeo curto (até 60s) ou foto, detecção/edição da duração do
  vídeo e timestamps de estímulos (chamada pelo nome / visual). Exibe qualidade da coleta,
  recomendação de repetir coleta, sinais (indicadores + confiança + nota), score de risco,
  confiança da predição, nível de risco, explicabilidade, fusão com M-CHAT (quando existe)
  e recomendação de encaminhamento. Usa Cards, Badge, Progress, Framer Motion, Toasts,
  EmptyState e os **avisos obrigatórios** de triagem (não é diagnóstico, não substitui
  avaliação profissional, interpretar por profissional habilitado, repetir coleta se a
  qualidade for baixa).

### Alterado
- **`lib/navigation.ts`** — item "Triagem Digital Assistiva" no grupo Triagem.
- **`components/app/icon.tsx`** — ícone `Video`.
- **`lib/actions/screening.ts`** — `createDigitalScreening` passa a ler os timestamps de
  estímulos (`nameCallMs`/`visualMs`) do `FormData` (fallback de chamada pelo nome em vídeo).
- **`CONTEXT.md`** — documenta a tela.

## [Não lançado] — Fase 3 · Triagem Digital Assistiva (conexão banco/storage — backend)

Liga o domínio comportamental (mock) ao banco e ao Storage. **Backend/actions/storage —
sem UI, rota ou provedor real.** `facial_analyses` permanece intacta.

### Adicionado
- **`lib/storage/index.ts`** — bucket `screening-media` na config de upload
  (`uploadScreeningMedia`): vídeo (mp4/webm/mov) ou foto, até **50 MB**.
- **`lib/db/queries.ts`** — leituras tipadas: `listDigitalScreeningSessions`,
  `getDigitalScreeningSession`, `listBehavioralSignals(sessionId)`,
  `listScreeningFusions` e `listAiRequests` (RLS restringe `ai_requests` a admin).
- **`lib/actions/screening.ts`** — Server Action `createDigitalScreening(form)`:
  valida criança/consentimento/mídia (vídeo até **60 s** quando a duração é informada;
  foto como fallback) → upload em `screening-media` → `analyzeBehavioralScreening`
  (MockProvider) → grava `digital_screening_sessions`, `behavioral_signals`, a fusão com o
  M-CHAT mais recente em `screening_fusions` (se houver) e a auditoria em `ai_requests`
  (metadados operacionais, sem PII) → retorna resultado estruturado. Falha de IA grava
  sessão com `status='erro'` e auditoria `success=false`.

### Alterado
- **`CONTEXT.md`** — documenta a conexão backend da Triagem Digital Assistiva.

## [Não lançado] — Fase 3 · Triagem Digital Assistiva (domínio comportamental — mock)

Implementação funcional do domínio comportamental em `lib/ai/behavioral/`, exercitando o
pipeline ponta a ponta com o **MockProvider** (determinístico, sem chave/custo/IA real).
**Sem UI, rota, Server Action, processamento de vídeo ou provedor real.** Linguagem
estritamente de triagem (triagem, sinais, indicadores, risco, encaminhamento).

### Implementado
- **`features/landmarks.ts`** — extração de landmarks (determinística a partir dos bytes
  da mídia) + helpers `frac`/`round2`; base geométrica dos demais sinais.
- **6 features → 6 sinais:** `gaze` (olhar), `headpose` (head_movement), `expressions`
  (facial_expression), `response` (response_to_name, usa `stimuli`), `blink` (blink_rate,
  só vídeo), `motor` (motor_behavior, só vídeo).
- **`aggregate.ts`** — `deriveSocialAttention` (7º sinal, composto de olhar + cabeça) e
  `aggregateSignals` (risco ponderado pela confiança + confiança da predição limitada pela
  qualidade da coleta) com `levelFromScore`.
- **`capture-quality.ts`** — porteiro do pipeline: score de qualidade + `recaptureRequired`
  (repetir coleta se baixa) e motivos legíveis.
- **`explain.ts`** — explicabilidade: destaca os sinais que mais elevaram o risco de triagem.
- **`parser.ts`** — valida `schemaVersion`, faixas [0,1] e enums; converte divergências em
  `AIValidationError`.
- **`service.ts`** — orquestra: qualidade (porteiro, não chama IA se baixa) → provedor
  (Mock) → validação; sempre retorna `Result`, nunca lança.
- **`fusion.ts`** — fusão comportamental + M-CHAT (adota o maior risco por prudência;
  concordância eleva a confiança), com os casos só-comportamental, só-M-CHAT e sem dados.
- **`providers/mock.ts`** — refatorado para **delegar** aos módulos do domínio (uma única
  implementação do pipeline), removendo a geração de sinais inline.

## [Não lançado] — Fase 3 · Triagem Digital Assistiva (base de banco e storage)

Base de dados e Storage da **Análise Comportamental Digital** (fenotipagem por vídeo +
M-CHAT; triagem assistiva, **nunca diagnóstico**). Apenas a fundação — **sem UI, rota,
Server Action, processamento de vídeo ou chamada de IA**.

### Adicionado
- **`supabase/screening_digital.sql`** — SQL aditivo e idempotente (rodar após
  `storage.sql`), que **não altera `facial_analyses`** (mantida como legado) e reaproveita
  `can_access_child()`, `is_admin()` e `storage_child_id()`:
  - Tabelas `digital_screening_sessions` (coleta vídeo/foto + metadados de IA),
    `behavioral_signals` (sinais comportamentais — explicabilidade), `screening_fusions`
    (fusão com M-CHAT) e `ai_requests` (auditoria operacional de IA, sem PII/texto bruto).
  - **RLS:** `digital_screening_sessions`, `behavioral_signals` e `screening_fusions`
    usam `can_access_child(child_id)`; `ai_requests` é exclusiva de **admin**
    (`is_admin()`). Nada público.
  - **Bucket privado `screening-media`** (vídeo/foto), caminho `<child_id>/<uuid>.<ext>`,
    com 4 policies (select/insert/update/delete) reusando `can_access_child()`.
  - Índices em `child_id`/`session_id`/`created_at`.
- **`lib/db/types.ts`** — tipos das novas tabelas (`DigitalScreeningSessionRow`,
  `BehavioralSignalRow`, `ScreeningFusionRow`, `AiRequestRow`) + uniões auxiliares
  (`DigitalScreeningStatus`, `ScreeningRecommendation`).

### Alterado
- **`CONTEXT.md`** e **`DATABASE.md`** — documentam as novas tabelas, RLS, bucket e a
  ordem de execução do SQL.

## v1.0 — Fundação concluída — 2026-06-25

Esta versão marca a **consolidação da fundação completa do NexisX**: encerra o ciclo de
construção da base (Fases 1, 2 e 2.5) e a camada de governança documental, deixando o
projeto pronto para evoluir na Fase 3. Tag: `v1.0-foundation`. Ver `RELEASE.md` para o
documento de release oficial.

### Principais marcos
- **Arquitetura consolidada** — Next.js 14 (App Router), route groups público/protegido,
  camada de dados isolada (queries + Server Actions com `ActionResult`).
- **Design System completo** — tokens HSL, escala de elevação, superfícies, tipografia
  fluida, biblioteca de componentes acessíveis (Radix) e microinterações (Framer Motion)
  com respeito a `prefers-reduced-motion`.
- **Portal institucional** — site público premium (home, sobre, salas sensoriais, DNA,
  famílias, profissionais, escolas/clínicas, contato) com mockups feitos em código.
- **Plataforma de Triagem** — M-CHAT funcional (sessões + respostas + relatório) e análise
  facial com upload real (resultado ainda simulado).
- **Acompanhamento** — crianças/perfil, linha do tempo, tarefas/rotina, diário dos pais,
  relatórios evolutivos.
- **DNA / Exoma** — solicitação de exames e laudos (upload seguro).
- **Salas Sensoriais** — página pública + gestão de solicitações comerciais (lead público).
- **Administração** — dashboard com indicadores reais; gestão de responsáveis,
  profissionais, escolas e usuários.
- **Supabase configurado** — Auth, PostgreSQL e Storage integrados via `@supabase/ssr`.
- **RLS** — habilitado em todas as tabelas; `can_access_child()` como centro da autorização.
- **Storage** — buckets privados + acesso só por URL assinada temporária.
- **Autenticação** — papéis em `profiles`, triggers de segurança, defesa em 3 camadas.
- **Governança documental** — `HANDOFF.md`, `AI_CONTEXT.md`, `PROJECT_RULES.md` e
  `VISION.md` consolidando contexto, regras permanentes e visão de produto.
- **Deploy documentado** — `DEPLOY.md` com variáveis, ordem dos SQLs e checklists de RLS.

### Adicionado
- **`RELEASE.md`** — documento de release oficial do fechamento da Fundação.

### Alterado
- **`README.md`** — nova seção **Estado do Projeto** (Fundação v1.0 concluída → Fase 3).

## [Não lançado] — Documentação de visão de produto

### Adicionado
- **`VISION.md`** — documento de visão de empresa e produto (não trata de código): missão,
  visão de 5 anos, valores, públicos, posicionamento premium, experiência desejada,
  filosofia de UX (referências de qualidade: Stripe, Linear, Notion, Vercel, Raycast),
  filosofia de IA (assistiva, nunca substitui profissionais), produtos do ecossistema,
  roadmap estratégico, regras inquebráveis e como qualquer IA deve pensar ao trabalhar no
  NexisX.

### Alterado
- **`README.md`** — seção Documentação passa a listar `VISION.md`.
- **`CLAUDE.md`** — a leitura obrigatória antes de qualquer tarefa passa a incluir
  `VISION.md`.

## [Não lançado] — Documentação de handoff e governança

### Adicionado
- **`HANDOFF.md`** — handoff técnico completo do projeto (visão geral, estado atual,
  histórico via Git, banco/RLS/Storage, fluxos, arquitetura front/back, UX/UI, segurança,
  deploy, pendências, dívida técnica, roadmap e regras para continuidade por outra IA).
- **`AI_CONTEXT.md`** — contexto técnico essencial em formato de briefing (leitura < 5 min).
- **`PROJECT_RULES.md`** — a "constituição" do NexisX: regras permanentes de arquitetura,
  stack, convenções, Git, documentação, segurança, auth/permissões, Supabase/RLS/Storage,
  UX/UI, design system, motion, IA e regras por módulo (triagem, DNA, análise facial,
  M-CHAT, salas sensoriais, acompanhamento), além do que nunca deve ser alterado sem
  justificativa.

### Alterado
- **`README.md`** — seção Documentação passa a listar `AI_CONTEXT.md`, `HANDOFF.md` e
  `PROJECT_RULES.md`.
- **`CLAUDE.md`** — nova regra de **leitura obrigatória** antes de qualquer alteração
  (`README`, `AI_CONTEXT`, `HANDOFF`, `CONTEXT`, `CHANGELOG`, `DATABASE`, `DEPLOY`);
  nenhuma implementação deve começar antes dessa leitura.

## [Não lançado] — Fase 2.5 · Onda 5 (site público premium)

### Mockups em código (sem imagens externas)
- `DashboardMockup` e `FloatingChip` — mockup do produto construído com Tailwind/tokens.

### Home
- **Hero** redesenhado em duas colunas: texto + CTA + indicadores, e **mockup flutuante**
  do produto com chips, sobre o `ParticleField` (Canvas 2D) e `gradient-mesh`.
- Nova seção **Jornada NexisX** (`Journey`) — timeline de 8 etapas (cadastro → análise
  facial → M-CHAT → relatório → DNA → sala sensorial → acompanhamento → tarefas/jogos)
  com reveal animado.
- Nova seção **Como funciona a triagem** (`TriagemExplainer`) — explica o ambiente
  seguro com login e as 3 etapas, com **avisos obrigatórios** (não é diagnóstico).
- Nova seção **Credibilidade** (`Credibility`) — "Projetado para famílias/profissionais/
  escolas/clínicas" + "LGPD by design / Dados protegidos / Acesso por perfil". Sem
  depoimentos ou clientes inventados.

### Páginas
- **Salas Sensoriais:** galeria com sensação de luz/fibra óptica/LED em código
  (glows pulsantes, "fibras" luminosas e pontos de LED flutuantes).
- **DNA / Exoma:** diagrama de fluxo `GeneticsFlow` (laudo → organização → resumo para
  família → resumo técnico), responsivo.

> Movimento com moderação, respeitando `prefers-reduced-motion`. Sem imagens/assets
> externos, sem tocar na plataforma interna, auth, banco, Storage ou roles.

## [Não lançado] — Fase 2.5 · Onda 4 (plataforma premium e microinterações)

### Dashboard reorganizado
- **Métrica principal em destaque** (`FeaturedStat` com gradiente, shimmer e counter
  animado) + métricas secundárias com `StatCard` (counters animados, hover com escala
  do ícone).
- **Atividade recente** com ícone por tipo de evento, hover refinado e stagger de entrada;
  empty state mais elegante.

### Microinterações (Framer Motion, respeitando reduced-motion)
- Novos primitivos `MotionList`/`MotionItem` (stagger no mount) e `AnimatedCounter`
  (conta ao entrar em tela, via IntersectionObserver).
- **Lista de crianças** com stagger + hover premium (lift, borda, escala do avatar).
- **Tarefas:** entrada animada dos cards, hover de borda, e **check com spring** ao
  concluir (texto riscado + selo "Concluída").
- **M-CHAT:** ícone de conclusão com animação spring.

### Listas internas (complemento)
- Stagger + hover refinado também em **laudos/documentos** (`DocumentsList`),
  **relatórios de triagem** e **jogos** (grade de categorias).

> Sem funcionalidade nova, IA, PDF, banco, Storage, auth ou alteração do site público.

## [Não lançado] — Fase 2.5 · Onda 3 (biblioteca de componentes premium)

### Componentes acessíveis (Radix UI + tokens da Onda 1)
- Novos: **Select, Dialog, Sheet, Tooltip (+ `InfoTooltip`), Tabs, Avatar, Separator**.
- Dependências adicionadas: `@radix-ui/react-{select,dialog,tooltip,tabs,avatar,separator}`.

### Migrações
- **Todos os `<select>` nativos** trocados pelo `Select` premium (tarefas, diário,
  análise facial, exames genéticos, uploads de laudo/documento).
- **Solicitação de exame genético** virou **Dialog** (apresentação mais limpa, foco preso,
  ESC/overlay para fechar).
- **Perfil da criança** reorganizado com **Tabs** (Visão geral · Linha do tempo ·
  Documentos) + **Avatar** no cabeçalho; lista de crianças e topbar usam **Avatar**.
- **Tooltip** no botão de sair (ícone) e **Separator** no topbar.

### Acessibilidade
- Navegação por teclado e foco preso nos overlays (Radix), `aria-label` em ícones,
  foco visível consistente, `prefers-reduced-motion` respeitado. Sem warnings de build.

> Sem funcionalidade nova, IA, PDF, banco, Storage ou mudança de identidade visual.

## [Não lançado] — Fase 2.5 · Onda 2 (estados, feedback e transições)

### Infraestrutura de feedback
- **`Skeleton`** (varredura sutil) + **`LoadingState`** com composições reutilizáveis
  (`HeaderSkeleton`, `StatGridSkeleton`, `CardGridSkeleton`, `ListSkeleton`).
- **`loading.tsx`** por segmento: `/app` (stats), `/app/criancas` (cards),
  `/app/triagem` (list) e `(site)` (hero) — fim da sensação de tela travada.
- **`ErrorState`** + **`error.tsx`** em `/app` e `(site)` e **`global-error.tsx`** —
  erros elegantes, com "Tentar novamente" e "Voltar", sem expor stack trace.
- **Toaster global** (`ToastProvider`/`useToast`, Framer Motion) com sucesso/erro/aviso/
  info; montado no layout raiz; fallback seguro fora do provider.
- **Transição de página** (`app/app/template.tsx`) discreta e rápida, respeitando
  `prefers-reduced-motion`.

### Feedback integrado às ações
- Toasts de sucesso/erro em: criar/concluir tarefa, diário, solicitação de sala
  (contato), solicitação de exame genético, upload de laudo, upload de documento,
  análise facial e M-CHAT. Botões já bloqueiam duplo clique via `useTransition`.

## [Não lançado] — Fase 2.5 · Onda 1 (design tokens & fundação premium)

### Design tokens
- **Escala de elevação** (`--shadow-1..4`, sombras multicamada suaves) + utilitários
  `elevation-1..4` e tokens Tailwind `shadow-elevation-1..4`.
- **Escala de radius** (`--radius-sm/md/lg/xl`) e **superfícies** (`--surface`,
  `--surface-elevated`) para hierarquia de planos.
- **Contraste/acessibilidade:** `--muted-foreground` mais escuro (AA ~5:1), `--input`
  com borda mais visível, ajuste fino de primary/secondary/accent/destructive.
- **Foco de teclado global** (`:focus-visible` com anel consistente) e respeito a
  `prefers-reduced-motion`.

### Utilitários premium
- `surface-card`, `surface-panel`, `glass-card`, `gradient-border`, `text-balance`,
  `text-pretty`, tipografia fluida (`heading-xl/lg/md`), `section-spacing`,
  `container-premium`.

### Componentes base
- **Card** com elevação resting (`shadow-elevation-1`) e transição suave.
- **Button** com sombras de elevação (menos "colorido pesado").
- **Input/Textarea** com hover de borda + anel de foco refinado.
- **Badge** com contraste melhor (success/warning AA, inclusive dark) e borda sutil.
- **PageHeader** com `heading-md` + descrição `text-pretty`.
- **EmptyState** com ícone decorativo e ação opcional; **StatCard** com hover de elevação.

> Mudanças de acabamento — sem redesenhar páginas, sem alterar marca, banco, auth ou Storage.

## [Não lançado] — Fase 2 · Bloco E (hardening e preparação para deploy)

### Conectado (mocks removidos)
- **Responsáveis, Profissionais, Escolas** — listas reais (`guardians`, `professionals`,
  `schools`) com empty states.
- **Usuários** — perfis reais (`profiles`) com papel e escopo; query `listProfiles()`.
- **Relatórios de triagem** — lista real de `screening_reports` (nome da criança +
  prioridade + recomendação), com aviso obrigatório e empty state.
- **Relatórios evolutivos** — agregações reais (tarefas por status, registros do diário);
  removidos números/tendências fabricados.

### Hardening
- Novo componente `EmptyState` — empty states padronizados.
- `configuracoes` marcada como não-persistente (recurso futuro), sem dados fabricados.
- Removido tipo morto `Child` em `lib/types.ts` (uso consolidado em `ChildRow`).
- Confirmado: `demoProfile` só em dev; rotas restritas com `requireRole`; nenhum dado
  sensível hardcoded (senha do seed é dev-only e documentada).

### Documentação
- Novo **`DEPLOY.md`**: variáveis obrigatórias, ordem dos SQLs, checklist de aplicação
  no Supabase, checklist de teste de RLS com 2 contas, comandos de deploy e o que ainda
  é protótipo (não levar a produção sem integração real).

### Ainda protótipo (documentado no DEPLOY.md)
- Resultado de IA da análise facial, exportação PDF, resumos de genética, jogos
  (`game_sessions`), visão geral da triagem (guia estático), persistência de configurações
  e fluxo de convite de usuários.

## [Não lançado] — Fase 2 · Bloco D (Supabase Storage)

### Adicionado
- **`supabase/storage.sql`** — buckets privados `facial-photos`, `genetic-reports`,
  `child-documents` + policies de `storage.objects` (select/insert/update/delete) que
  reaproveitam `can_access_child()` via `storage_child_id()` (1º segmento do caminho =
  `child_id`). Mesmo escopo por papel do RLS das tabelas.
- **`lib/storage/index.ts`** — camada de upload: `uploadFacialPhoto`, `uploadGeneticReport`,
  `uploadChildDocument`, `getSignedFileUrl`, `deleteFileIfAllowed`. Valida tipo (MIME),
  extensão, tamanho máximo (8 MB fotos / 20 MB laudos e documentos), caminho seguro
  (`<child_id>/<uuid>.<ext>`) e autenticação.
- **`lib/actions/uploads.ts`** — Server Actions (FormData): `submitFacialAnalysis`,
  `uploadGeneticReportDoc`, `uploadChildDocumentDoc`. Fazem upload e registram em
  `facial_analyses` / `uploaded_documents`.
- Componentes **`FileUploader`** (client) e **`DocumentsList`** (server, gera URLs
  assinadas temporárias — nunca públicas).

### Conectado
- **Triagem › Análise facial** — upload REAL da foto (bucket `facial-photos`),
  `storage_path` salvo em `facial_analyses`; preview local antes do envio; resultado
  **ainda simulado** (sem IA).
- **Laudos** — upload de laudo (PDF/imagem) → `genetic-reports` + `uploaded_documents`,
  com lista e download via URL assinada.
- **Perfil da criança › Documentos** — upload geral (relatórios médicos/escolares,
  avaliações, complementares) → `child-documents` + lista segura.

### Removido
- `lib/actions/facial.ts` (registro sem upload) — substituído por `submitFacialAnalysis`.

## [Não lançado] — Fase 2 · Bloco C (conexão de telas reais)

### Conectado ao Supabase (mocks removidos)
- **Dashboard** — contadores reais (crianças, triagens, em acompanhamento, tarefas
  concluídas, solicitações de sala, exames, laudos/documentos, relatórios pendentes) +
  atividade recente da linha do tempo; empty states quando vazio.
- **Crianças** — lista e perfil reais (idade calculada, diário recente, linha do tempo,
  contagem de tarefas/relatórios) com `notFound()` e empty states.
- **Linha do tempo** — eventos reais (`neuro_timeline_events`).
- **Tarefas** — leitura real + criação e conclusão via Server Actions (com pontuação,
  papéis e atualização via `router.refresh()`).
- **Diário dos pais** — leitura real + criação via Server Action.
- **Solicitações comerciais / Salas sensoriais (admin)** — listas reais de
  `sensory_room_requests`. **Formulário público de contato** agora grava lead real.
- **Exames genéticos** — criação via Server Action + lista real.
- **Triagem** — M-CHAT salva `mchat_sessions` + `mchat_answers` e gera
  `screening_reports` (quando profissional/admin). Análise facial registra estrutura
  mínima em `facial_analyses` (consentimento + resultado), **ainda sem upload de imagem**.

### Adicionado
- `lib/age.ts` (cálculo de idade), `countRows()` em `lib/db/queries.ts`,
  `lib/actions/facial.ts` (registro mínimo, sem Storage).
- `Timeline` refatorado para receber eventos via props.

### Ainda mockado (intencional — próximas fases)
- Relatórios evolutivos, visão geral da triagem, detalhe do relatório de triagem,
  jogos (protótipo, sem `game_sessions`), tabelas admin (responsáveis, profissionais,
  escolas, usuários) e configurações. Upload de fotos/laudos depende do Storage (Bloco D).

## [Não lançado] — Fase 2 · Bloco B (camada de dados e Server Actions)

### Adicionado
- **`lib/db/types.ts`** — tipos das linhas de todas as tabelas (fonte única de tipos do banco).
- **`lib/db/queries.ts`** — camada de leitura tipada por entidade (children, guardians,
  professionals, schools, tasks, task_completions, parent_diary_entries,
  neuro_timeline_events, sensory_room_requests, genetic_exam_requests, uploaded_documents,
  screening_reports, mchat_sessions, facial_analyses). As páginas não chamam o Supabase
  diretamente; leituras toleram falha (RLS/sem config → lista vazia).
- **`lib/validation.ts`** — validação leve (texto obrigatório, UUID, data, faixa de inteiro,
  enum) + tipo `ActionResult`.
- **`lib/actions/*`** — Server Actions de escrita: criar/atualizar criança, criar entrada
  de diário, criar tarefa, concluir tarefa, criar solicitação de sala sensorial, criar
  solicitação de exame genético, salvar sessão M-CHAT, salvar respostas M-CHAT e salvar
  relatório preliminar de triagem. Cada action valida input e papel (`getActor`) e
  retorna `ActionResult` (erros tratados, nunca vazam stack).
- **`supabase/seed.sql`** — dados de desenvolvimento (admin, responsável, profissional,
  escola, 2 crianças, vínculos, tarefas, diário, timeline e solicitações).

> As telas ainda consomem mocks — a conexão à camada de dados é o Bloco C.

## [Não lançado] — Fase 2 · Bloco A (segurança de auth/roles)

### Segurança
- **Trigger `handle_new_user()`**: o papel no signup agora é **sempre `responsavel`** —
  nunca lido de `raw_user_meta_data` (evita escalonamento de privilégio pelo cliente).
- **Nova trigger `enforce_role_change()`**: bloqueia troca do próprio `role` em `profiles`
  por quem não é admin; promoção só por admin ou service_role.
- **`lib/auth.ts`**: o perfil "demo" (admin) passa a existir **apenas em desenvolvimento**.
  Em produção, sem sessão/perfil real ou em erro de Supabase, retorna `null` (a área
  protegida redireciona para `/login`). Papel lido só de `profiles`, nunca de `user_metadata`.
- **Novo `lib/guard.ts`** com `requireSession()` e `requireRole(roles[])`.
- **Proteção de rota por papel** aplicada (defesa em profundidade além do RLS) em:
  usuários, configurações, responsáveis, profissionais, escolas, solicitações,
  salas sensoriais (comercial), laudos e exames genéticos. Acesso por URL direta de
  um papel não autorizado agora redireciona para `/app`.

## [0.1.0] — 2026-06-24

### Adicionado
- Estrutura inicial do projeto (Next.js 14, TypeScript, Tailwind, Framer Motion, Supabase).
- **Site público:** Home (hero com Canvas 2D + partículas), Sobre, Salas Sensoriais
  (galeria animada), DNA/Exoma, Para Famílias, Para Profissionais, Escolas e Clínicas, Contato.
- **Autenticação:** página de Login com Supabase Auth e proteção de rotas via middleware.
- **Triagem:** visão geral (fluxo de 10 etapas), análise facial assistida (upload +
  consentimento + resultado), M-CHAT funcional (20 itens, progresso, salvamento
  automático, classificação de risco) e relatório de triagem.
- **Acompanhamento:** crianças/perfil completo, linha do tempo, tarefas (board com
  pontuação), jogos (grade + jogo da memória), diário dos pais, relatórios evolutivos.
- **Genética:** exames e laudos. **Comercial:** salas sensoriais e solicitações.
- **Administração:** dashboard com indicadores e gráficos; responsáveis, profissionais,
  escolas, usuários/permissões e configurações.
- **Banco de dados:** `schema.sql` (25+ tabelas, tipos, triggers, funções) e
  `schema_rls.sql` (RLS por papel).
- **Design system:** componentes estilo shadcn, tokens de tema, keyframes Tailwind
  (float, shimmer, gradient-pan) e utilitários (glass, gradient-mesh, text-gradient).
- Documentação: README, CLAUDE, CONTEXT, PRODUCT, DATABASE e `.env.example`.
