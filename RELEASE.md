# RELEASE.md — NexisX Foundation v1.0

**Versão:** v1.0 — Fundação concluída
**Tag:** `v1.0-foundation`
**Data:** 2026-06-25
**Status:** Fundação encerrada oficialmente · Próximo ciclo: Fase 3

---

## Visão geral

Esta release marca o **encerramento oficial da Fundação do NexisX**. Concluímos o ciclo de
construção da base do produto — da arquitetura e segurança ao design system, à plataforma
interna, ao site público e à camada completa de governança documental.

A partir desta versão, o NexisX deixa de ser um projeto em formação para se tornar uma
**base sólida, segura e documentada**, pronta para receber as integrações de inteligência e
os refinamentos de produto previstos para a Fase 3.

A Fundação foi construída em três fases sucessivas:

- **Fase 1 (v0.1.0)** — estrutura inicial, site público, área interna, banco e design system.
- **Fase 2 (Blocos A–E)** — segurança real (auth/roles/RLS), camada de dados e Server
  Actions, conexão das telas a dados reais, Storage seguro e hardening para produção.
- **Fase 2.5 (Ondas 1–5)** — acabamento premium: design tokens, estados/feedback,
  biblioteca de componentes, microinterações e site público premium.
- **Camada de governança** — `HANDOFF`, `AI_CONTEXT`, `PROJECT_RULES` e `VISION`.

---

## O que foi entregue

### Arquitetura e fundação técnica
- Next.js 14 (App Router) + TypeScript, com route groups separando site público e área
  protegida.
- Camada de dados isolada: leitura via `lib/db/queries.ts` (tipada) e escrita via Server
  Actions validadas e autorizadas, com retorno padronizado `ActionResult`.
- Integração completa com Supabase (Auth, PostgreSQL, Storage) via `@supabase/ssr`.

### Segurança
- Autenticação com papéis em `profiles` (fonte única; nunca de `user_metadata`).
- Defesa em profundidade em três camadas: navegação por papel → `requireRole()` na rota →
  **RLS** no banco como fonte de verdade.
- Triggers de segurança (`handle_new_user`, `enforce_role_change`) e função central
  `can_access_child()`.
- Storage em buckets **privados** com acesso apenas por URL assinada temporária.

### Design System e experiência
- Tokens de design (HSL), escala de elevação, superfícies, tipografia fluida e dark mode.
- Biblioteca de componentes acessíveis sobre Radix UI (Select, Dialog, Sheet, Tabs, Avatar,
  Tooltip, Separator) e componentes da plataforma.
- Microinterações com Framer Motion respeitando `prefers-reduced-motion`; estados de
  carregamento, erro, vazio e feedback (toasts) padronizados.

### Site público institucional
- Home premium (hero com Canvas 2D, jornada, explicação da triagem, credibilidade) e
  páginas Sobre, Salas Sensoriais, DNA/Exoma, Famílias, Profissionais, Escolas/Clínicas e
  Contato — com mockups feitos 100% em código e avisos legais preservados.

### Plataforma interna
- **Triagem** (visão geral, M-CHAT, análise facial, relatórios), **Acompanhamento**
  (crianças/perfil, linha do tempo, tarefas, diário, relatórios evolutivos), **DNA/Exoma**
  (exames e laudos), **Salas Sensoriais** (gestão de solicitações) e **Administração**
  (dashboard, responsáveis, profissionais, escolas, usuários).

### Governança documental
- `VISION.md` (visão de empresa/produto e filosofia de UX/IA), `PROJECT_RULES.md` (regras
  permanentes — a constituição), `HANDOFF.md` (handoff técnico completo), `AI_CONTEXT.md`
  (briefing < 5 min), além de `README`, `CONTEXT`, `PRODUCT`, `DATABASE`, `DEPLOY`,
  `CLAUDE` e `CHANGELOG`.

---

## O que está pronto (produção, com integrações reais)

- Autenticação, papéis e RLS em todas as tabelas.
- Camada de dados e Server Actions validadas/autorizadas.
- Dashboard com indicadores reais e atividade recente.
- Crianças e perfil, linha do tempo, tarefas (criar/concluir), diário dos pais.
- M-CHAT (sessões + respostas + relatório de triagem).
- Upload real de fotos (análise facial), laudos genéticos e documentos da criança, com
  download por URL assinada.
- Listas administrativas (responsáveis, profissionais, escolas, usuários) e relatórios.
- Leads comerciais de salas sensoriais (formulário público).

---

## O que ainda é protótipo

> Itens funcionalmente presentes, porém **sem integração real** — não devem ir a produção
> como definitivos sem a evolução prevista.

| Item | Estado atual | Pendência |
|---|---|---|
| **Análise facial (resultado)** | upload real da foto; resultado **simulado** | integrar serviço de inferência (IA) |
| **Relatórios em PDF** | inexistente | geração/exportação de PDF |
| **Resumos de genética** | campos existem | geração automática (IA) |
| **Jogos** | protótipo visual | persistir `game_sessions`; novos jogos |
| **Visão geral da triagem** | guia estático | torná-la orientada ao estado real |
| **Configurações** | não persiste | tabela de settings |
| **Convite/atribuição de papéis** | sem fluxo | fluxo de convite por admin |

---

## O que entra na Fase 3

- Integração de **IA real para análise facial** (substituindo o resultado simulado).
- **Geração de relatórios em PDF** (triagem e evolutivos).
- **Resumos de genética assistidos por IA** (família e técnico).
- **Persistência de jogos** (`game_sessions`) e novas atividades.
- **Gestão de usuários madura**: convites e atribuição de papéis por admin.
- **Configurações persistentes** (tabela de settings).
- **Qualidade e operação**: testes automatizados, CI/CD e observabilidade.

---

## Objetivos da Fase 3

1. **Fechar a lacuna entre protótipo e produto real** nos módulos assistidos por IA,
   mantendo a IA estritamente assistiva e os avisos obrigatórios.
2. **Tornar a jornada ponta a ponta verdadeiramente integrada** — triagem conversando com
   acompanhamento, genética com relatórios — uma história única por criança.
3. **Elevar a maturidade operacional** (testes, CI/CD, monitoramento) sem comprometer
   privacidade, segurança ou o padrão premium de experiência.
4. **Honrar a visão** (`VISION.md`) e a constituição (`PROJECT_RULES.md`) em cada entrega:
   cuidado, ciência com humildade, privacidade inegociável e excelência discreta.

---

*Fundação concluída. A base está pronta. A Fase 3 começa agora.*
