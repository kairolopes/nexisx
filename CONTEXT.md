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
- **Modo demo (apenas dev):** sem Supabase configurado, `lib/auth.ts` retorna um perfil
  admin demo **somente em desenvolvimento** (`NODE_ENV !== "production"`), permitindo
  navegar a área interna localmente sem backend. Em produção nunca há fallback.
- **Camada de dados (`lib/db/`):** toda leitura passa por `lib/db/queries.ts` (tipada por
  entidade); as páginas não chamam o Supabase diretamente. Escritas ficam em
  `lib/actions/*` como **Server Actions**, validadas por `lib/validation.ts` e autorizadas
  por `getActor()` em `lib/guard.ts`. Leitura e escrita usam o client server-side
  (cookies → RLS), de modo que sessão e políticas são respeitadas em todas as operações.
  As actions retornam `ActionResult` (`{ ok, data | error }`) — nunca lançam para a UI.

## Estado das telas (Bloco C)
Conectadas a dados reais: dashboard, crianças (lista/perfil), linha do tempo, tarefas
(criar/concluir), diário dos pais, solicitações comerciais/salas (admin), exames
genéticos e triagem (M-CHAT → sessão+respostas+relatório; análise facial → registro
mínimo). Telas conectadas têm empty states profissionais.

## Limites do MVP
- **Análise facial** continua simulada (sem IA), mas já registra estrutura mínima em
  `facial_analyses` — **sem upload de imagem** (Storage fica para o Bloco D).
- **Ainda mockados:** relatórios evolutivos, visão geral/detalhe de relatório de triagem,
  jogos (protótipo), tabelas admin (responsáveis, profissionais, escolas, usuários) e
  configurações.

## Próximos passos sugeridos
1. Conectar formulários às tabelas via Server Actions.
2. Implementar upload real no Supabase Storage (fotos/laudos).
3. Integrar serviço de análise facial e geração de PDF dos relatórios.
4. Cadastro/convite de usuários com atribuição de papéis.
