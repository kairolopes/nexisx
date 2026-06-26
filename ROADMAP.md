# ROADMAP.md — NexisX

> Roadmap de engenharia por prioridade. Complementa a visão de produto de `VISION.md` e o
> ciclo de release de `RELEASE.md`. Itens marcados como concluídos migram para o `CHANGELOG.md`.

Legenda: **P0** crítico · **P1** importante · **P2** melhoria · **P3** futuro.

## P0 — crítico (bloqueia produção plena / risco direto)

- [ ] **Validar end-to-end a Triagem Digital Assistiva no Supabase real** — criar criança,
      processar coleta e confirmar gravação em `digital_screening_sessions`,
      `behavioral_signals`, `ai_requests`, `screening_fusions` (se houver M-CHAT) + arquivo
      no bucket `screening-media`. _Estado: não concluído._
- [x] **Atualizar documentação de handoff** (`HANDOFF.md`, `AI_CONTEXT.md`) para refletir a
      camada `lib/ai/` e a Triagem Digital. _(esta entrega)_
- [ ] **Restringir `images.remotePatterns`** em produção (hoje `hostname: "**"`).

## P1 — importante

- [ ] **Suite de testes mínima + CI de testes** — ver `TEST_PLAN.md`. Prioridade:
      auth/roles/RLS, M-CHAT, Triagem Digital, Storage, Server Actions, pipeline mock.
- [ ] **Geração de PDF** dos relatórios de triagem e evolutivos (sem dependência de IA).
- [ ] **Logging/observabilidade** em `lib/db/queries.ts` para parar de mascarar falhas de
      RLS/config (`safeList`/`safeOne` engolem erros). Ver `OBSERVABILITY.md`.
- [ ] **Documentar `AI_PROVIDER`/`AI_PROVIDER_FALLBACK`** no `.env.example`. _(parcial: já
      documentadas em `DEPLOY.md`/`ARCHITECTURE.md`)._

## P2 — melhoria

- [ ] Integrar **1º provider de IA real** numa etapa da pipeline (sugestão:
      detecção/rastreamento facial → destrava sinais 6–11) ou no resumo de genética
      (`lib/ai/genetics` já existe, dormente).
- [ ] Persistir **`game_sessions`** + novos jogos.
- [ ] Tabela **`settings`** + configurações persistentes.
- [ ] **Fluxo de convite/atribuição de papéis** por admin.
- [ ] Padronizar uploads/consentimento (componente `Checkbox`, reuso de `FileUploader`;
      remover o único `eslint-disable` em `components/app/facial-analysis.tsx`).
- [ ] Tornar a **visão geral da triagem** (`/app/triagem`) orientada ao estado real.

## P3 — futuro

- [ ] **Codegen de tipos** do Supabase (substituir `lib/db/types.ts` manual).
- [ ] **Sistema de migrations versionadas** (Supabase CLI).
- [ ] **Sentry/OpenTelemetry** para erros e tracing (ver `OBSERVABILITY.md`).
- [ ] Painel admin de auditoria de IA (`ai_requests`).
- [ ] Camada de **pesquisa** com dados anonimizados e consentidos.
- [ ] Detalhe individual do relatório de triagem.
