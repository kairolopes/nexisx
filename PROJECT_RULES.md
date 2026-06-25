# PROJECT_RULES.md — A constituição do NexisX

> Regras **permanentes** do projeto. Este é o documento de governança: as decisões aqui
> registradas têm precedência e **não devem ser alteradas sem justificativa explícita e
> registro no `CHANGELOG.md`**. Para contexto rápido ver `AI_CONTEXT.md`; para o estado
> detalhado ver `HANDOFF.md`.
>
> **Hierarquia documental:** `PROJECT_RULES.md` (regras) > `CLAUDE.md` (guia operacional) >
> demais docs (contexto/estado). Em conflito, vale a regra mais restritiva de segurança.

## 0. Leitura obrigatória antes de implementar
Antes de qualquer alteração, ler: `README.md`, `AI_CONTEXT.md`, `HANDOFF.md`, `CONTEXT.md`,
`CHANGELOG.md`, `DATABASE.md`, `DEPLOY.md`. **Nenhuma implementação começa antes disso.**

---

## 1. Stack (fixa — não trocar sem justificativa)
- **Next.js 14 (App Router)** + **React 18** + **TypeScript** (strict).
- **Tailwind CSS** + componentes estilo **shadcn** sobre **Radix UI**.
- **Framer Motion** (animação) + **Canvas 2D / requestAnimationFrame** (hero).
- **lucide-react** (ícones).
- **Supabase** — Auth (`@supabase/ssr`), PostgreSQL, Storage e **RLS**.
- **Alias de import:** `@/*` aponta para a raiz do projeto.
- Não introduzir libs pesadas/duplicadas (ex.: outro framework de UI, outro state manager,
  ORM) sem justificativa registrada.

---

## 2. Arquitetura (decisões permanentes)
1. **Route groups:** `app/(site)` (público), `app/app` (protegido), `app/login` (auth).
   `middleware.ts` redireciona `/app/*` sem sessão para `/login`.
2. **Server Components por padrão** em `app/app/**`. Só usar `"use client"` quando há
   estado/interação (formulários, jogos, animação com estado, overlays Radix, toasts).
3. **Camada de dados isolada — regra dura:** páginas **nunca** chamam o Supabase
   diretamente.
   - **Leitura** → `lib/db/queries.ts` (tipada por entidade, tolerante a falha).
   - **Escrita** → Server Actions em `lib/actions/*`.
4. **Server Actions** sempre: autorizam com `getActor([roles])` (`lib/guard.ts`), validam
   com `lib/validation.ts`, são envolvidas por `runAction` e retornam `ActionResult`
   (`{ok,data} | {ok:false,error}`). **Nunca lançam stack para a UI.**
5. **Clients Supabase:** `lib/supabase/server.ts` (Server Components/Actions),
   `lib/supabase/client.ts` (browser), `lib/supabase/middleware.ts` (refresh de sessão).
   Todas as operações usam o client server-side quando possível → cookies → RLS respeitado.
6. **Após escrita no client:** chamar `router.refresh()`.

---

## 3. Estrutura de pastas (canônica)
```
app/
  (site)/   site público (home + institucionais) · loading/error
  app/       área protegida · layout (sidebar+topbar) · template (transição) · segmentos
  login/     autenticação
  layout.tsx · globals.css · not-found.tsx · global-error.tsx
components/
  ui/        base (Radix/shadcn): avatar, badge, button, card, dialog, input, label,
             progress, select, separator, sheet, skeleton, tabs, textarea, toast, tooltip
  app/       plataforma (stat-card, tasks-board, timeline, mchat-form, file-uploader, ...)
  site/      marketing (navbar, footer, journey, credibility, genetics-flow, ...)
  auth/      login-form
  effects/   particle-field (Canvas), reveal (Reveal/Stagger)
lib/
  supabase/ (server|client|middleware) · db/ (queries.ts, types.ts) · actions/* · storage/
  auth.ts guard.ts navigation.ts mchat.ts validation.ts age.ts types.ts utils.ts
supabase/ schema.sql · schema_rls.sql · storage.sql · seed.sql
```
- **Componentes UI base** ficam em `components/ui` — reutilizar antes de criar novos.
- **Novos módulos internos** entram em `app/app/<modulo>` como Server Component que chama
  `requireRole([...])`.

---

## 4. Padrões de código / convenções
- **Idioma:** UI e textos em **português (pt-BR)**.
- **Tipos do banco** em `lib/db/types.ts`; papéis/enums de domínio em `lib/types.ts`.
- **Validação** sem dependências em `lib/validation.ts` (`requiredText`, `optionalText`,
  `requiredUuid`, `optionalUuid`, `optionalDate`, `intInRange`, `oneOf`).
- Reutilizar utilitários premium do `globals.css` e componentes `ui/` antes de valores
  avulsos ou componentes ad-hoc.
- **Antes de concluir qualquer mudança:** `npm run lint && npm run typecheck && npm run build`.

---

## 5. Fluxo Git e versionamento
- Trabalho por **branches de feature** (`feat/...`, `fix/...`, `chore/...`, `docs/...`),
  consolidadas em `main` por merge.
- **Commits semânticos** (`feat`, `fix`, `chore`, `docs`, `merge`) em português, escopo
  entre parênteses (ex.: `feat(storage): ...`).
- **Tags** marcam marcos (ex.: `v0.2.5-fase-2-5`).
- Não commitar segredos. `.env.local` nunca versionado; só `.env.example`.
- Branch principal de PRs: `main`.

---

## 6. Regras de documentação
- `CHANGELOG.md` segue *Keep a Changelog* (pt-BR) — **todo marco relevante é registrado**.
- Documentos de governança/handoff: `PROJECT_RULES.md`, `HANDOFF.md`, `AI_CONTEXT.md`.
  Mantê-los coerentes quando a arquitetura mudar.
- Datas relativas devem ser convertidas para absolutas nos documentos.
- Mudança que afete regras desta constituição → atualizar este arquivo **e** o `CHANGELOG`.

---

## 7. Segurança (NUNCA enfraquecer)
1. **Papel é fonte única em `profiles`** — **nunca** lido de `user_metadata`/
   `raw_user_meta_data` (controlável pelo cliente).
2. **Defesa em profundidade (3 camadas):** UI (`navForRole`) → rota (`requireRole([...])` no
   topo de **toda** página restrita) → **RLS** no banco (fonte de verdade).
3. **Signup entra sempre como `responsavel`** (`handle_new_user`). Promoção de papel só por
   **admin** ou **service_role/SQL direto** (`enforce_role_change` reverte troca por
   não-admin).
4. **`SUPABASE_SERVICE_ROLE_KEY` jamais no client** — só backend/rotinas administrativas.
5. **Modo demo admin só em dev** (`NODE_ENV !== "production"`). Em produção, sem sessão →
   `null` → `/login`. Nunca há fallback admin em produção.
6. **Seed (`seed.sql`) só em dev** — insere direto em `auth.users` (senha `nexisx123`).
7. Não expor stack traces na UI; `error.tsx`/`global-error.tsx` tratam erros.

---

## 8. Autenticação e permissões
- Supabase Auth via `@supabase/ssr` (cookies). Perfil/papel em `profiles` (trigger no signup).
- **Papéis** (`lib/types.ts`): `admin`, `responsavel`, `profissional`, `escola`, `consultor`.
- **Navegação por papel** em `lib/navigation.ts` (`navForRole`).
- **Guards** (`lib/guard.ts`): `requireSession()`, `requireRole(roles[])` (rota, redireciona),
  `getActor(roles?)` (actions, lança `AuthzError`).
- **Acesso por papel (resumo):** admin = tudo · responsavel = seus filhos · profissional =
  crianças vinculadas (`child_professionals`) · escola = crianças autorizadas
  (`child_schools.authorized`) · consultor = solicitações comerciais/exames.

---

## 9. Supabase, RLS e Storage
### RLS (fonte de verdade da segurança de dados)
- **RLS habilitado em todas as tabelas.** `can_access_child(child_id)` é o centro da
  autorização (admin, responsável dono, profissional vinculado ou escola autorizada).
- **Toda tabela com `child_id`** herda políticas padrão de `select`/escrita e **deve ser
  adicionada ao array `child_tables`** em `supabase/schema_rls.sql`.
- Tabelas derivadas (`mchat_answers`, `task_completions`) verificam acesso pela entidade-pai.
- Funções/triggers protegidos: `handle_new_user`, `enforce_role_change`, `current_role`,
  `is_admin`, `can_access_child` — **não alterar a lógica de segurança sem revisão**.

### Storage
- 3 buckets **privados**: `facial-photos`, `genetic-reports`, `child-documents`.
- **Convenção de caminho obrigatória:** `<child_id>/<uuid>.<ext>` (1º segmento = `child_id`),
  para as policies reusarem `can_access_child()` via `storage_child_id(name)`.
- Acesso a arquivos **só por URL assinada temporária** (`getSignedFileUrl`, padrão 300s).
  Nada público.
- Upload sempre por `lib/storage/` + Server Actions de `lib/actions/uploads.ts`, com
  validação de MIME/extensão/tamanho (8 MB fotos / 20 MB laudos e documentos).
- **Ordem de aplicação dos SQLs:** `schema.sql` → `schema_rls.sql` → `storage.sql`
  (→ `seed.sql` só em dev).

---

## 10. UX/UI e Design System
### Princípios
Sofisticado, futurista e acolhedor (saúde + tecnologia): glassmorphism leve, gradientes,
Sora (display) + Inter (sans), muito espaço em branco, responsividade total.

### Design tokens (em `app/globals.css`, HSL) — preferir a valores avulsos
- Cores: `--primary` (ciano), `--secondary` (teal), `--accent` (roxo), `--muted-foreground`
  com contraste **AA** (~5:1). Dark mode completo (`.dark`).
- **Elevação:** `--shadow-1..4` → utilitários `elevation-1..4` e `shadow-elevation-1..4`.
- **Radius:** `--radius` (1rem) + escala `sm/md/lg/xl`.
- **Superfícies/utilitários:** `surface-card`, `surface-panel`, `glass`/`glass-card`,
  `gradient-border`, `text-gradient`, `text-balance`/`text-pretty`, `gradient-mesh`,
  `shimmer`, `no-scrollbar`, tipografia fluida (`heading-xl/lg/md`), `section-spacing`,
  `container-premium`.

### Componentes
- Reutilizar `components/ui` (Radix/shadcn). **Preferir `Select` premium a `<select>`
  nativo;** usar `Dialog`/`Sheet` para modais; `Tabs`, `Avatar`, `Tooltip`/`InfoTooltip`,
  `Separator` conforme já adotados.

### Motion
- Framer Motion: `MotionList`/`MotionItem` (stagger), `AnimatedCounter`, `Reveal`/`Stagger`,
  transição de página (`app/app/template.tsx`).
- **`prefers-reduced-motion` é respeitado globalmente** (regra no CSS) — animações devem
  poder ser desligadas. Movimento com moderação.

### Feedback e estados
- `Skeleton` + `LoadingState` (+ `loading.tsx` por segmento); `ErrorState` +
  `error.tsx`/`global-error.tsx` (sem stack trace); **Toaster global** (`useToast`).
- **Toda ação de escrita** dá feedback por toast e bloqueia duplo clique (`useTransition`).

### Acessibilidade
- Foco de teclado global (`:focus-visible`), `aria-label` em ícones, foco preso em overlays
  (Radix). Sem warnings de build.

### Conteúdo
- **Sem clientes/depoimentos inventados.** Mockups do produto feitos em código, sem assets
  externos. **Avisos legais obrigatórios sempre preservados** (ver §11–14).

---

## 11. IA (regras de uso)
- O resultado da **análise facial é hoje simulado** (mock em
  `lib/actions/uploads.ts#submitFacialAnalysis`); ao integrar IA real, substituir o mock
  **sem** quebrar upload/registro existentes.
- IA é **assistiva**: resultados de IA **nunca fecham diagnóstico** e devem exibir os avisos
  obrigatórios.
- Resumos de genética por IA (`family_summary`/`technical_summary`) são pendência futura.

---

## 12. Módulos — regras por domínio
### Triagem
- **Análise facial:** upload + consentimento obrigatórios; resultado assistivo. *Aviso:
  não fecha diagnóstico.* Upload real no bucket `facial-photos`; `image_path` em
  `facial_analyses`.
- **M-CHAT:** 20 itens em `lib/mchat.ts`; classificação `score>=8` alto, `>=3` moderado,
  senão baixo. Salva `mchat_sessions`+`mchat_answers`; gera `screening_reports` (profissional/
  admin). *Aviso: é triagem, não diagnóstico.*
- **Relatório de triagem:** consolida dados/prioridade/próximos passos.

### Genética / DNA / Exoma
- Solicitação de exames (`genetic_exam_requests`), upload de laudos (`genetic-reports`),
  resumos para família e técnico. *Aviso: não substitui geneticista.*

### Salas sensoriais
- Página pública informativa + gestão interna de **leads comerciais**
  (`sensory_room_requests`). Formulário público grava lead real (INSERT anônimo permitido
  pela RLS) — **não estender esse acesso anônimo a outras tabelas.**

### Acompanhamento do neurodivergente
- Perfil (`neuro_profiles`, 1:1), linha do tempo, tarefas/rotina (pontuação + recompensas),
  jogos, diário dos pais, área do profissional/escola, relatórios evolutivos.

### Administração
- Dashboard com indicadores reais; gestão de responsáveis/profissionais/escolas/usuários.

### Módulos futuros (pendências — ver `HANDOFF.md` §11/§13)
- IA de análise facial · geração de PDF · resumos de genética por IA · persistência de
  `game_sessions` + novos jogos · settings persistentes · fluxo de convite/atribuição de
  papéis · testes + CI/CD.

---

## 13. Avisos obrigatórios (preservar sempre)
- Análise facial e M-CHAT **não fecham diagnóstico** (são triagem).
- Genética **não substitui geneticista**.
- O NexisX **não substitui** médico/neuropediatra/psicólogo/profissional habilitado.

---

## 14. O que NUNCA deve ser alterado sem justificativa (e registro no CHANGELOG)
1. Papel lido **só** de `profiles`; signup sempre `responsavel`; triggers de papel.
2. Defesa em 3 camadas (menu → `requireRole` → RLS) e `can_access_child` como centro da autz.
3. RLS habilitado em todas as tabelas; array `child_tables` mantido ao criar tabelas.
4. Buckets privados + acesso só por URL assinada; convenção `<child_id>/<uuid>.<ext>`.
5. `SUPABASE_SERVICE_ROLE_KEY` fora do client; demo admin só em dev; seed só em dev.
6. Camada de dados isolada (queries para ler, actions para escrever; `ActionResult`).
7. Idioma pt-BR; avisos legais obrigatórios; sem dados/depoimentos fabricados.
8. `prefers-reduced-motion` respeitado; tokens/elevação do design system como base.
9. Lint + typecheck + build verdes antes de concluir mudanças.
