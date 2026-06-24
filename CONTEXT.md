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
- **Autorização:** controle por papéis (`admin`, `responsavel`, `profissional`,
  `escola`, `consultor`). A UI filtra a navegação por papel; a segurança real é
  garantida por **RLS** no banco.
- **Camada visual:** design system próprio (tokens HSL em `globals.css`), componentes
  estilo shadcn, animações com Framer Motion e um hero com Canvas 2D.
- **Modo demo:** sem Supabase configurado, `lib/auth.ts` retorna um perfil admin demo,
  permitindo navegar a área interna localmente sem backend.

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
