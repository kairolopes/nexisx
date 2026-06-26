# 0005 — Server Actions como única via de escrita

- **Status:** Aceito
- **Contexto data:** Fase 2 · Bloco B (camada de dados e Server Actions)

## Contexto
Precisamos de uma fronteira de escrita consistente, validada e autorizada, sem expor o
Supabase nas páginas nem vazar erros/stack para a UI, mantendo o RLS respeitado (operações
server-side com cookies).

## Decisão
Toda **escrita** passa por **Server Actions** em `lib/actions/*` (`"use server"`). Páginas
**nunca** chamam o Supabase diretamente; **leitura** vai por `lib/db/queries.ts` (tipada,
tolerante a falha). Cada action segue o padrão: `getActor([roles])` (autz) + validação
(`lib/validation.ts`) + operação, tudo envolvido por `runAction` (`lib/actions/helpers.ts`),
que devolve `ActionResult` (`{ ok, data } | { ok: false, error }`) e **nunca lança stack para
a UI**. Após escrita no client → `router.refresh()`.

## Consequências
- **Positivas:** fronteira única e previsível; validação/autorização em todo lugar; erros
  tratados; RLS sempre respeitado (client server-side); UI desacoplada do banco.
- **Negativas / trade-offs:** `queries.ts` engole erros (resiliência da UI) e pode mascarar
  falhas de RLS — ver `TECH_DEBT.md` D2 e `OBSERVABILITY.md`.

## Não fazer
Chamar Supabase direto em páginas/componentes; lançar exceção crua para a UI; pular
`getActor`/validação numa action.
