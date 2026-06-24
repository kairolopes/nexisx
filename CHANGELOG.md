# Changelog

Todos os marcos relevantes do projeto.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/).

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
