# CLAUDE.md — Guia para desenvolvimento assistido

## Sobre o projeto
NexisX é um portal SaaS (Next.js 14 App Router, TypeScript, Tailwind, Supabase) com
site público + sistemas internos protegidos por login e RLS.

## Comandos
- `npm run dev` — desenvolvimento
- `npm run lint` — ESLint (next/core-web-vitals)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — build de produção

## Convenções
- **Idioma:** UI e textos em **português (pt-BR)**.
- **Imports:** alias `@/*` aponta para a raiz do projeto.
- **Componentes UI** ficam em `components/ui` (estilo shadcn). Reutilize `Button`,
  `Card`, `Badge`, `Input`, `Label`, `Textarea`, `Progress`.
- **Server vs Client:** páginas em `app/app/**` são Server Components por padrão;
  interações (formulários, jogos, animações com estado) ficam em componentes `"use client"`.
- **Supabase:** use `lib/supabase/server.ts` em Server Components/Actions,
  `lib/supabase/client.ts` no browser e `lib/supabase/middleware.ts` para refresh de sessão.
- **Auth/roles:** papéis em `lib/types.ts` (`Role`). Navegação por papel em
  `lib/navigation.ts`. Perfil da sessão em `lib/auth.ts` (com fallback demo admin).
- **Efeitos visuais:** `components/effects` (ParticleField em Canvas 2D, Reveal/Stagger
  com Framer Motion). Keyframes Tailwind em `tailwind.config.ts`.

## Banco de dados
Toda tabela com dados de criança usa `child_id` e é protegida pela função
`can_access_child()` no RLS (ver `supabase/schema_rls.sql`). Ao adicionar tabela nova
com `child_id`, inclua-a no array `child_tables` do bloco de políticas.

## Cuidados
- Manter os **avisos obrigatórios** (análise facial e M-CHAT não fecham diagnóstico).
- Não expor `SUPABASE_SERVICE_ROLE_KEY` no client.
- Sempre rodar `lint`, `typecheck` e `build` antes de concluir mudanças.
