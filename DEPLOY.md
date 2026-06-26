# DEPLOY.md — Preparação para produção (Fase 2)

Guia para aplicar o NexisX em um projeto Supabase real e publicar.

## 1. Variáveis de ambiente obrigatórias

Copie `.env.example` para `.env.local` (dev) ou configure no provedor de deploy:

| Variável | Obrigatória | Onde usar | Observação |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | client + server | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | client + server | chave pública (RLS é o controle) |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | **somente backend** | nunca expor no client; usar só em rotinas administrativas |
| `NEXT_PUBLIC_SITE_URL` | ✅ | auth/redirects | ex.: `https://app.nexisx.com.br` |
| `AI_PROVIDER` | ⬜ | server (camada de IA) | opcional; default `mock`. Hoje só `mock` existe |
| `AI_PROVIDER_FALLBACK` | ⬜ | server (camada de IA) | opcional; default `mock`. Lido em `lib/ai/core/registry.ts` |

> Sem as duas primeiras, a área `/app` só abre em **dev** (perfil demo admin). Em
> produção, sem sessão real → redireciona para `/login`.

## 2. Ordem de aplicação dos SQLs (SQL Editor do Supabase)

Execute **nesta ordem**:

1. `supabase/schema.sql` — tipos, tabelas, índices, triggers e funções.
2. `supabase/schema_rls.sql` — habilita RLS e cria as políticas.
3. `supabase/storage.sql` — buckets privados e policies de Storage.
4. `supabase/screening_digital.sql` — **aditivo** da Triagem Digital Assistiva: tabelas
   (`digital_screening_sessions`, `behavioral_signals`, `screening_fusions`, `ai_requests`),
   RLS e bucket privado `screening-media`. Idempotente; **não altera `facial_analyses`**.
5. `supabase/seed.sql` — **APENAS em desenvolvimento** (cria usuários demo, senha `nexisx123`).

> ⚠️ **Nunca** rode `seed.sql` em produção (insere direto em `auth.users`).

## 3. Checklist de aplicação no Supabase

- [ ] Projeto criado; `NEXT_PUBLIC_SUPABASE_URL` e `ANON_KEY` copiados.
- [ ] `schema.sql` executado sem erros.
- [ ] `schema_rls.sql` executado; confirmar **RLS habilitado** em todas as tabelas
      (Table Editor → cada tabela → "RLS enabled").
- [ ] `storage.sql` executado; confirmar buckets `facial-photos`, `genetic-reports`,
      `child-documents` criados como **privados** (public = false).
- [ ] `screening_digital.sql` executado; confirmar tabelas da Triagem Digital com **RLS
      habilitado** e bucket `screening-media` criado como **privado** (public = false).
- [ ] Auth: provedor de e-mail/senha habilitado; (recomendado) confirmação de e-mail ON.
- [ ] Auth → **URL Configuration**: `Site URL` = `NEXT_PUBLIC_SITE_URL`; adicionar
      `{SITE_URL}/auth/callback` em **Redirect URLs** (obrigatório para convites funcionarem).
- [ ] Em produção: `seed.sql` **NÃO** aplicado.
- [ ] Primeiro admin promovido manualmente (não há auto-admin):
      `update profiles set role = 'admin' where id = '<uuid-do-usuario>';`

## 4. Checklist de teste de RLS com 2 contas

Crie dois usuários reais (ou use o seed em dev) com papéis diferentes e valide:

- [ ] **Responsável A** vê apenas os filhos vinculados a ele; não vê filhos de outro responsável.
- [ ] **Profissional** vê apenas crianças vinculadas (`child_professionals`).
- [ ] Acessar `/app/usuarios` como **responsável** → redireciona para `/app` (requireRole).
- [ ] Responsável tenta `update profiles set role='admin'` no próprio perfil → **bloqueado**
      (trigger `enforce_role_change`); papel permanece.
- [ ] Signup novo cria perfil sempre como `responsavel` (nunca admin).
- [ ] Upload de foto/laudo de uma criança fora do escopo → negado pelas policies de Storage.
- [ ] URL assinada de arquivo expira (testar após ~5 min) e não é pública.

## 5. Build e deploy

```bash
npm install
npm run lint && npm run typecheck && npm run build
npm run start   # produção local

# Vercel (recomendado p/ Next.js): configurar as variáveis de ambiente no painel
# e fazer deploy do repositório. Build command: `npm run build`.
```

## 6. O que ainda é protótipo (não levar a produção sem integração real)

| Item | Estado | Pendência |
|---|---|---|
| **IA (toda)** | mock determinístico; **sem provider/SDK real** | integrar provider real (`AI_PROVIDER`) por etapa/capacidade |
| **Triagem Digital Assistiva** | fluxo + banco/Storage reais; **resultado mock** | provider real; concluir validação E2E |
| **Análise facial** | upload real da foto ✅; resultado **simulado** | integrar serviço de inferência (IA) |
| **Relatórios (PDF)** | não há exportação | gerar PDF |
| **Resumos de genética** | campos existem; sem geração automática | IA/serviço de resumo |
| **Jogos** | protótipos visuais (jogo da memória) | persistir `game_sessions`, mais jogos |
| **Visão geral da triagem** | guia estático de etapas | tornar orientado a estado real |
| **Configurações** | formulário não persiste | tabela de settings (fase futura) |
| **Convite/cadastro de usuários** | ✅ implementado (`inviteUser`, `/auth/callback`) | configurar `Redirect URLs` no Supabase Dashboard |

## 7. Notas de segurança

- Papel é fonte única em `profiles`; nunca lido de `user_metadata`.
- Proteção em camadas: menu por papel → `requireRole()` na rota → RLS no banco.
- Arquivos só por **URL assinada temporária**; buckets privados.
- `SUPABASE_SERVICE_ROLE_KEY` jamais no client.
