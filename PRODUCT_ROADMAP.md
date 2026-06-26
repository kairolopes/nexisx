# PRODUCT_ROADMAP.md — Roadmap de Produto
# Portal NexisX

> Roadmap por versão de release. Cada versão tem objetivo único, escopo
> fechado e critérios de saída objetivos. Nenhuma versão avança sem
> aprovação técnica e de produto.
> Autor: CTO/PIO — 2026-06-26

---

## Visão geral do roadmap

```
MVP (deploy interno)
  │  ~3 semanas
  ▼
v1.0 — Produto Comercial Inicial
  │  ~5 semanas
  ▼
v1.1 — Qualidade e Completude
  │  ~4 semanas
  ▼
v1.5 — IA Real e Diferenciação
  │  ~8 semanas
  ▼
v2.0 — Plataforma e Escala
```

---

## MVP — Deploy Interno / Piloto Fechado

**Objetivo:** Versão funcional e honesta para uso interno e piloto com
1–3 clientes convidados. Sem venda pública. Sem signup aberto.

**O que este marco significa:**
O produto pode ser usado por um cliente real sem causar confusão, frustração
ou danos à reputação. Toda funcionalidade que existe, funciona corretamente.

**Escopo do MVP:**

### Incluído
- Site público funcional (sem pricing ainda)
- Auth / login / logout / recuperação de senha
- Gestão de crianças: criar, listar, perfil
- Triagem M-CHAT: completa, com PDF básico do resultado
- Análise facial: upload funcional; resultado mock **removido** da UI de
  produção (exibe "análise manual a ser realizada pelo profissional")
- Diário dos pais: criar e listar
- Tarefas e rotina: criar, concluir
- Genética: solicitar exame, upload de laudo, download seguro
- Dashboard: métricas reais
- Gestão de usuários: **convidar + promover papel via UI** (admin)
- Configurações básicas: persistem no banco
- CI/CD básico (quality-gate existente + deploy no Vercel)

### Explicitamente excluído
- Signup público / multi-tenant / organizations
- Triagem Digital Assistiva visível (mover para rota oculta ou flag)
- Jogos: apenas jogo da memória com persistência básica
- PDF de relatórios evolutivos
- Rate limiting
- Sentry
- Módulo de pesquisa

**Critério de saída do MVP:**
Um admin consegue onboarding completo de um cliente (profissional +
responsável + criança + triagem M-CHAT + PDF) sem intervenção técnica.
Zero funcionalidades que mentem.

**Estimativa:** 3 semanas de desenvolvimento + 1 semana de testes

---

## v1.0 — Produto Comercial Inicial

**Objetivo:** Produto pronto para venda pública com signup self-service,
multi-tenancy e qualidade operacional de produção.

**O que este marco significa:**
Qualquer clínica ou profissional pode descobrir o NexisX, criar uma conta,
configurar sua organização e começar a usar sem falar com ninguém.

**Decisão arquitetural crítica — Multi-tenancy:**
A v1.0 introduz a tabela `organizations` e estende o RLS para incluir
`org_id`. Cada signup público cria uma organização isolada. Esta é a mudança
mais impactante do projeto — exige migração de schema, atualização de RLS,
atualização de queries e Server Actions. Deve ser feita de uma vez, com
feature flag e migração zero-downtime.

**Escopo da v1.0:**

### Multi-tenancy e SaaS
- Tabela `organizations` (name, slug, plan, created_at)
- Campo `org_id` em todas as tabelas relevantes
- RLS estendida para isolamento por organização
- Signup público → cria organização + perfil admin
- Fluxo de onboarding guiado (wizard 3 passos)
- Página de pricing no site público
- Planos: Starter / Clínica / Institucional (controle de capacidade)

### Qualidade e operação
- Sentry (erros server + client com scrubbing de PII)
- `/api/health` (DB + Storage reachable)
- Rate limiting no lead público e no signup (Upstash Redis)
- Validação de MIME por magic-bytes nos uploads
- Testes de integração auth/RLS (TEST_PLAN.md completo)
- Logging estendido a storage/ai/runAction
- Deploy automatizado (Vercel + Supabase, branch main)

### Funcionalidades adicionais à v1.0
- Triagem Digital Assistiva: visível com badge "Preview Científico"
  (resultado exibe disclaimers claros de modelo demonstrativo)
- Jogos: persistência completa de `game_sessions`
- Relatórios de triagem: detalhe individual
- Linha do tempo: criar evento via UI explícita
- Editar e excluir tarefas
- Editar e excluir entradas do diário

**Critério de saída da v1.0:**
Signup público funciona. Multi-tenancy isolado (tenant A não vê dados de
tenant B). Todos os testes passam. Sentry ativo. 3 clientes pagos em piloto.

**Estimativa:** 5 semanas após MVP

---

## v1.1 — Qualidade e Completude

**Objetivo:** Fechar os gaps de usabilidade e qualidade que surgirão com
os primeiros clientes reais. Sem features novas disruptivas — apenas
completar o que está pela metade.

**Escopo da v1.1:**
- Busca por nome em todas as listagens (crianças, usuários, tarefas)
- Filtros por período em relatórios e linha do tempo
- PDF do relatório evolutivo (básico)
- Gráficos de tendência: humor no diário, evolução de tarefas por semana
- Notificações in-app (tarefa vencida, relatório novo, convite aceito)
- Editar/excluir criança (com confirmação)
- Editar/excluir evento da linha do tempo
- Histórico de análises faciais por criança
- Retomada de sessão M-CHAT interrompida
- Painel de `ai_requests` (auditoria de IA) para admin
- Codegen de tipos do Supabase (substituir `lib/db/types.ts` manual)
- Migrations versionadas (Supabase CLI)
- E2E tests com Playwright (fluxo crítico: signup → triagem → PDF)

**Critério de saída da v1.1:**
NPS dos primeiros clientes ≥ 7. Zero reclamação de "não encontro X".
Cobertura de teste > 60%.

**Estimativa:** 4 semanas após v1.0

---

## v1.5 — IA Real e Diferenciação

**Objetivo:** Ativar os diferenciais técnicos do produto que hoje estão
mock ou dormentes. Esta versão transforma o NexisX de "bom produto" em
"produto único no mercado".

**Decisão estratégica — IA:**
Antes de integrar qualquer provider real, é obrigatório:
1. Harness de avaliação de IA com dataset golden de triagem
2. Processo de validação clínica dos resultados com profissional habilitado
3. Definição de SLA de acurácia mínima por sinal
4. Atualização dos disclaimers legais

**Escopo da v1.5:**
- Harness de avaliação de IA (módulo `lib/ai/evaluation`)
- Integração de 1º provider de IA real para triagem comportamental
  (sugestão: Google MediaPipe para landmarks → destrava sinais 1–6)
- Resumos automáticos de genética (família + técnico) via LLM
  (`lib/ai/genetics` sai do estado dormente)
- Jogos: 3+ jogos novos (além da memória)
- Métricas de desempenho por jogo no relatório evolutivo
- Processamento assíncrono da pipeline de triagem (fila + worker)
  usando `status` já presente no schema
- Notificações por e-mail (convite, resultado de triagem, tarefas vencidas)
- OpenTelemetry (tracing Server Action → Supabase → IA)

**Critério de saída da v1.5:**
Triagem Digital Assistiva com resultado validado clinicamente por ao menos
1 neuropediatra. IA de genética gerando resumos sem alucinações críticas
(avaliação humana em 100 casos). Fila assíncrona sem timeout em produção.

**Estimativa:** 8 semanas após v1.1

---

## v2.0 — Plataforma e Escala

**Objetivo:** Transformar o NexisX de produto de gestão em plataforma de
ecossistema. Expansão de mercado (mobile, integrações, enterprise).

**Escopo da v2.0:**
- App mobile (React Native / Expo) — para famílias no dia a dia
- API pública (REST + tRPC) sobre a camada de application services
  (extrai use-cases das Server Actions — pré-requisito arquitetural)
- Multi-unidade: rede de clínicas sob uma holding (super-admin)
- Módulo de pesquisa com dados anonimizados e consentidos (opt-in)
- Cache distribuído (Redis/Upstash) para escala
- Integração com calendários (Google Calendar / Outlook) para tarefas
- Telemedicina básica: link de videochamada gerado na plataforma
- LGPD completo: portal de direitos do titular (erasure, portabilidade)
- SLA Enterprise + suporte dedicado

**Critério de saída da v2.0:**
100+ organizações ativas. App mobile disponível nas stores.
API pública documentada (OpenAPI). Primeiro contrato enterprise assinado.

**Estimativa:** 12+ semanas após v1.5

---

## Timeline visual

| Versão | Foco | Marco de negócio | Estimativa total |
|---|---|---|---|
| MVP | Funciona sem mentiras | Piloto com 1–3 clientes | Semana 4 |
| v1.0 | Vende sozinho | Signup público aberto | Semana 9 |
| v1.1 | Clientes felizes | NPS ≥ 7, churn < 5% | Semana 13 |
| v1.5 | Diferenciação real | IA validada em produção | Semana 21 |
| v2.0 | Plataforma | 100+ orgs, app mobile | Semana 33+ |

---

## Decisões arquiteturais por versão

| Decisão | Versão | Impacto |
|---|---|---|
| Multi-tenancy (`org_id`) | v1.0 | Alto — migração de schema |
| Application services (use-cases fora das Server Actions) | v1.5/v2.0 | Alto — pré-req API mobile |
| Fila + worker assíncrono | v1.5 | Alto — pré-req IA real |
| API pública (REST/tRPC) | v2.0 | Alto — pré-req mobile |
| Cache distribuído (Redis) | v1.0 parcial / v2.0 | Médio |
| Migrations versionadas (Supabase CLI) | v1.1 | Médio |
| Repositórios atrás de interface (Ports & Adapters para dados) | v2.0 | Alto |

---

*Última revisão: 2026-06-26 · Aprovação necessária antes da Sprint 0*
