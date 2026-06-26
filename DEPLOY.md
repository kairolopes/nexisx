# DEPLOY.md — Ambientes e deploy do NexisX

## 1. Três ambientes

| Ambiente | Arquivo de env | Supabase | Deploy |
|---|---|---|---|
| **dev** | `.env.local` | projeto dev/pessoal | `npm run dev` (localhost) |
| **homologação** | `.env.homolog` ou Vercel Preview | projeto homolog (separado) | Vercel Preview Branch |
| **produção** | variáveis no painel Vercel/host | projeto produção | Vercel (branch `main`) |

> `.env.local` e `.env.homolog` **nunca são versionados** (`.gitignore`).
> Use `.env.example` e `.env.homolog.example` como templates sem segredos.

### Variáveis obrigatórias (todos os ambientes)

| Variável | Obrigatória | Onde usar | Observação |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | client + server | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | client + server | chave pública (RLS é o controle) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **somente backend** | nunca expor no client; usada em `lib/supabase/service.ts` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | auth/redirects/convites | deve coincidir com `Site URL` no Supabase Dashboard |
| `AI_PROVIDER` | ⬜ | server (camada de IA) | opcional; default `mock` |
| `AI_PROVIDER_FALLBACK` | ⬜ | server (camada de IA) | opcional; default `mock` |

> Sem `NEXT_PUBLIC_SUPABASE_URL` e `ANON_KEY`, a área `/app` só abre em **dev** com perfil demo admin.
> Em produção, sem sessão real → `/login`.

### Configuração obrigatória no Supabase Dashboard (todos os ambientes)

> **Authentication → URL Configuration**
> - `Site URL` = valor de `NEXT_PUBLIC_SITE_URL`
> - `Redirect URLs` → adicionar `{NEXT_PUBLIC_SITE_URL}/auth/callback`
>
> **Sem essa configuração o fluxo de convite de usuário falha silenciosamente.**
> O e-mail é enviado, mas o link retorna erro de URL não autorizada.

---

## 2. Aplicação dos SQLs (Supabase SQL Editor)

Execute **nesta ordem** em cada ambiente (dev, homolog, produção):

```
1. supabase/schema.sql           — tipos, tabelas, índices, triggers, funções
2. supabase/schema_rls.sql       — habilita RLS e cria políticas
3. supabase/storage.sql          — buckets privados + policies de Storage
4. supabase/screening_digital.sql — Triagem Digital (aditivo, idempotente)
5. supabase/seed.sql             — APENAS em dev (usuários demo, senha nexisx123)
```

> **`screening_digital.sql` é idempotente** — pode ser re-executado sem risco.
> Adiciona: `digital_screening_sessions`, `behavioral_signals`, `screening_fusions`,
> `ai_requests`, bucket `screening-media`. **Não altera `facial_analyses`.**

Como aplicar manualmente:
1. Supabase Dashboard → SQL Editor → New query
2. Abrir o arquivo localmente, copiar o conteúdo, colar e clicar **Run**
3. Confirmar mensagem "Success. No rows returned"

> ⚠️ **Nunca rode `seed.sql` em homologação ou produção.**

---

## 3. Checklist de aplicação no Supabase

- [ ] Projeto criado; `NEXT_PUBLIC_SUPABASE_URL` e `ANON_KEY` copiados para o env correto.
- [ ] `schema.sql` executado sem erros.
- [ ] `schema_rls.sql` executado; RLS habilitado em todas as tabelas
      (Table Editor → cada tabela → "RLS enabled").
- [ ] `storage.sql` executado; buckets `facial-photos`, `genetic-reports`, `child-documents`
      criados como **privados** (public = false).
- [ ] `screening_digital.sql` executado; tabelas da Triagem Digital com RLS habilitado;
      bucket `screening-media` criado como **privado**.
- [ ] Auth → e-mail/senha habilitado; confirmação de e-mail ON (recomendado).
- [ ] Auth → URL Configuration: `Site URL` = `NEXT_PUBLIC_SITE_URL`.
- [ ] Auth → Redirect URLs: contém `{NEXT_PUBLIC_SITE_URL}/auth/callback`.
- [ ] Primeiro admin promovido manualmente via SQL:
      `update profiles set role = 'admin' where id = '<uuid-do-usuario>';`
- [ ] **Diagnóstico** confirmado em `/app/diagnostico` (ver seção 6).

---

## 4. Checklist de RLS (com 2 contas)

- [ ] Responsável A vê apenas os filhos vinculados a ele.
- [ ] Profissional vê apenas crianças vinculadas (`child_professionals`).
- [ ] `/app/usuarios` como responsável → redireciona para `/app`.
- [ ] `update profiles set role='admin'` no próprio perfil (responsável) → **bloqueado**.
- [ ] Signup novo cria perfil sempre como `responsavel`.
- [ ] Upload de arquivo de uma criança fora do escopo → negado.
- [ ] URL assinada de arquivo expira (~5 min) e não é pública.

---

## 5. Build e deploy

```bash
# Verificações obrigatórias antes de qualquer deploy
npm install
npm run lint && npm run typecheck && npm run test && npm run build

# Dev local
npm run dev

# Produção local (após build)
npm run start

# Vercel (recomendado)
# Build command: npm run build
# Output directory: .next
# Configurar variáveis de ambiente no painel Vercel por ambiente (Preview / Production)
```

---

## 6. Página de diagnóstico (`/app/diagnostico`)

Rota protegida por `requireRole(["admin"])`. Exibe o estado da conexão e das tabelas
principais — útil em homologação para confirmar se o Supabase está configurado corretamente.

**Como acessar:** logar como admin → navegar para `/app/diagnostico` diretamente na URL.

**O que mostra:**
- Supabase conectado: sim/não
- Usuário autenticado: sim/não (e-mail)
- Role admin confirmado: sim/não
- Tabelas principais acessíveis: `children`, `mchat_sessions`, `screening_reports`
- `screening_digital.sql` aplicado: sim/não (detecta `digital_screening_sessions`)

**Segurança:** não expõe chaves, não usa `service_role`, não exibe dados sensíveis.
Apenas faz queries de contagem (`head: true`) via client com RLS do usuário logado.

---

## 7. O que ainda é protótipo (não levar a produção sem integração real)

| Item | Estado | Pendência |
|---|---|---|
| **IA (toda)** | mock determinístico; sem provider/SDK real | integrar provider real (`AI_PROVIDER`) por etapa |
| **Triagem Digital Assistiva** | fluxo + banco/Storage reais; resultado mock | provider real; validação E2E |
| **Análise facial** | upload real ✅; resultado simulado | integrar serviço de inferência |
| **Relatórios (PDF)** | não há exportação | gerar PDF |
| **Resumos de genética** | campos existem; sem geração automática | IA/serviço de resumo |
| **Jogos** | protótipo visual (jogo da memória) | persistir `game_sessions`, mais jogos |
| **Visão geral da triagem** | guia estático | tornar orientado a estado real |
| **Configurações** | formulário não persiste | tabela de settings (fase futura) |

---

## 8. Notas de segurança

- Papel é fonte única em `profiles`; nunca lido de `user_metadata`.
- Proteção em camadas: menu por papel → `requireRole()` na rota → RLS no banco.
- Arquivos acessíveis só por URL assinada temporária (5 min); buckets privados.
- `SUPABASE_SERVICE_ROLE_KEY` jamais no client — somente em Server Actions com `getActor(["admin"])` validado.
- Modo demo admin **só em dev** (`NODE_ENV !== "production"`).
