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

## Limites do MVP
- Análise facial e alguns dados de dashboard são **ilustrativos/protótipos** (sem
  inferência de IA real nem persistência completa) — a estrutura (tabelas, telas,
  fluxo) está pronta para integração.
- Jogos começam como protótipos visuais funcionais (ex.: jogo da memória).

## Próximos passos sugeridos
1. Conectar formulários às tabelas via Server Actions.
2. Implementar upload real no Supabase Storage (fotos/laudos).
3. Integrar serviço de análise facial e geração de PDF dos relatórios.
4. Cadastro/convite de usuários com atribuição de papéis.
