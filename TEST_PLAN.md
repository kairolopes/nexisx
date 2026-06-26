# TEST_PLAN.md — Plano de testes do NexisX

> Define **quais testes serão obrigatórios** e em que ordem implementá-los.
>
> **Estado (P0.1 entregue):** Vitest configurado e **39 testes** já existem cobrindo M-CHAT,
> validações, `runAction`/`ActionResult`, idade e a camada de IA mock (unit, ambiente Node).
> Falta ainda a **camada de integração/RLS** (precisa de projeto Supabase de teste) e os
> **E2E** (Playwright). Scripts: `npm run test` · `test:watch` · `test:coverage`.

## Ferramentas recomendadas (a adotar)

- **Unit/integração:** [Vitest](https://vitest.dev) — rápido, compatível com TS/ESM, sem
  acoplar a runtime do Next.
- **E2E:** [Playwright](https://playwright.dev) — fluxos de browser reais.
- **RLS/banco:** testes SQL contra um projeto Supabase de teste (ou `pg_tap`), executados com
  dois usuários de papéis diferentes.
- Adicionar script `"test"` ao `package.json` e um job de testes ao quality-gate quando os
  primeiros testes existirem.

## Prioridade de cobertura (obrigatórios)

### 1. Auth / Roles / RLS — 🔴 prioridade máxima
- **Unit:** `navForRole()` retorna apenas itens permitidos por papel (`lib/navigation.ts`).
- **Unit:** `requireRole`/`getActor` redirecionam/lançam corretamente (`lib/guard.ts`).
- **RLS (integração SQL, 2 contas):**
  - responsável A só vê seus filhos; não vê filhos de B;
  - profissional só vê crianças vinculadas (`child_professionals`);
  - escola só vê crianças autorizadas (`child_schools.authorized`);
  - `update profiles set role='admin'` por não-admin é revertido (`enforce_role_change`);
  - signup cria perfil sempre `responsavel` (`handle_new_user`);
  - `ai_requests` só acessível por admin.

### 2. M-CHAT — 🔴
- **Unit:** classificação de risco (`score>=8` alto, `>=3` moderado, senão baixo) em `lib/mchat.ts`.
- **Integração:** `saveMchatSession`/`saveMchatAnswers` persistem sessão+respostas;
  geração de `screening_reports` quando profissional/admin.

### 3. Triagem Digital Assistiva — 🔴
- **Unit (pipeline):** determinismo — mesma mídia (mesmo `seedHex`) → mesma saída; faixas
  [0,1] dos sinais; foto pula sinais só-de-vídeo (piscar/motor).
- **Unit:** `aggregateSignals` (risco ponderado por confiança), `capture-quality`
  (`recaptureRequired` quando baixa), `fuseScreening` (adota maior risco; concordância eleva
  confiança; casos só-comportamental / só-M-CHAT / sem dados).
- **Integração:** `createDigitalScreening` grava as 4 tabelas e a auditoria; falha de IA →
  sessão `status='erro'` + `ai_requests.success=false`.

### 4. Storage — 🟡
- **Unit:** validação de MIME/extensão/tamanho e montagem do caminho `<child_id>/<uuid>.<ext>`
  (`lib/storage/index.ts`).
- **Integração:** upload fora de escopo é negado pelas policies; URL assinada expira.

### 5. Server Actions — 🟡
- **Unit:** `lib/validation.ts` (`requiredText`, `requiredUuid`, `intInRange`, `oneOf`...).
- **Integração:** `runAction` converte `ValidationError`/`AuthzError` em `ActionResult` e
  mascara erros inesperados (nunca vaza stack).

### 6. Pipeline de IA mock — 🟡
- **Unit:** `resolveProvider` respeita `AI_PROVIDER`/fallback e lança em provider desconhecido
  ou capacidade não suportada (`lib/ai/core/registry.ts`).
- **Unit:** cada `PipelineStage` mock honra seu contrato de entrada/saída.

## E2E (Playwright) — fluxos mínimos
- Login → dashboard.
- Acesso a rota restrita por URL com papel errado → redireciona para `/app`.
- M-CHAT completo → relatório.
- Triagem Digital: criar criança → upload → consentimento → processar → resultado na tela.

## Critérios
- **Gate de PR:** lint + typecheck + build verdes (já no CI) **e**, à medida que existirem,
  os testes unit/integração das áreas tocadas.
- **Cobertura-alvo inicial:** 100% das funções de segurança (`guard`, `navigation`,
  triggers via SQL) e da lógica determinística da pipeline/M-CHAT antes de qualquer
  integração de IA real.
