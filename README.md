# NexisX

Portal SaaS premium de **neurodesenvolvimento, triagem inteligente e ambientes sensoriais**.
Reúne site público institucional + sistemas internos protegidos por login: triagem
(análise facial assistida + M-CHAT), acompanhamento contínuo do neurodivergente, área
de genética/exoma, salas sensoriais e dashboard administrativo com controle por papéis.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + componentes estilo **shadcn/ui**
- **Framer Motion** (+ `AnimatePresence`) para transições e microinterações
- **Canvas 2D + requestAnimationFrame** (campo de partículas do hero)
- **Tailwind keyframes** (efeitos leves: float, shimmer, gradient-pan)
- **Supabase** — Auth, PostgreSQL, Storage e **RLS**

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env.local   # preencha com seu projeto Supabase

# 3. Banco de dados (no SQL Editor do Supabase, nesta ordem)
#    supabase/schema.sql
#    supabase/schema_rls.sql
#    supabase/storage.sql   # buckets privados + policies de Storage
#    supabase/seed.sql      # opcional — apenas em DEV (usuários demo, senha nexisx123)

# 4. Desenvolvimento
npm run dev

# 5. Verificações
npm run lint
npm run typecheck
npm run build
```

> Sem variáveis do Supabase configuradas, a área `/app` abre com uma **conta demo
> (admin)** para que a interface possa ser navegada localmente.

## Estrutura

```
app/
  (site)/            # site público (home + páginas institucionais)
  login/             # autenticação
  app/               # área protegida (dashboard + sistemas internos)
components/
  ui/                # componentes base (button, card, badge, input...)
  site/ app/ effects/# blocos do site, do dashboard e efeitos visuais
lib/
  supabase/          # clients (browser, server, middleware)
  db/                # camada de dados: types.ts + queries.ts (leitura tipada)
  actions/           # Server Actions de escrita (validadas + autorizadas)
  storage/           # upload seguro + URLs assinadas (Supabase Storage)
  auth.ts guard.ts navigation.ts mchat.ts validation.ts age.ts types.ts utils.ts
supabase/
  schema.sql schema_rls.sql
```

## Documentação

- [DEPLOY.md](DEPLOY.md) — variáveis, ordem dos SQLs, checklists de Supabase/RLS e deploy
- [CONTEXT.md](CONTEXT.md) — contexto e decisões de arquitetura
- [PRODUCT.md](PRODUCT.md) — visão de produto e módulos
- [DATABASE.md](DATABASE.md) — modelo de dados e RLS
- [CLAUDE.md](CLAUDE.md) — guia para desenvolvimento assistido
- [CHANGELOG.md](CHANGELOG.md)

## Aviso

O NexisX **não substitui** médico, neuropediatra, geneticista, psicólogo ou qualquer
profissional habilitado. As ferramentas auxiliam na **triagem** e na **organização de
informações**, orientando os próximos passos.
