# CONTEXT.md — Contexto e arquitetura

## Visão
NexisX unifica, em um único portal, a jornada do neurodesenvolvimento: descoberta
(site público), triagem (análise facial + M-CHAT), acompanhamento contínuo, genética e
salas sensoriais — para famílias, profissionais, escolas/clínicas e a operação interna.

## Decisões de arquitetura
- **App Router (Next 14):** route groups separam o site público `(site)` da área
  protegida `app/app`. O `middleware.ts` redireciona `/app/*` sem sessão para `/login`.
- **Autenticação:** Supabase Auth via `@supabase/ssr` (cookies). Perfil e papel ficam
  em `profiles`, criado por trigger no signup.
- **Autorização (defesa em profundidade):** controle por papéis (`admin`,
  `responsavel`, `profissional`, `escola`, `consultor`) em três camadas:
  1. **UI** — `navForRole()` filtra a navegação.
  2. **Rota (server)** — `requireRole()` em `lib/guard.ts` impede que páginas restritas
     sejam renderizadas por quem digita a URL diretamente (redireciona para `/app`).
  3. **Dados** — **RLS** no banco é a fonte de verdade da segurança.
- **Papel é fonte única em `profiles`:** nunca lido de `user_metadata` (controlável pelo
  cliente). No signup todo usuário entra como `responsavel`; promoção só por admin/
  service_role (triggers `handle_new_user` e `enforce_role_change`).
- **Camada visual:** design system próprio (tokens HSL em `globals.css`), componentes
  estilo shadcn, animações com Framer Motion e um hero com Canvas 2D.
- **Design tokens premium (Fase 2.5 / Onda 1):** escala de elevação `--shadow-1..4`
  (utilitários `elevation-1..4` / `shadow-elevation-*`), superfícies (`surface-card`,
  `surface-panel`), `glass-card`, `gradient-border`, tipografia fluida (`heading-xl/lg/md`),
  `text-balance`/`text-pretty`, `section-spacing` e `container-premium`. Foco de teclado
  global e `prefers-reduced-motion` respeitado. Preferir esses utilitários a valores avulsos.
- **Modo demo (apenas dev):** sem Supabase configurado, `lib/auth.ts` retorna um perfil
  admin demo **somente em desenvolvimento** (`NODE_ENV !== "production"`), permitindo
  navegar a área interna localmente sem backend. Em produção nunca há fallback.
- **Camada de dados (`lib/db/`):** toda leitura passa por `lib/db/queries.ts` (tipada por
  entidade); as páginas não chamam o Supabase diretamente. Escritas ficam em
  `lib/actions/*` como **Server Actions**, validadas por `lib/validation.ts` e autorizadas
  por `getActor()` em `lib/guard.ts`. Leitura e escrita usam o client server-side
  (cookies → RLS), de modo que sessão e políticas são respeitadas em todas as operações.
  As actions retornam `ActionResult` (`{ ok, data | error }`) — nunca lançam para a UI.

## Estado das telas (Blocos C–E)
Conectadas a dados reais: dashboard, crianças (lista/perfil), linha do tempo, tarefas
(criar/concluir), diário dos pais, solicitações comerciais/salas (admin), exames
genéticos, triagem (M-CHAT → sessão+respostas+relatório; análise facial → upload real +
registro), laudos e documentos (Storage), responsáveis, profissionais, escolas, usuários,
relatórios de triagem e relatórios evolutivos. Empty states padronizados via `EmptyState`.

## Storage (Bloco D)
Buckets privados (`facial-photos`, `genetic-reports`, `child-documents`) com policies que
reusam `can_access_child()` (caminho `<child_id>/...`). Upload via `lib/storage/` +
Server Actions; acesso só por URL assinada temporária. Conectados: análise facial (foto
real), laudos genéticos e documentos da criança.

## Limites do MVP
- **Análise facial** continua simulada (sem IA), mas já faz **upload real da foto** e
  salva o `storage_path` em `facial_analyses`.
- **Ainda protótipo** (ver `DEPLOY.md`): resultado de IA da análise facial, exportação
  PDF, resumos de genética por IA, jogos (sem `game_sessions`), visão geral da triagem
  (guia estático) e persistência de configurações.

## Próximos passos sugeridos
1. Conectar formulários às tabelas via Server Actions.
2. Implementar upload real no Supabase Storage (fotos/laudos).
3. Integrar serviço de análise facial e geração de PDF dos relatórios.
4. Cadastro/convite de usuários com atribuição de papéis.
