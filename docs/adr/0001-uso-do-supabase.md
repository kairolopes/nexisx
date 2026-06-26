# 0001 — Uso do Supabase como backend

- **Status:** Aceito
- **Contexto data:** Fase 1 (fundação do projeto)

## Contexto
O NexisX precisa de autenticação, banco relacional, armazenamento de arquivos sensíveis e
controle de acesso fino por papel, com foco em privacidade (dados de crianças, LGPD by
design) e velocidade de desenvolvimento por uma equipe pequena.

## Decisão
Adotar o **Supabase** como backend único: **Auth** (e-mail/senha via `@supabase/ssr`),
**PostgreSQL**, **Storage** e **Row Level Security (RLS)**. Sem backend dedicado nem
microsserviços; a lógica server-side vive em Server Components/Actions do Next.js.

## Consequências
- **Positivas:** um só provedor para auth+dados+storage; RLS no banco como barreira de
  segurança real; Postgres maduro; integração nativa com Next via `@supabase/ssr`.
- **Negativas / trade-offs:** acoplamento ao Supabase; ausência de migrations versionadas
  hoje (SQL aplicado manualmente — ver `TECH_DEBT.md` D4); tipos do banco escritos à mão
  (D3). Edge Functions não utilizadas.
- **Mitigações futuras:** adotar Supabase CLI para migrations e codegen de tipos (ROADMAP P3).

## Alternativas consideradas
- Backend próprio (Node/NestJS) + Postgres gerenciado: mais controle, muito mais esforço.
- Firebase: NoSQL não atende ao modelo relacional/consultas por papel com a mesma clareza.
