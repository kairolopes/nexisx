# Changelog

Todos os marcos relevantes do projeto.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/).

## [0.1.0] — 2026-06-24

### Adicionado
- Estrutura inicial do projeto (Next.js 14, TypeScript, Tailwind, Framer Motion, Supabase).
- **Site público:** Home (hero com Canvas 2D + partículas), Sobre, Salas Sensoriais
  (galeria animada), DNA/Exoma, Para Famílias, Para Profissionais, Escolas e Clínicas, Contato.
- **Autenticação:** página de Login com Supabase Auth e proteção de rotas via middleware.
- **Triagem:** visão geral (fluxo de 10 etapas), análise facial assistida (upload +
  consentimento + resultado), M-CHAT funcional (20 itens, progresso, salvamento
  automático, classificação de risco) e relatório de triagem.
- **Acompanhamento:** crianças/perfil completo, linha do tempo, tarefas (board com
  pontuação), jogos (grade + jogo da memória), diário dos pais, relatórios evolutivos.
- **Genética:** exames e laudos. **Comercial:** salas sensoriais e solicitações.
- **Administração:** dashboard com indicadores e gráficos; responsáveis, profissionais,
  escolas, usuários/permissões e configurações.
- **Banco de dados:** `schema.sql` (25+ tabelas, tipos, triggers, funções) e
  `schema_rls.sql` (RLS por papel).
- **Design system:** componentes estilo shadcn, tokens de tema, keyframes Tailwind
  (float, shimmer, gradient-pan) e utilitários (glass, gradient-mesh, text-gradient).
- Documentação: README, CLAUDE, CONTEXT, PRODUCT, DATABASE e `.env.example`.
