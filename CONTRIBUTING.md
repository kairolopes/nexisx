# CONTRIBUTING.md — Guia de contribuição do NexisX

> Processo de engenharia do NexisX. Leitura obrigatória antes de contribuir. As regras
> permanentes estão em `PROJECT_RULES.md` (a "constituição"); aqui está o **processo**.

## Antes de começar
Leia: `PROJECT_RULES.md`, `ARCHITECTURE.md`, `CONTEXT.md`, `CHANGELOG.md` e o `HANDOFF.md`.
**Nenhuma implementação começa antes dessa leitura.**

## Rodar localmente
```bash
npm install
cp .env.example .env.local      # preencher com o projeto Supabase
npm run dev                     # http://localhost:3000 (ou próxima porta livre)
```
Banco (SQL Editor do Supabase, nesta ordem): `schema.sql → schema_rls.sql → storage.sql →
screening_digital.sql` (→ `seed.sql` **só em dev**). Ver `DEPLOY.md`.

## Comandos obrigatórios antes de commit
```bash
npm run lint
npm run typecheck
npm run build
```
**Os três precisam estar verdes.** Quando houver testes, rodar `npm run test` também.

## Padrão de branch
- `feat/<escopo>` · `fix/<escopo>` · `chore/<escopo>` · `docs/<escopo>` · `refactor/<escopo>`
- Branch principal de PR: `main`. Trabalho consolidado por merge.

## Padrão de commit (semântico, pt-BR)
- Formato: `tipo(escopo): descrição` — ex.: `feat(storage): adicionar bucket screening-media`.
- Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `merge`.
- **Nunca** commitar segredos. `.env.local` jamais versionado (só `.env.example`).
- Tags marcam marcos (ex.: `v1.0-foundation`).

## Checklist de Pull Request
- [ ] `npm run lint && npm run typecheck && npm run build` verdes (e `test` quando existir).
- [ ] Idioma pt-BR em UI e textos.
- [ ] Página restrita nova chama `requireRole([...])` no topo (Server Component).
- [ ] Escrita só via Server Action (`getActor` + validação + `runAction` → `ActionResult`).
- [ ] Leitura só via `lib/db/queries.ts` (página não chama Supabase direto).
- [ ] Tabela nova com `child_id` adicionada ao array `child_tables` em `schema_rls.sql`.
- [ ] Storage: caminho `<child_id>/<uuid>.<ext>`; bucket privado; acesso por URL assinada.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` não usada no client.
- [ ] Avisos obrigatórios preservados (triagem/análise facial/genética não fecham diagnóstico).
- [ ] Sem dados/depoimentos fabricados.
- [ ] `prefers-reduced-motion` respeitado; componentes `ui/` reutilizados.
- [ ] **`CHANGELOG.md` atualizado** e, se houver mudança de arquitetura/decisão,
      **`CONTEXT.md`** (e ADR em `docs/adr/` quando for decisão estrutural).

## Regra de documentação
Toda mudança relevante **atualiza `CHANGELOG.md`** (formato Keep a Changelog, pt-BR). Mudança
de arquitetura ou decisão técnica **atualiza `CONTEXT.md`** e, se for uma decisão estrutural
duradoura, ganha um **ADR** em `docs/adr/`. Mudança em regra permanente atualiza
`PROJECT_RULES.md`.

## O que NÃO fazer sem revisão/justificativa
- Enfraquecer auth/roles/RLS, triggers de papel ou `can_access_child`.
- Ler papel de `user_metadata`.
- Tornar buckets públicos ou servir arquivos sem URL assinada.
- Expor `SUPABASE_SERVICE_ROLE_KEY` no client; introduzir fallback admin em produção.
- Quebrar a fronteira da IA (`lib/ai/index.ts`) importando provider concreto fora dela.
