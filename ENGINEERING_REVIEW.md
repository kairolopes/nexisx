# ENGINEERING_REVIEW.md — Revisão arquitetural do NexisX

> Auditoria técnica conduzida no papel de Principal Engineer / Software Architect, baseada em
> **leitura do código real** (não apenas dos docs). Estado: HEAD `7228e9b`. Escopo: **somente
> diagnóstico e recomendações** — nenhuma mudança arquitetural foi implementada. Restrições
> respeitadas: sem alterar regra de negócio, UI, banco, RLS ou funcionalidades.
>
> Documentos relacionados: `ARCHITECTURE.md`, `TECH_DEBT.md`, `ROADMAP.md`, `OBSERVABILITY.md`,
> `docs/adr/`. Onde houver incerteza, está marcado **(não tenho certeza)**.

---

## 1. Sumário executivo

O NexisX está **bem acima de um protótipo**: tem camadas bem definidas (leitura/escrita/RLS),
um modelo de segurança sólido com RLS como fonte de verdade, e uma **camada de IA
genuinamente bem arquitetada** (ports & adapters). Os principais riscos arquiteturais não são
de "código ruim", mas de **maturidade operacional** (ausência de testes e observabilidade) e
de **dois acoplamentos que limitarão a escala**: (a) a lógica de negócio vive dentro das
Server Actions (não há camada de aplicação reutilizável por API/mobile), e (b) o acesso a
dados está acoplado diretamente ao Supabase, sem o padrão de porta/adaptador que a camada de
IA já possui. O processamento de IA é **síncrono dentro da request** — insustentável quando
houver IA/vídeo real.

**Maturidade atual: 6/10. Após as recomendações: 9/10.**

---

## 2. Arquitetura

### Pontos fortes (confirmados no código)
- **Separação de responsabilidades clara:** leitura em `lib/db/queries.ts`, escrita em
  `lib/actions/*`, segurança no RLS. Páginas não tocam o Supabase. (ADR 0005)
- **Camada de IA exemplar (Hexagonal/Ports & Adapters):** `lib/ai/index.ts` é a porta;
  `AIProvider` (`core/provider.ts`) é o contrato; `resolveProvider` (`core/registry.ts`) é a
  fábrica; `MockProvider` é o adaptador. Capacidades abstratas (`AICapability`) desacoplam
  *tarefa* de *modelo*. Envelope `Result<T>` nunca lança para a app. A pipeline de 18 etapas
  (`PipelineStage<I,O>`) é um pipeline de transformações puras com contratos tipados —
  trocável por MediaPipe/OpenFace/etc. **Esta é a melhor parte do projeto.**
- **`ActionResult` (união discriminada) + `runAction`:** fronteira de erro consistente; nunca
  vaza stack para a UI.
- **Validação centralizada e sem dependências** (`lib/validation.ts`).
- **Sem dependências circulares observadas:** o grafo flui `app → lib/{db,actions,ai,storage}
  → lib/supabase`; a IA depende só de `core/*`. (não tenho certeza absoluta sem ferramenta de
  grafo, mas a leitura não revelou ciclos.)

### Pontos fracos / oportunidades
1. **Ausência de camada de aplicação (use-cases) — acoplamento à transport layer.** A regra de
   negócio mora dentro de funções `"use server"`. Ex.: `createDigitalScreening`
   (`lib/actions/screening.ts`, ~190 linhas) faz autorização + validação + upload + chamada de
   IA + 4 inserts + fusão + auditoria. Isso **viola SRP** e **prende a lógica ao Next**: um
   futuro endpoint REST, GraphQL ou BFF mobile **não consegue reutilizá-la**. *Recomendação:*
   extrair **application services** framework-agnósticos (ex.: `lib/application/screening/
   createDigitalScreening.ts`) que a Server Action (e amanhã uma rota de API) apenas invoca.
2. **Camada de dados sem porta/adaptador (assimetria com a IA).** `queries.ts`, `actions/*`,
   `storage`, `auth` importam `createClient()` do Supabase diretamente. Não há interface de
   repositório. Resultado: **difícil testar em isolamento** e **acoplado a um fornecedor**.
   A IA tem `resolveProvider` + `resetProviderCache` (testável); o dado não tem equivalente.
   *Recomendação:* introduzir repositórios por agregado (porta) com adaptador Supabase.
3. **`queries.ts` é um módulo "God" de 14 entidades** com o padrão repetido
   `let q = ...; if (childId) q = q.eq("child_id", childId)` em ~8 funções. Não escala para
   dezenas de domínios/equipes. *Recomendação:* repositórios por domínio + um helper
   `withChild(q, childId)`.
4. **Erros engolidos (`safeList`/`safeOne`).** Anti-padrão arquitetural: falha de RLS/config
   vira `[]`/`null` silencioso, conflando "vazio" com "quebrado", sem log. (TECH_DEBT D2)
5. **DDD ausente.** Conceitos de domínio (níveis de risco, limiares de M-CHAT, fusão) estão
   espalhados entre `lib/`, actions e componentes, sem um modelo de domínio explícito. Um
   **DDD leve** (módulos por bounded context: `screening`, `child`, `genetics`, `commercial`)
   melhoraria coesão e onboarding de múltiplas equipes.
6. **Contrato de resultado duplicado:** `ScreeningResult` é redefinido no client
   (`behavioral-screening.tsx`) em vez de importado de um tipo compartilhado retornado pela
   action. Risco de drift de contrato UI↔server.

### Veredito SOLID
- **S:** violado nas Server Actions "god" (item 1). **O:** forte na IA (aberto a novos
  providers sem modificar a app); fraco no dado (adicionar fonte exige tocar tudo). **L:**
  ok. **I:** bom (`AIProvider` com métodos opcionais por capacidade). **D:** **invertido na
  IA** (depende de abstração), **não invertido no dado** (depende do Supabase concreto).

---

## 3. Estrutura de diretórios — escala para 100k usuários / múltiplas equipes / mobile

A estrutura atual (`lib/{db,actions,ai,storage}` + `app/`) é **boa para um monólito de um
time**, mas tem dois limites para a escala pretendida:
- **Organização técnica, não por domínio.** Com dezenas de módulos e várias equipes,
  agrupar por *camada* gera contenção (todo mundo edita `queries.ts`/`actions/`). Migrar
  incrementalmente para **organização por bounded context**:
  ```
  lib/
    application/   use-cases por domínio (screening, child, genetics, commercial, identity)
    domain/        modelos + regras puras (risco, scoring M-CHAT, fusão)
    infra/         adaptadores: supabase (repos), storage, ai (já existe a porta)
    shared/        validation, result, utils
  ```
  Server Actions e (futuras) rotas de API ficam finas, só adaptando transporte → use-case.
- **Sem camada de API para mobile/externos.** Hoje só Server Actions. Um app mobile ou
  parceiros externos exigirão um **transporte HTTP** (REST/tRPC) — que só é viável se a lógica
  estiver em use-cases (item acima). Sem isso, haveria reescrita.

> **Reorganização incremental, sem quebrar nada:** comece extraindo **um** use-case
> (`createDigitalScreening`) para `lib/application/`, mantendo a action como casca. Repita por
> domínio. Introduza repositórios atrás de interfaces conforme cada use-case migra. Nada de
> big-bang.

---

## 4. Código duplicado (consolidações)

- **Filtro por `child_id`** repetido em ~8 queries → helper `withChild()`. 🟢
- **Padrão de upload** já bem consolidado num único `upload()` com tabela de config (bom
  exemplo a seguir). ✅
- **Componentes de upload/consentimento divergentes:** `facial-analysis.tsx` usa
  `<input>`/`<select>`/`<img>` ad-hoc (único `eslint-disable` do projeto) enquanto
  `behavioral-screening.tsx` usa os componentes premium. Extrair `<Checkbox>` e reusar
  `FileUploader`/`Select`. 🟡 (TECH_DEBT D10)
- **Mapas de rótulo/variantes** (`SIGNAL_LABELS`, `RISK_LABEL`, `RECOMMENDATION_LABEL`) vivem
  só no componente — aceitável, mas se reusados em relatórios/PDF, promover a um módulo de
  apresentação compartilhado. 🟢
- **Contrato `ScreeningResult`** duplicado client/server (ver §2.6). 🟡
- **Hooks repetidos:** não encontrei hooks customizados duplicados; o padrão
  `useTransition`+`useToast`+`router.refresh()` se repete nos formulários — candidato a um
  hook `useAction()` que padronize submit/feedback/refresh. 🟢

---

## 5. Performance (documentar, não implementar)

- **Bom:** o dashboard já paraleliza leituras com `Promise.all` (sem N+1 sequencial);
  Server Components por padrão; `loading.tsx` por segmento.
- **`createClient()` por consulta:** cada query reinstancia o client (lê cookies). Envolver em
  React `cache()` para deduplicar por request. 🟡
- **Sem cache de dados:** nenhuma leitura usa `unstable_cache`/`revalidate`/tags. Para listas
  administrativas e catálogos (`games`), cache com invalidação por tag reduziria carga no
  Postgres a 100k usuários. 🟡
- **`select("*")` em toda parte:** buscar só as colunas necessárias reduz payload e acoplamento
  ao schema. 🟢
- **Streaming/Suspense:** subutilizado — poderia transmitir seções pesadas do dashboard/perfil
  com `<Suspense>` em vez de aguardar tudo. 🟢
- **Mídia em memória:** `createDigitalScreening` carrega até 50 MB em `Uint8Array` na request.
  Com IA/vídeo real, isso pressiona memória e estoura timeout serverless → mover para
  processamento assíncrono (ver §6). 🔴 (relevante quando houver IA real)
- **Imagens:** `remotePatterns: "**"` desabilita a proteção do otimizador. 🟡 (TECH_DEBT D8)

---

## 6. Escalabilidade (cada recomendação justificada)

- **Filas + Workers — 🔴 necessário (e já antecipado pelo schema).**
  `digital_screening_sessions.status` tem `pendente|processando|concluido|erro|baixa_qualidade`
  — desenhado para fluxo **assíncrono**, mas hoje executado **síncrono** dentro da action.
  Com IA/vídeo real, processar inline excede timeouts e degrada UX. *Recomendação:* enfileirar
  o job (ex.: Supabase Queue/pgmq, ou SQS/Upstash), um **worker** consome, atualiza `status` e
  notifica; UI faz polling/realtime. **Maior gap de escala depois dos testes.**
- **Webhooks — 🟡 quando IA real for assíncrona.** Providers que processam vídeo de forma
  assíncrona retornam por callback; precisaremos de ingestão de webhook assinada.
- **Scheduler — 🟡 médio prazo.** Lembretes de re-coleta, relatórios evolutivos periódicos,
  expurgo LGPD. (Supabase cron/pg_cron ou Vercel Cron.)
- **Event Bus — 🟡 quando houver efeitos colaterais.** "Triagem concluída" deveria disparar
  (timeline + relatório + notificação) de forma desacoplada, não inline numa action. Começar
  com um padrão de *domain events* in-process; externalizar só se necessário.
- **Cache distribuído (Redis/Upstash) — 🟡.** Pré-requisito para rate limiting e cache de
  sessão/URL assinada num cenário multi-instância.
- **Microserviços — 🟢 evitar agora.** Recomendação: **monólito modular** (que é quase o que
  já é). Extrair **apenas** o processamento de IA/vídeo como serviço/worker separado quando
  chegar a IA real — não fragmentar o resto prematuramente.

---

## 7. Segurança (auditoria)

| Área | Estado | Observação |
|---|---|---|
| **Autenticação** | ✅ forte | `getUser()` valida o token server-side (não usa `getSession()` confiável só em cookie); papel só de `profiles`; demo admin só em dev |
| **Autorização** | ✅ forte | defesa em 3 camadas; `getActor`/`requireRole`; uploads exigem sessão e delegam escopo ao RLS |
| **RLS** | ✅ forte | `can_access_child` central; `ai_requests` só admin; lead público restrito a INSERT (ADR 0002) |
| **Uploads** | 🟡 | valida tamanho/extensão/MIME, mas **MIME vem do cliente (`file.type`) e é falsificável** — falta *sniff* de magic-bytes; caminho seguro via UUID validado (sem path traversal) |
| **Storage** | ✅ | privado + URL assinada (~300s); convenção `<child_id>/...` |
| **Variáveis de ambiente** | ✅ | `SERVICE_ROLE_KEY` não importada no client; ⚠️ `AI_PROVIDER*` indocumentadas no `.env.example` |
| **XSS** | ✅ | React escapa; **zero** `dangerouslySetInnerHTML`/`eval`/`new Function` no código |
| **CSRF** | ✅ | Server Actions do Next 14 têm proteção de origem nativa |
| **SSRF** | ✅ (hoje) | nenhum `fetch` por URL de entrada; **vigiar** ao integrar IA/webhooks |
| **Rate limiting** | 🔴 **ausente** | nada limita o **form público de lead** (INSERT anônimo) nem as actions de upload/IA (custo!). Risco de spam/DoS/custo |
| **Auditoria** | 🟡 | `ai_requests` é ótimo para IA, mas **não há log de acesso a dados sensíveis** (quem leu qual criança) — relevante p/ LGPD |
| **LGPD** | 🟡 | consentimento é booleano; CASCADE ajuda no apagamento, mas **não há processo de retenção/erasure/portabilidade** nem trilha de acesso |

**Prioridades de segurança:** (1) **rate limiting** no lead público e nas actions de
IA/upload; (2) **validação de MIME por magic-bytes**; (3) **trilha de acesso** a dados de
criança (LGPD).

---

## 8. Observabilidade

Confirmado: **nada instalado** (já endereçado em `OBSERVABILITY.md`). A arquitetura **futura
deve prever**, e há seams ideais já existentes:
- **Logs estruturados** — pontos de injeção naturais: `runAction` (erros mascarados),
  `safeList/safeOne` (falhas de RLS hoje silenciadas), `storage`/`ai/service`. 🔴 (corrige D2)
- **Sentry** — exceções server+client com *scrubbing* de PII. 🟡
- **OpenTelemetry** — tracing Server Action → Supabase → Storage/IA. 🟡
- **Métricas** — IA (de `ai_requests`: sucesso/latência/custo, `recaptureRequired`,
  distribuição de risco), uploads (sucesso/erro/tamanho), actions (ok vs erro). 🟡
- **Health checks** — **ausente**; criar `/api/health` (DB + storage reachable) para
  load balancer/monitor de uptime. 🟡
- **Dashboards** — painel admin lendo `ai_requests` (a tabela já existe). 🟢

---

## 9. Auditoria da camada `lib/ai`

**Veredito: arquitetura forte e à prova de futuro para múltiplos providers.** Suporta, por
desenho:
- **OpenAI / Anthropic / Gemini / Azure OpenAI / Ollama / modelos próprios** — basta adicionar
  uma factory ao mapa `FACTORIES` em `registry.ts` e implementar `AIProvider`; a app não muda.
  `AICapability` é neutro a provedor. ✅
- **Versionamento de prompts** — parcial: existe `behavioralInterpretationV1` (campo `version`)
  e `prompt_version` é persistido em `ai_requests`/sessão. *Formalizar* num **registry de
  prompts** versionado. 🟡
- **Auditoria** — `ai_requests` (provider/model/capability/latência/custo/sucesso, sem PII). ✅
- **Custo/latência** — `estimateCost` + `latency_ms` já persistidos; providers reais precisam
  de contagem de tokens real. 🟡

**Gaps para o futuro (documentar):**
- **Processamento assíncrono / filas — 🔴.** `AIProvider.behavioralScreening` retorna
  `Promise` síncrona; não há abstração de **job** para vídeo longo. Introduzir uma porta de
  fila/worker (ver §6) e, possivelmente, uma capacidade `submitJob/getJob`.
- **Retries/timeout não implementados.** `AICallOptions` tem `signal` e `maxRetries`, mas o
  `service.ts` **não os usa**. Implementar backoff/timeout quando houver provider real. 🟡
- **Streaming** — não há variante de streaming (ok para triagem; útil para resumos de texto). 🟢
- **Avaliação automática de modelos — 🔴 ausente.** Não há harness de *eval* (golden sets,
  métricas de concordância, detecção de drift). Crítico **antes** de IA real influenciar
  triagem. Adicionar um módulo `lib/ai/evaluation` + dataset versionado.
- **Domínio de genética dormente** (`lib/ai/genetics`) — código não plugado (TECH_DEBT D6).

---

## 10. Riscos futuros e gargalos

| Risco / Gargalo | Severidade | Quando morde |
|---|---|---|
| IA síncrona na request (timeout/memória) | 🔴 | ao ligar IA/vídeo real |
| Sem testes → refactor de segurança às cegas | 🔴 | a cada mudança em auth/RLS |
| Erros de RLS silenciados (sem logs) | 🔴 | em produção, agora |
| Lógica presa em Server Actions (sem use-cases) | 🟡 | ao construir API/mobile |
| Dado acoplado ao Supabase (sem repos) | 🟡 | troca de fornecedor / testes |
| Sem rate limiting (custo/DoS) | 🟡 | exposição pública / IA real |
| Tipos do banco à mão (drift) | 🟡 | evolução de schema |
| Sem migrations versionadas | 🟡 | múltiplos ambientes/equipes |

---

## 11. Recomendações priorizadas (impacto × esforço)

> Impacto/Esforço: 🟢 baixo · 🟡 médio · 🔴 alto.

### P0 — fundação de confiança
| # | Recomendação | Impacto | Esforço | Status |
|---|---|---|---|---|
| P0.1 | Suite de testes de **auth/roles/RLS** + lógica determinística (M-CHAT, pipeline) — `TEST_PLAN.md` | 🔴 | 🟡 | **parcial** — Vitest + 39 testes unit (M-CHAT, validação, runAction, idade, IA mock); falta integração/RLS + E2E |
| P0.2 | **Logs estruturados** em `runAction`/`queries`/`storage`/`ai` (mata o silenciamento D2) | 🔴 | 🟢 | **feito (queries)** — `lib/logger.ts` + logging classificado em `queries.ts`; estender a `storage`/`ai`/`runAction` |
| P0.3 | **Rate limiting** no lead público e nas actions de upload/IA | 🟡 | 🟢 | pendente — ver §nota abaixo |
| P0.4 | Restringir `images.remotePatterns` | 🟢 | 🟢 | **feito** — `*.supabase.co` |
| P0.5 | Validar E2E a Triagem Digital no Supabase real | 🔴 | 🟢 | pendente |

> **P0.3 — rate limiting (decisão):** uma implementação robusta exige estado compartilhado
> (Redis/Upstash) ou tabela nova — o que **violaria** as restrições atuais (sem novo
> serviço/schema). Portanto **apenas documentado** aqui e em `TECH_DEBT.md` (R: abuso/custo no
> lead público anônimo e nas actions de IA/upload). Estratégia recomendada: middleware de
> rate limit por IP no endpoint público + token bucket por usuário nas actions de IA, sobre
> Upstash Redis, quando a arquitetura permitir adicionar o serviço.

### P1 — preparar escala
| # | Recomendação | Impacto | Esforço |
|---|---|---|---|
| P1.1 | Extrair **application services (use-cases)**; Server Actions viram cascas | 🔴 | 🟡 |
| P1.2 | **Repositórios atrás de interface** (porta) com adaptador Supabase | 🔴 | 🟡 |
| P1.3 | **Fila + worker** para processamento de triagem assíncrono (usar `status` existente) | 🔴 | 🔴 |
| P1.4 | **Sentry** (exceções) + `/api/health` | 🟡 | 🟢 |
| P1.5 | Validação de **MIME por magic-bytes** | 🟡 | 🟢 |
| P1.6 | **Harness de avaliação de IA** (antes de provider real) | 🔴 | 🟡 |

### P2 — qualidade e DX
| # | Recomendação | Impacto | Esforço |
|---|---|---|---|
| P2.1 | Reorganização incremental por **bounded context** (`application/domain/infra`) | 🟡 | 🔴 |
| P2.2 | **Cache** (React `cache()` + `unstable_cache` com tags); `select` enxuto | 🟡 | 🟡 |
| P2.3 | Hook `useAction()` + `<Checkbox>`; unificar uploads; contrato `ScreeningResult` compartilhado | 🟢 | 🟢 |
| P2.4 | **OpenTelemetry** (tracing) + dashboard de `ai_requests` | 🟡 | 🟡 |
| P2.5 | **Domain events** in-process para efeitos colaterais da triagem | 🟡 | 🟡 |

### P3 — futuro
| # | Recomendação | Impacto | Esforço |
|---|---|---|---|
| P3.1 | **Codegen de tipos** do Supabase + **migrations versionadas** | 🟡 | 🟡 |
| P3.2 | Camada de **API (REST/tRPC)** para mobile/parceiros (sobre os use-cases) | 🔴 | 🔴 |
| P3.3 | **Cache distribuído** (Redis/Upstash); Scheduler; Webhooks de IA | 🟡 | 🟡 |
| P3.4 | Trilha de **acesso a dados (LGPD)** + processo de retenção/erasure | 🟡 | 🟡 |
| P3.5 | Extrair processamento de IA/vídeo como **serviço/worker** dedicado | 🔴 | 🔴 |

---

## 12. Ordem ideal de implementação

1. **P0.5** validar E2E (desbloqueio imediato) → **P0.4** remotePatterns (trivial).
2. **P0.2** logs estruturados → torna tudo o mais diagnosticável (pré-requisito de confiança).
3. **P0.1** testes de auth/RLS + determinístico → **rede de segurança antes de refatorar**.
4. **P0.3** rate limiting → fecha o risco público de custo/DoS.
5. **P1.1 + P1.2** use-cases + repositórios → **só depois dos testes**; destrava API e
   testabilidade. Migrar **um** domínio (screening) primeiro como piloto.
6. **P1.6** harness de avaliação de IA → **antes** de qualquer provider real.
7. **P1.3** fila + worker → quando a IA real entrar (ou o vídeo pesar).
8. **P1.4/P1.5**, depois **P2**, depois **P3** conforme demanda de escala/mobile.

> Regra de ouro: **nenhuma refatoração estrutural (P1.1/P1.2/P2.1) antes de P0.1 (testes).**

---

## 13. Parecer final de revisão técnica

### O que considero **excelente**
- A **camada de IA** (`lib/ai`): ports & adapters reais, capacidades abstratas, `Result`,
  pipeline de etapas tipadas e trocáveis. Pensada para anos.
- O **modelo de segurança**: RLS como fonte de verdade + defesa em profundidade + papel só de
  `profiles` + `getUser()` validando token. Difícil de furar por bug de app.
- A **disciplina de fronteira de escrita** (`ActionResult`/`runAction`) e a **validação**
  centralizada.

### O que considero **aceitável** (passa, com ressalva)
- `queries.ts` como módulo único e o padrão `if (childId)` repetido — funciona, mas precisa
  evoluir para repositórios antes de escalar times.
- Tipos do banco à mão e SQL sem migrations — aceitável no estágio atual, dívida conhecida.
- IA 100% mock — **aceitável e correto** dado o estágio (ADR 0006), com avisos na UI.
- Componentes de upload divergentes — cosmético/DX.

### O que eu **reprovaria** numa revisão técnica (precisa correção antes de "enterprise")
- **Ausência total de testes automatizados** — *blocker* para manutenção por equipe.
- **`safeList`/`safeOne` engolindo erros sem log** — esconde falhas de RLS em produção.
- **Processamento de IA síncrono na request** — não passa numa revisão se a meta é IA/vídeo
  real (timeout/memória); o schema já pede async.
- **Sem rate limiting no endpoint público** de lead — risco de abuso/custo.
- **Lógica de negócio dentro de Server Actions** — reprovado para o objetivo de API/mobile;
  precisa de camada de aplicação.

### Nível de maturidade
- **Hoje: 6/10.** Fundação sólida, segurança forte, IA bem desenhada, documentação/CI
  recém-estabelecidas. Perde pontos por **testes, observabilidade, processamento assíncrono e
  acoplamento de dados/transporte**.
- **Após implementar todas as recomendações: 9/10.** (O 10 fica reservado para um sistema
  comprovado em produção, em escala, com SLOs e operação madura ao longo do tempo.)
