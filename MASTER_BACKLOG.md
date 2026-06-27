# MASTER_BACKLOG.md — Backlog Mestre do Produto
# Portal NexisX

> Fonte única de verdade para o trabalho a ser feito. Todo item a ser
> implementado deve existir aqui antes de entrar num sprint. Itens sem
> ID neste documento não devem ser desenvolvidos.
> Autor: CTO/PIO — 2026-06-26
> Referência cruzada: FEATURE_MATRIX.md (classificação), PRODUCT_ROADMAP.md (versões)

---

## Legenda

**Status:** 🟢 Concluído · 🔵 Em progresso · ⚪ A fazer · 🔴 Bloqueado · 🟡 Em revisão
**Prioridade:** MVP · P0 · P1 · P2 · Futuro
**Esforço:** XS (<4h) · S (1-2d) · M (3-5d) · L (1-2sem) · XL (>2sem)
**Risco:** 🔴 Alto · 🟡 Médio · 🟢 Baixo

---

## Sprint 0 — Estabilização (pré-MVP)

> Objetivo: garantir que o que existe está correto e commitado antes
> de construir qualquer coisa nova.

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-001 | Commitar entrega P0.1: logger + testes + remotePatterns + package.json | MVP | 🟢 | 🟢 | XS | DevOps | MVP | — |
| B-002 | Rodar `npm run test` e confirmar 39/39 passando | MVP | 🟢 | 🟢 | XS | QA | MVP | B-001 |
| B-003 | Validar E2E Triagem Digital no Supabase real (criar criança → enviar coleta → confirmar 4 tabelas + Storage) | MVP | 🔴 | 🟡 | S | Triagem | MVP | B-001 |
| B-004 | Push para `origin/main` e confirmar CI verde | MVP | 🟢 | 🟢 | XS | DevOps | MVP | B-002, B-003 |
| B-005 | Adicionar `AI_PROVIDER` e `AI_PROVIDER_FALLBACK` ao `.env.example` | MVP | 🟢 | 🟢 | XS | DevOps | MVP | B-001 |

---

## Sprint 1 — Integridade do produto (MVP bloqueadores éticos)

> Objetivo: remover tudo que mente ou não funciona antes de qualquer
> cliente ver o sistema.

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-010 | **Remover resultado mock da análise facial da UI de produção** | MVP | 🟢 | 🔴 | XS | Triagem | MVP | B-004 |
| B-011 | Exibir mensagem "análise pendente de avaliação profissional" no lugar do resultado | MVP | 🟢 | 🟢 | XS | Triagem | MVP | B-010 |
| B-012 | Adicionar badge "Preview Científico / Modelo Demonstrativo" na Triagem Digital Assistiva | MVP | 🟢 | 🟢 | XS | Triagem | MVP | B-004 |
| B-013 | Remover grade de 7 categorias de jogos "fantasmas" (sem implementação) | MVP | 🟢 | 🟢 | XS | Jogos | MVP | B-004 |
| B-014 | Desabilitar botão "Salvar alterações" das Configurações (ou conectá-lo — ver B-040) | MVP | 🟢 | 🟢 | XS | Config | MVP | B-004 |

**Nota CTO sobre B-010/B-011:** Esta é a mudança mais urgente do projeto. Um profissional
que vê "Atenção moderada" para qualquer foto sem entender que é mock pode tomar decisões
clínicas erradas. Prioridade absoluta acima de qualquer feature nova.

---

## Sprint 2 — Operabilidade (MVP core)

> Objetivo: admin consegue onboardar cliente sem SQL.

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-020 | **Fluxo de convite: admin digita e-mail → Supabase envia convite → convidado cria conta** | MVP | 🟢 | 🔴 | M | Usuários | MVP | B-004 |
| B-021 | Página de aceite do convite (token → criar senha → redirecionar para /app) | MVP | 🟢 | 🟡 | S | Usuários | MVP | B-020 |
| B-022 | UI de promoção de papel: admin seleciona usuário → altera papel → salva via service_role | MVP | 🟢 | 🔴 | S | Usuários | MVP | B-020 |
| B-023 | Formulário de cadastro de profissional (nome, especialidade, CRM) | MVP | 🟢 | 🟢 | S | Admin | MVP | B-004 |
| B-024 | Formulário de cadastro de responsável (nome, relacionamento, contato) | MVP | 🟢 | 🟢 | S | Admin | MVP | B-004 |
| B-025 | Formulário de cadastro de escola (nome, cidade, e-mail de contato) | MVP | 🟢 | 🟢 | S | Admin | MVP | B-004 |
| B-026 | UI de vinculação profissional ↔ criança (select + confirmar) | MVP | 🟢 | 🟡 | M | Admin | MVP | B-023 |
| B-027 | UI de vinculação escola ↔ criança (select + autorização toggle) | MVP | 🟢 | 🟡 | M | Admin | MVP | B-025 |
| B-028 | Confirmação de e-mail: testar e validar fluxo completo no Supabase (configuração) | MVP | ⚪ | 🟡 | S | Auth | MVP | B-004 |

---

## Sprint 3 — Artefatos de valor (MVP entrega)

> Objetivo: o produto entrega documentos reais que a família pode usar.

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-030 | **Instalar e configurar biblioteca de PDF** (`@react-pdf/renderer` ou `puppeteer`) | MVP | 🟢 | 🟡 | S | Infra | MVP | B-004 |
| B-031 | **Template de PDF do relatório M-CHAT** (criança, score, risco, recomendações, aviso legal, data) | MVP | 🟢 | 🟡 | M | Relatórios | MVP | B-030 |
| B-032 | Route `/api/reports/mchat/[id].pdf` que gera e serve o PDF com autorização | MVP | 🟢 | 🟡 | M | Relatórios | MVP | B-031, B-020 |
| B-033 | Botão "Baixar PDF" na tela de resultado do M-CHAT | MVP | 🟢 | 🟢 | XS | Relatórios | MVP | B-032 |
| B-034 | Botão "Baixar PDF" na lista de relatórios de triagem | MVP | 🟢 | 🟢 | XS | Relatórios | MVP | B-032 |
| B-035 | UI de criação de evento na Linha do Tempo (botão + modal com campos) | MVP | 🟢 | 🟢 | S | Acompanhamento | MVP | B-004 |
| B-036 | Persistência de `game_sessions`: salvar score + fase ao concluir partida | MVP | 🟢 | 🟢 | S | Jogos | MVP | B-004 |
| B-037 | Exibir histórico de sessões no perfil da criança (tab Jogos) | MVP | 🟢 | 🟢 | S | Jogos | MVP | B-036 |

---

## Sprint 4 — Configurações e polish (MVP finalização)

> Objetivo: zero estados quebrados antes do piloto.

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-040 | **Tabela `settings` no banco (org_id, key, value, updated_at)** | MVP | 🟢 | 🟡 | S | Banco | MVP | B-004 |
| B-041 | Server Action `upsertSetting` + `getSetting` | MVP | 🟢 | 🟢 | S | Actions | MVP | B-040 |
| B-042 | Conectar formulário de Configurações à tabela `settings` (nome da org, e-mail) | MVP | 🟢 | 🟢 | S | Config | MVP | B-041 |
| B-043 | Análise facial: histórico de análises por criança (lista com data + status) | MVP | 🟢 | 🟢 | S | Triagem | MVP | B-004 |
| B-044 | Tarefas: botão Editar tarefa (título, categoria, status) | MVP | 🟢 | 🟢 | S | Tarefas | MVP | B-004 |
| B-045 | Tarefas: botão Excluir tarefa (com confirmação) | MVP | 🟢 | 🟢 | XS | Tarefas | MVP | B-004 |
| B-046 | Verificar e corrigir criação de evento de timeline pelo perfil da criança | MVP | 🟢 | 🟢 | S | Acompanhamento | MVP | B-035 |

---

## Sprint 5 — Deploy MVP e validação piloto

> Objetivo: 1 cliente real usando sem intervenção técnica.

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-050 | Configurar ambiente de produção (Vercel + Supabase prod) | MVP | ⚪ | 🟡 | S | DevOps | MVP | — |
| B-051 | Aplicar todos os SQLs em produção na ordem correta | MVP | ⚪ | 🔴 | S | Banco | MVP | B-050 |
| B-052 | Checklist completo de RLS com 2 contas em produção (`DEPLOY.md`) | MVP | ⚪ | 🔴 | S | Segurança | MVP | B-051 |
| B-053 | Configurar domínio + HTTPS + `NEXT_PUBLIC_SITE_URL` | MVP | ⚪ | 🟡 | S | DevOps | MVP | B-050 |
| B-054 | Teste de fumaça completo no ambiente de produção | MVP | ⚪ | 🔴 | S | QA | MVP | B-051, B-053 |
| B-055 | Onboarding guiado do cliente piloto (sessão acompanhada) | MVP | ⚪ | 🟡 | S | Negócio | MVP | B-054 |

---

## Backlog v1.0 — Multi-tenancy e SaaS público

> Atenção: esta é a mudança arquitetural mais significativa do projeto.
> Nenhum item deste bloco começa sem design review do CTO.

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-100 | **[ARCH] Design da migração multi-tenancy: DDL, RLS, queries, actions** | P0 | ⚪ | 🔴 | M | Arquitetura | v1.0 | MVP concluído |
| B-101 | **Criar tabela `organizations` (id, name, slug, plan, created_at)** | P0 | ⚪ | 🔴 | S | Banco | v1.0 | B-100 |
| B-102 | **Adicionar `org_id` (FK → organizations) em todas as tabelas de dados** | P0 | ⚪ | 🔴 | L | Banco | v1.0 | B-101 |
| B-103 | **Migração dos dados existentes do piloto para `org_id` padrão** | P0 | ⚪ | 🔴 | S | Banco | v1.0 | B-102 |
| B-104 | **Estender RLS: todas as políticas incluem `org_id = auth_org_id()`** | P0 | ⚪ | 🔴 | L | Segurança | v1.0 | B-102 |
| B-105 | **Função `auth_org_id()` (SECURITY DEFINER) que retorna org do usuário atual** | P0 | ⚪ | 🔴 | S | Banco | v1.0 | B-101 |
| B-106 | Atualizar todas as queries em `lib/db/queries.ts` para filtrar por `org_id` | P0 | ⚪ | 🔴 | L | Dados | v1.0 | B-104 |
| B-107 | Atualizar todas as Server Actions para incluir `org_id` nos inserts | P0 | ⚪ | 🔴 | L | Actions | v1.0 | B-104 |
| B-108 | Teste de isolamento entre organizações (3 orgs, zero vazamento de dados) | P0 | ⚪ | 🔴 | M | QA | v1.0 | B-104 |
| B-110 | Signup público: formulário → cria `organization` + `profile(admin)` atomicamente | P0 | ⚪ | 🔴 | M | Auth | v1.0 | B-101 |
| B-111 | Onboarding wizard (3 passos: nome da org → convidar 1º profissional → adicionar 1ª criança) | P0 | ⚪ | 🟡 | M | UX | v1.0 | B-110 |
| B-112 | Página de pricing no site público (3 planos: Starter, Clínica, Institucional) | P0 | ⚪ | 🟢 | S | Site | v1.0 | B-110 |
| B-113 | Controle de capacidade por plano (limite de profissionais/crianças) | P1 | ⚪ | 🟡 | M | Infra | v1.0 | B-110 |
| B-114 | Desativar usuário: admin pode revogar acesso (soft delete em profiles) | P0 | ⚪ | 🟡 | S | Usuários | v1.0 | B-106 |
| B-120 | Sentry: instalar `@sentry/nextjs`, configurar DSN, scrubbing de PII | P0 | ⚪ | 🟢 | S | Observabilidade | v1.0 | — |
| B-121 | `/api/health`: retorna 200 se DB + Storage reachable, 503 caso contrário | P0 | ⚪ | 🟢 | XS | Observabilidade | v1.0 | — |
| B-122 | Estender logging para `lib/storage/index.ts` (erros de upload/signed URL) | P0 | ⚪ | 🟢 | S | Observabilidade | v1.0 | B-001 |
| B-123 | Estender logging para `lib/ai/service.ts` (falhas de provider) | P0 | ⚪ | 🟢 | S | Observabilidade | v1.0 | B-001 |
| B-124 | Estender logging para `lib/actions/helpers.ts` `runAction` (erros mascarados) | P0 | ⚪ | 🟢 | S | Observabilidade | v1.0 | B-001 |
| B-130 | Rate limiting: Upstash Redis no formulário de lead público (`/contato`) | P0 | ⚪ | 🟡 | M | Segurança | v1.0 | — |
| B-131 | Rate limiting: signup público (evitar criação de orgs em massa) | P0 | ⚪ | 🟡 | S | Segurança | v1.0 | B-130 |
| B-132 | Validação MIME por magic-bytes server-side nos 4 buckets de Storage | P0 | ⚪ | 🟡 | S | Segurança | v1.0 | — |
| B-140 | Testes de integração: auth/RLS — 3 cenários por papel (5 papéis = 15 testes) | P0 | ⚪ | 🟢 | L | QA | v1.0 | B-108 |
| B-141 | Testes E2E Playwright: signup → onboarding → criança → M-CHAT → PDF | P0 | ⚪ | 🟡 | L | QA | v1.0 | B-111 |
| B-142 | Testes E2E Playwright: admin → convite → profissional → vínculo → triagem | P0 | ⚪ | 🟡 | M | QA | v1.0 | B-141 |
| B-150 | CI/CD: deploy automático no Vercel ao merge para main (preview + produção) | P0 | ⚪ | 🟢 | S | DevOps | v1.0 | — |
| B-151 | Política de privacidade e termos de uso (texto jurídico + página no site) | P0 | ⚪ | 🔴 | S | Legal | v1.0 | B-112 |
| B-152 | Backup automático do banco configurado (Supabase PITRecovery ou Pro) | P0 | ⚪ | 🔴 | XS | DevOps | v1.0 | — |

---

## Backlog v1.1 — Qualidade e Completude

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-200 | Busca por nome de criança (input com debounce → filtro server-side) | P1 | ⚪ | 🟢 | S | Crianças | v1.1 | v1.0 |
| B-201 | Busca/filtro por papel na lista de usuários | P1 | ⚪ | 🟢 | XS | Usuários | v1.1 | v1.0 |
| B-202 | Filtro por período em relatórios de triagem | P1 | ⚪ | 🟢 | S | Relatórios | v1.1 | v1.0 |
| B-203 | Filtro por período na linha do tempo | P1 | ⚪ | 🟢 | S | Acompanhamento | v1.1 | v1.0 |
| B-204 | PDF do relatório evolutivo (tarefas, diário, linha do tempo) | P1 | ⚪ | 🟡 | M | Relatórios | v1.1 | B-030 |
| B-205 | Gráfico de tendência de humor no diário (linha por semana) | P1 | ⚪ | 🟢 | M | Diário | v1.1 | v1.0 |
| B-206 | Notificações in-app: tarefa vencida, resultado novo, convite aceito | P1 | ⚪ | 🟡 | M | UX | v1.1 | v1.0 |
| B-207 | Envio de relatório por e-mail para família (link para download) | P1 | ⚪ | 🟡 | S | Relatórios | v1.1 | B-032 |
| B-208 | Editar evento da linha do tempo | P1 | ⚪ | 🟢 | S | Acompanhamento | v1.1 | v1.0 |
| B-209 | Excluir evento da linha do tempo (com confirmação) | P1 | ⚪ | 🟢 | XS | Acompanhamento | v1.1 | v1.0 |
| B-210 | Editar entrada do diário | P1 | ⚪ | 🟢 | S | Diário | v1.1 | v1.0 |
| B-211 | Excluir entrada do diário | P1 | ⚪ | 🟢 | XS | Diário | v1.1 | v1.0 |
| B-212 | Editar e excluir criança (com confirmação e aviso de cascade) | P1 | ⚪ | 🟡 | S | Crianças | v1.1 | v1.0 |
| B-213 | UI de notas do profissional na timeline da criança | P1 | ⚪ | 🟢 | S | Profissionais | v1.1 | v1.0 |
| B-214 | UI de notas da escola na timeline da criança | P1 | ⚪ | 🟢 | S | Escolas | v1.1 | v1.0 |
| B-215 | Perfil de usuário: editar nome, telefone, avatar | P1 | ⚪ | 🟢 | S | Auth | v1.1 | v1.0 |
| B-216 | Retomada de sessão M-CHAT interrompida (salvar progresso parcial) | P1 | ⚪ | 🟡 | S | M-CHAT | v1.1 | v1.0 |
| B-217 | Detalhe individual do relatório de triagem (página própria) | P1 | ⚪ | 🟢 | S | Relatórios | v1.1 | v1.0 |
| B-218 | Painel de auditoria de `ai_requests` para admin | P1 | ⚪ | 🟢 | M | Admin | v1.1 | v1.0 |
| B-219 | Atualizar status do lead de sala sensorial via UI | P1 | ⚪ | 🟢 | S | Comercial | v1.1 | v1.0 |
| B-220 | Cobertura de testes > 60% (`lib/**`) | P1 | ⚪ | 🟢 | M | QA | v1.1 | v1.0 |
| B-221 | Codegen de tipos do Supabase CLI (substituir `lib/db/types.ts` manual) | P2 | ⚪ | 🟡 | S | DX | v1.1 | v1.0 |
| B-222 | Migrations versionadas com Supabase CLI | P2 | ⚪ | 🟡 | M | DX | v1.1 | v1.0 |
| B-223 | Acessibilidade: 0 erros críticos Axe/Lighthouse | P1 | ⚪ | 🟢 | M | QA | v1.1 | v1.0 |

---

## Backlog v1.5 — IA Real

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-300 | **[PRÉ-REQ] Harness de avaliação de IA: `lib/ai/evaluation/` + golden dataset** | P0 | ⚪ | 🔴 | L | IA | v1.5 | v1.1 |
| B-301 | **[PRÉ-REQ] Validação clínica com neuropediatra (processo, não código)** | P0 | ⚪ | 🔴 | — | Legal | v1.5 | B-300 |
| B-302 | **[PRÉ-REQ] Atualizar disclaimers legais com assessoria jurídica** | P0 | ⚪ | 🔴 | S | Legal | v1.5 | B-301 |
| B-310 | Integrar MediaPipe (landmarks faciais) como 1ª etapa real da pipeline | P1 | ⚪ | 🔴 | XL | IA | v1.5 | B-300, B-302 |
| B-311 | Worker assíncrono para processamento de triagem (Supabase Queue / pgmq) | P1 | ⚪ | 🔴 | XL | Infra | v1.5 | B-310 |
| B-312 | Webhook de resultado: atualiza UI quando worker conclui | P1 | ⚪ | 🟡 | M | IA | v1.5 | B-311 |
| B-313 | Integrar LLM para resumo de genética para família (`lib/ai/genetics`) | P1 | ⚪ | 🔴 | L | IA | v1.5 | B-300 |
| B-314 | Integrar LLM para resumo técnico de genética | P1 | ⚪ | 🔴 | M | IA | v1.5 | B-313 |
| B-315 | Botão "reportar resultado incorreto" na Triagem Digital | P1 | ⚪ | 🟢 | S | IA | v1.5 | B-310 |
| B-316 | 3 jogos novos com persistência completa | P1 | ⚪ | 🟢 | L | Jogos | v1.5 | B-036 |
| B-317 | Métricas de desempenho por jogo integradas ao relatório evolutivo | P1 | ⚪ | 🟢 | M | Jogos | v1.5 | B-316 |
| B-318 | Notificações por e-mail (Resend/SendGrid): resultado de triagem, tarefas vencidas | P1 | ⚪ | 🟡 | M | Notif | v1.5 | v1.1 |
| B-319 | OpenTelemetry: tracing Server Action → Supabase → IA | P2 | ⚪ | 🟡 | L | Observ | v1.5 | B-120 |

---

## Backlog v2.0 — Plataforma

| ID | Descrição | Prio | Status | Risco | Esforço | Módulo | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| B-400 | **[ARCH] Extrair application services (use-cases) das Server Actions** | P0 | ⚪ | 🔴 | XL | Arquitetura | v2.0 | v1.5 |
| B-401 | API pública REST/tRPC sobre os use-cases | P0 | ⚪ | 🔴 | XL | API | v2.0 | B-400 |
| B-402 | App mobile React Native / Expo (família + profissional) | P0 | ⚪ | 🔴 | XL | Mobile | v2.0 | B-401 |
| B-403 | Multi-unidade: rede de clínicas sob holding (super-admin) | P1 | ⚪ | 🔴 | XL | Infra | v2.0 | B-104 |
| B-404 | Módulo de pesquisa com dados anonimizados (opt-in, consentimento) | P2 | ⚪ | 🔴 | XL | Pesquisa | v2.0 | v1.5 |
| B-405 | LGPD completo: portal de erasure, portabilidade, trilha de acesso | P1 | ⚪ | 🔴 | L | Legal | v2.0 | B-104 |
| B-406 | Cache distribuído Redis/Upstash para sessões e signed URLs | P2 | ⚪ | 🟡 | M | Infra | v2.0 | B-130 |
| B-407 | Testes de carga (k6): 1000 usuários simultâneos | P1 | ⚪ | 🟡 | M | QA | v2.0 | B-401 |

---

## Itens recomendados para REMOÇÃO ou ADIAMENTO

> Itens que existem no código mas não têm justificativa para permanecer
> visíveis ou prioridade de desenvolvimento no curto prazo.

| Item atual | Recomendação | Justificativa |
|---|---|---|
| 7 categorias de jogos na grade (Atenção, Associação, etc.) | **Remover** da UI até ter implementação real | Promessas não cumpridas → erosão de confiança |
| Triagem Digital na navegação padrão (sem badge) | **Adicionar badge "Preview"** ou mover para submenu | Resultado mock sem disclaimer é enganoso |
| Resultado mock da análise facial | **Remover imediatamente** | Risco ético e legal — prioridade máxima |
| Botão "Convidar usuário" sem ação | **Remover ou implementar** | Botão quebrado = produto quebrado |
| Botão "Salvar" das Configurações sem ação | **Remover ou implementar** | Idem |
| `lib/ai/genetics` dormente sem aviso | **Documentar como WIP** (já está no TECH_DEBT) | Não é risco, mas deve ser explícito |

---

## Resumo por versão

| Versão | IDs | Total | Esforço estimado |
|---|---|---|---|
| Sprint 0 | B-001 a B-005 | 5 items | ~1 dia |
| Sprint 1–4 (MVP) | B-010 a B-055 | ~28 items | ~3 semanas |
| v1.0 | B-100 a B-152 | ~30 items | ~5 semanas |
| v1.1 | B-200 a B-223 | ~24 items | ~4 semanas |
| v1.5 | B-300 a B-319 | ~16 items | ~8 semanas |
| v2.0 | B-400 a B-407 | ~8 items | ~12+ semanas |
| **Total** | | **~111 items** | **~33+ semanas** |

---

*Última revisão: 2026-06-26*
*Próxima revisão: ao final de cada sprint*
*Responsável: CTO/PIO — qualquer alteração de prioridade P0/MVP requer aprovação*
