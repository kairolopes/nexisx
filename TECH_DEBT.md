# TECH_DEBT.md — Dívida técnica, riscos e plano de correção

> Registro honesto de dívidas técnicas e riscos do NexisX, com plano de correção. Atualize
> quando uma dívida for criada, mitigada ou quitada. Severidade: 🔴 alta · 🟡 média · 🟢 baixa.

## Dívidas técnicas

| # | Dívida | Sev. | Onde | Impacto | Plano de correção |
|---|---|---|---|---|---|
| D1 | **Ausência de testes automatizados** | 🔴 | projeto todo | refactor às cegas; regressões silenciosas em segurança | Implementar `TEST_PLAN.md` (Vitest + Playwright); começar por auth/RLS e lógica determinística |
| D2 | ~~Queries engolem erros~~ **(mitigado)** | 🟢 | `lib/db/queries.ts` | resolvido: `lib/logger.ts` + logging classificado (RLS/auth/query/conexão), sem PII; retornos preservados | Estender o mesmo logging a `storage`/`ai`/`runAction` |
| D3 | **Tipos do banco escritos à mão** | 🟡 | `lib/db/types.ts` | divergência possível com o schema real | Codegen via Supabase CLI (P3) |
| D4 | **Sem migrations versionadas** | 🟡 | `supabase/*.sql` | aplicação manual frágil entre ambientes; risco de drift | Adotar Supabase CLI migrations (P3) |
| D5 | **IA 100% mock** | 🟡 | `lib/ai/providers/mock.ts` | resultados não são reais (análise facial fixa "Atenção moderada") | Integrar provider real por etapa da pipeline (P2) — sem alterar contratos |
| D6 | **Domínio de IA de genética dormente** | 🟢 | `lib/ai/genetics/*` | código não plugado em nenhuma tela/action | Plugar a `genetic_exam_requests` quando houver provider, ou marcar claramente como WIP |
| D7 | **`game_sessions` e `settings` não usadas** | 🟢 | banco/UI | funcionalidades parciais (jogos/config não persistem) | Implementar persistência (P2) |
| D8 | ~~`images.remotePatterns: "**"`~~ **(resolvido)** | 🟢 | `next.config.mjs` | restrito a `*.supabase.co` | — |
| D9 | **`AI_PROVIDER*` fora do `.env.example`** | 🟢 | config | variável lida em `registry.ts` sem documentação no exemplo | Adicionar ao `.env.example` (P1) |
| D10 | **Componentes de upload/consentimento divergentes** | 🟢 | `components/app/facial-analysis.tsx` | `<input>`/`<select>`/`<img>` ad-hoc; único `eslint-disable` do projeto | Reusar `FileUploader`/`Select`, extrair `Checkbox` (P2) |
| D11 | **Sem CI/CD de deploy** | 🟢 | infra | deploy manual | Manter quality-gate; avaliar deploy automático após testes |
| D12 | **Sem rate limiting** | 🟡 | actions/middleware | abuso/custo no lead público anônimo e nas actions de IA/upload | **Documentado, não implementado** (exigiria Redis/serviço novo — fora do escopo atual). Estratégia: rate limit por IP no endpoint público + token bucket por usuário nas actions de IA (Upstash Redis) quando a arquitetura permitir |

## Riscos técnicos

- **R1 (segurança):** qualquer refactor em `handle_new_user`, `enforce_role_change`,
  `can_access_child` ou no array `child_tables` pode abrir acesso indevido a dados de
  crianças. **Mitigação:** testes de RLS (D1) + revisão obrigatória + checklist do `DEPLOY.md`.
- **R2 (silenciamento):** por D2, uma RLS mal configurada em produção pode passar
  despercebida como "tela vazia". **Mitigação:** logging/observabilidade.
- **R3 (drift de tipos):** por D3/D4, schema e tipos podem dessincronizar. **Mitigação:**
  codegen + migrations.
- **R4 (expectativa de IA):** a IA é mock; stakeholders podem confundir com resultado real.
  **Mitigação:** avisos obrigatórios na UI (já presentes) + clareza nos docs.

## Pontos frágeis do código

- Camada `lib/ai/` é nova e **sem cobertura de teste**; calibração dos sinais mock não
  auditada numericamente.
- Fusão M-CHAT depende do M-CHAT mais recente via `maybeSingle()` — comportamento correto,
  mas não testado.
- Pipeline determinística depende de `seedHex` derivado dos bytes da mídia.
