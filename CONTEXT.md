# CONTEXT.md — Contexto e arquitetura

## Visão
NexisX unifica, em um único portal, a jornada do neurodesenvolvimento: descoberta
(site público), triagem (análise facial + M-CHAT), acompanhamento contínuo, genética e
salas sensoriais — para famílias, profissionais, escolas/clínicas e a operação interna.

## Decisões de arquitetura
- **App Router (Next 14):** route groups separam o site público `(site)` da área
  protegida `app/app`. O `middleware.ts` redireciona `/app/*` sem sessão para `/login`.
- **Autenticação:** Supabase Auth via `@supabase/ssr` (cookies). Perfil e papel ficam
  em `profiles`, criado por trigger no signup.
- **Autorização (defesa em profundidade):** controle por papéis (`admin`,
  `responsavel`, `profissional`, `escola`, `consultor`) em três camadas:
  1. **UI** — `navForRole()` filtra a navegação.
  2. **Rota (server)** — `requireRole()` em `lib/guard.ts` impede que páginas restritas
     sejam renderizadas por quem digita a URL diretamente (redireciona para `/app`).
  3. **Dados** — **RLS** no banco é a fonte de verdade da segurança.
- **Papel é fonte única em `profiles`:** nunca lido de `user_metadata` (controlável pelo
  cliente). No signup todo usuário entra como `responsavel`; promoção só por admin/
  service_role (triggers `handle_new_user` e `enforce_role_change`).
- **Camada visual:** design system próprio (tokens HSL em `globals.css`), componentes
  estilo shadcn, animações com Framer Motion e um hero com Canvas 2D.
- **Site público (Fase 2.5 / Onda 5):** mockups do produto feitos 100% em código
  (`product-mockup`, sem imagens externas); seções `Journey`, `TriagemExplainer` e
  `Credibility` na home; galeria de salas com efeitos de luz/LED em código; diagrama
  `GeneticsFlow` na página de DNA. Avisos legais preservados; sem clientes/depoimentos
  inventados.
- **Microinterações (Fase 2.5 / Onda 4):** `MotionList`/`MotionItem` (stagger no mount) e
  `AnimatedCounter` em `components/app`; `FeaturedStat` para a métrica de destaque do
  dashboard. Listas internas usam entrada escalonada e hover premium; reduced-motion
  desliga as animações.
- **Biblioteca de componentes (Fase 2.5 / Onda 3):** primitivos acessíveis sobre Radix UI
  em `components/ui` — `Select`, `Dialog`, `Sheet`, `Tooltip`/`InfoTooltip`, `Tabs`,
  `Avatar`, `Separator` — estilizados com os tokens da Onda 1. Preferir esses a `<select>`
  nativo ou modais ad-hoc.
- **Feedback & estados (Fase 2.5 / Onda 2):** `Skeleton` + `LoadingState` (e `loading.tsx`
  por segmento), `ErrorState` + `error.tsx`/`global-error.tsx`, `Toaster` global
  (`useToast`) com Framer Motion, e transição de página em `app/app/template.tsx`. Toda
  ação de escrita dá feedback por toast; botões bloqueiam duplo clique via `useTransition`.
- **Design tokens premium (Fase 2.5 / Onda 1):** escala de elevação `--shadow-1..4`
  (utilitários `elevation-1..4` / `shadow-elevation-*`), superfícies (`surface-card`,
  `surface-panel`), `glass-card`, `gradient-border`, tipografia fluida (`heading-xl/lg/md`),
  `text-balance`/`text-pretty`, `section-spacing` e `container-premium`. Foco de teclado
  global e `prefers-reduced-motion` respeitado. Preferir esses utilitários a valores avulsos.
- **Modo demo (apenas dev):** sem Supabase configurado, `lib/auth.ts` retorna um perfil
  admin demo **somente em desenvolvimento** (`NODE_ENV !== "production"`), permitindo
  navegar a área interna localmente sem backend. Em produção nunca há fallback.
- **Camada de dados (`lib/db/`):** toda leitura passa por `lib/db/queries.ts` (tipada por
  entidade); as páginas não chamam o Supabase diretamente. Escritas ficam em
  `lib/actions/*` como **Server Actions**, validadas por `lib/validation.ts` e autorizadas
  por `getActor()` em `lib/guard.ts`. Leitura e escrita usam o client server-side
  (cookies → RLS), de modo que sessão e políticas são respeitadas em todas as operações.
  As actions retornam `ActionResult` (`{ ok, data | error }`) — nunca lançam para a UI.

## Estado das telas (Blocos C–E)
Conectadas a dados reais: dashboard, crianças (lista/perfil), linha do tempo, tarefas
(criar/concluir), diário dos pais, solicitações comerciais/salas (admin), exames
genéticos, triagem (M-CHAT → sessão+respostas+relatório; análise facial → upload real +
registro), laudos e documentos (Storage), responsáveis, profissionais, escolas, usuários,
relatórios de triagem e relatórios evolutivos. Empty states padronizados via `EmptyState`.

## Triagem Digital Assistiva (Fase 3 — base de dados)
Base de banco/Storage para a **Análise Comportamental Digital** (fenotipagem por vídeo +
M-CHAT; triagem, **nunca diagnóstico**). SQL aditivo e idempotente em
`supabase/screening_digital.sql` (rodar após `storage.sql`), sem tocar em
`facial_analyses` (mantida como legado). Novas tabelas: `digital_screening_sessions`
(coleta vídeo/foto + metadados de IA), `behavioral_signals` (sinais medidos —
explicabilidade), `screening_fusions` (fusão com M-CHAT) e `ai_requests` (auditoria
operacional de IA, sem PII). RLS: as três primeiras usam `can_access_child(child_id)`;
`ai_requests` é exclusiva de admin (`is_admin()`). Bucket privado `screening-media`
(`<child_id>/<uuid>.<ext>`) com policies reusando `can_access_child()`. Tipos espelhados
em `lib/db/types.ts`.

**Conexão (Fase 3 — backend):** o domínio comportamental (`lib/ai/behavioral`, mock) está
ligado ao banco e ao Storage. Leitura: `lib/db/queries.ts` ganha
`listDigitalScreeningSessions`, `getDigitalScreeningSession`, `listBehavioralSignals`,
`listScreeningFusions` e `listAiRequests` (RLS restringe `ai_requests` a admin). Escrita:
`createDigitalScreening` (em `lib/actions/screening.ts`) recebe `FormData` (criança +
consentimento + mídia), valida (vídeo até 60s/50 MB; foto como fallback), faz upload no
bucket privado `screening-media` (`lib/storage#uploadScreeningMedia`), roda
`analyzeBehavioralScreening` (MockProvider), persiste a sessão em
`digital_screening_sessions`, os sinais em `behavioral_signals`, a fusão com o M-CHAT mais
recente em `screening_fusions` (se houver) e a auditoria em `ai_requests`, devolvendo um
resultado estruturado. `facial_analyses` intacta.

**UI (Fase 3):** rota `app/app/triagem/comportamental` ("Triagem Digital Assistiva", no
grupo Triagem da navegação) — Server Component com `requireRole` + `listChildren`,
renderizando o client `components/app/behavioral-screening.tsx`. A tela permite selecionar
a criança, aceitar o consentimento, enviar vídeo curto (até 60s) ou foto, informar a
duração do vídeo e os timestamps de estímulos (chamada pelo nome / visual), e processar via
`createDigitalScreening`. Exibe qualidade da coleta, recomendação de repetir coleta quando
baixa, sinais (indicadores + confiança + nota), score de risco, confiança da predição,
nível de risco, explicabilidade, fusão com M-CHAT (quando existe) e recomendação de
encaminhamento — com avisos obrigatórios de triagem. Usa Cards, Badge, Progress, Framer
Motion, Toasts e EmptyState do design system. Sem provedor real (só Mock).

**Pipeline de processamento (Fase 3 — arquitetura):** a triagem comportamental é produzida
por uma pipeline de **18 etapas independentes** em `lib/ai/behavioral/pipeline/`, alinhada
ao fluxo de fenotipagem comportamental digital do artigo da Nature Medicine (2023):
ingestão → extração de frames → pré-processamento → detecção da criança → rastreamento
facial → rastreamento ocular → head pose → expressões → piscar → resposta a estímulos →
movimento corporal → agregação temporal → vetor de features → qualidade da coleta →
confiança → explicabilidade → fusão com M-CHAT → resultado estruturado. Cada etapa tem
interface própria (`PipelineStage<I,O>`) e implementação **Mock determinística**, sem
depender de provider; toda comunicação passa por contratos tipados. As etapas são
trocáveis no futuro por MediaPipe/OpenFace/OpenCV/YOLO/PyTorch sem alterar o orquestrador
(`runBehavioralPipeline`) nem o restante da aplicação. O `MockProvider` apenas delega à
pipeline. **Sem provider real, sem alterar banco/Storage/UI/rotas.**

## Storage (Bloco D)
Buckets privados (`facial-photos`, `genetic-reports`, `child-documents`) com policies que
reusam `can_access_child()` (caminho `<child_id>/...`). Upload via `lib/storage/` +
Server Actions; acesso só por URL assinada temporária. Conectados: análise facial (foto
real), laudos genéticos e documentos da criança.

## Governança de engenharia (maturidade do projeto)
Camada de governança adicionada para manutenção profissional por equipe:
- **`ARCHITECTURE.md`** — arquitetura completa (auth, roles, RLS, Server Actions, Supabase,
  Storage, IA, fluxos de triagem/upload, deploy).
- **`docs/adr/`** — Architecture Decision Records: 0001 Supabase · 0002 RLS como fonte de
  segurança · 0003 IA provider-agnóstica · 0004 Storage privado/URL assinada · 0005 Server
  Actions para escrita · 0006 ausência temporária de provider real de IA.
- **`ROADMAP.md`** (P0–P3), **`TECH_DEBT.md`** (dívidas/riscos/plano), **`TEST_PLAN.md`**
  (testes obrigatórios, ainda não implementados), **`OBSERVABILITY.md`** (monitoramento, sem
  Sentry/OTel instalados) e **`CONTRIBUTING.md`** (processo, branch/commit, checklist de PR).
- **CI quality-gate** (`.github/workflows/quality-gate.yml`): `npm ci` → `lint` →
  `typecheck` → `build` em push/PR para `main`. **Sem deploy automático.**
- **Testes (P0.1):** Vitest configurado (`vitest.config.ts`, ambiente Node, alias `@/*`).
  Primeiras suítes em `tests/` (39 testes): scoring do M-CHAT, validações, `runAction`/
  `ActionResult`, idade e a camada de IA mock (contrato do provider, pipeline determinística,
  envelope `Result`, fusão, qualidade da coleta). Scripts `test`/`test:watch`/`test:coverage`.
- **Logging (P0.2):** `lib/logger.ts` (JSON, sem PII); `lib/db/queries.ts` passa a registrar
  erros de leitura classificados (RLS/auth/query/conexão) em vez de engoli-los — **mesmos
  retornos** (resiliência preservada).
- **Segurança:** `images.remotePatterns` restrito a `*.supabase.co` (sem curinga `**`).
> Esta camada **não altera** regra de negócio, schema, RLS, UI nem integra IA real.

## Limites do MVP
- **Análise facial** continua simulada (sem IA), mas já faz **upload real da foto** e
  salva o `storage_path` em `facial_analyses`.
- **Ainda protótipo** (ver `DEPLOY.md`): resultado de IA da análise facial, exportação
  PDF, resumos de genética por IA, jogos (sem `game_sessions`), visão geral da triagem
  (guia estático) e persistência de configurações.

## Próximos passos sugeridos
1. Conectar formulários às tabelas via Server Actions.
2. Implementar upload real no Supabase Storage (fotos/laudos).
3. Integrar serviço de análise facial e geração de PDF dos relatórios.
4. Cadastro/convite de usuários com atribuição de papéis.
