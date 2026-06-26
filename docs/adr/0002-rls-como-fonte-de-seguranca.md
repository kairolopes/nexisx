# 0002 — RLS como fonte de verdade da segurança

- **Status:** Aceito
- **Contexto data:** Fase 2 · Bloco A (hardening de auth/roles)

## Contexto
Dados de crianças são sensíveis. Controle de acesso só no frontend ou só nas Server Actions é
insuficiente: bugs de UI, chamadas diretas ou erros de autorização poderiam expor dados.

## Decisão
A **autorização real reside no RLS do PostgreSQL**, não na aplicação. A função
`can_access_child(child_id)` (SECURITY DEFINER) é o centro: `true` para admin, responsável
dono, profissional vinculado ou escola autorizada. Toda tabela com `child_id` herda políticas
padrão e deve constar no array `child_tables` de `supabase/schema_rls.sql`. Sobre o RLS, há
**defesa em profundidade**: UI (`navForRole`) → rota (`requireRole`) → RLS.

Complementos: papel lido **só** de `profiles` (nunca `user_metadata`); signup sempre
`responsavel` (`handle_new_user`); troca de papel por não-admin revertida
(`enforce_role_change`); `ai_requests` exclusiva de admin (`is_admin()`).

## Consequências
- **Positivas:** mesmo uma falha na app não vaza dados; uma única fonte de verdade; regras
  testáveis com 2 contas (ver `DEPLOY.md` / `TEST_PLAN.md`).
- **Negativas / trade-offs:** lógica de segurança em SQL (curva de aprendizado); ao criar
  tabela com `child_id` é fácil esquecer o array `child_tables` (mitigado por checklist no
  `CONTRIBUTING.md`). Erros de RLS podem aparecer como "tela vazia" por D2 do `TECH_DEBT.md`.

## Não fazer
Enfraquecer triggers/funções de segurança ou ler papel do cliente. Qualquer alteração exige
revisão e teste de RLS.
