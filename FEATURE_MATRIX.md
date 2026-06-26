# FEATURE_MATRIX.md — Matriz de Funcionalidades
# Portal NexisX

> Fonte única de verdade para priorização de features. Toda feature deve
> estar aqui antes de entrar num sprint. Classificação revisada pelo CTO
> a cada release.
> Autor: CTO/PIO — 2026-06-26

---

## Legenda

**Prioridade:** MVP · P0 · P1 · P2 · Futuro
**Status:** ✅ Completo · ⚠️ Parcial · 🔴 Mock/Ausente · ❌ Não existe
**Esforço:** XS (< 1d) · S (1–2d) · M (3–5d) · L (1–2sem) · XL (> 2sem)
**Impacto cliente:** 🔴 Crítico · 🟡 Importante · 🟢 Desejável
**Impacto técnico:** 🔴 Alto (mudança de arquitetura) · 🟡 Médio · 🟢 Baixo

---

## Grupo 1 — Infraestrutura SaaS

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| INF-01 | **Multi-tenancy: tabela `organizations`** | P0 | ❌ Não existe | L | 🔴 Crítico | 🔴 Alto | v1.0 | — |
| INF-02 | **`org_id` em todas as tabelas** | P0 | ❌ Não existe | L | 🔴 Crítico | 🔴 Alto | v1.0 | INF-01 |
| INF-03 | **RLS estendida para `org_id`** | P0 | ❌ Não existe | M | 🔴 Crítico | 🔴 Alto | v1.0 | INF-02 |
| INF-04 | **Signup público → cria organização** | P0 | ❌ Não existe | M | 🔴 Crítico | 🟡 Médio | v1.0 | INF-01, INF-03 |
| INF-05 | Onboarding guiado (wizard 3 passos) | P0 | ❌ Não existe | M | 🔴 Crítico | 🟢 Baixo | v1.0 | INF-04 |
| INF-06 | Página de pricing no site público | P0 | ❌ Não existe | S | 🔴 Crítico | 🟢 Baixo | v1.0 | — |
| INF-07 | Controle de capacidade por plano | P1 | ❌ Não existe | M | 🟡 Importante | 🟡 Médio | v1.0 | INF-01 |
| INF-08 | Configurações persistentes da org | MVP | 🔴 Mock | S | 🔴 Crítico | 🟢 Baixo | MVP | — |
| INF-09 | Health check `/api/health` | P0 | ❌ Não existe | XS | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| INF-10 | Deploy automatizado (Vercel + Supabase CI) | MVP | ⚠️ Parcial | S | 🔴 Crítico | 🟢 Baixo | MVP | — |

---

## Grupo 2 — Autenticação e Gestão de Usuários

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| AUTH-01 | Login e-mail/senha | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| AUTH-02 | Logout | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| AUTH-03 | Recuperação de senha | MVP | ✅ (Supabase nativo) | XS | 🔴 Crítico | 🟢 Baixo | MVP | — |
| AUTH-04 | Confirmação de e-mail no signup | MVP | ⚠️ Config pendente | XS | 🔴 Crítico | 🟢 Baixo | MVP | — |
| AUTH-05 | **Convidar usuário por e-mail (admin)** | MVP | 🔴 UI sem ação | M | 🔴 Crítico | 🟡 Médio | MVP | — |
| AUTH-06 | **Promover papel via UI (admin)** | MVP | 🔴 Só via SQL | S | 🔴 Crítico | 🟢 Baixo | MVP | AUTH-05 |
| AUTH-07 | Desativar/revogar acesso de usuário | P0 | ❌ Não existe | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| AUTH-08 | Aceitar convite (fluxo do convidado) | MVP | ❌ Não existe | M | 🔴 Crítico | 🟡 Médio | MVP | AUTH-05 |
| AUTH-09 | Listagem de usuários com filtro por papel | P1 | ⚠️ Parcial (sem filtro) | XS | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| AUTH-10 | Perfil de usuário editável (nome, telefone, avatar) | P1 | ⚠️ Parcial | S | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| AUTH-11 | Autenticação social (Google, Apple) | Futuro | ❌ | M | 🟢 Desejável | 🟡 Médio | v2.0 | — |
| AUTH-12 | SSO (SAML) para enterprise | Futuro | ❌ | XL | 🟢 Desejável | 🔴 Alto | v2.0 | INF-01 |

---

## Grupo 3 — Gestão de Crianças e Vínculos

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| CHILD-01 | Criar criança | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| CHILD-02 | Listar crianças (do responsável/profissional) | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| CHILD-03 | Perfil completo da criança (Tabs) | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| CHILD-04 | Atualizar dados da criança | MVP | ✅ Completo | — | 🟡 Importante | — | MVP | — |
| CHILD-05 | **Vincular profissional ↔ criança via UI** | MVP | 🔴 Só via SQL | M | 🔴 Crítico | 🟢 Baixo | MVP | — |
| CHILD-06 | **Vincular escola ↔ criança via UI** | MVP | 🔴 Só via SQL | M | 🟡 Importante | 🟢 Baixo | MVP | — |
| CHILD-07 | **Cadastrar profissional via formulário** | MVP | 🔴 Não existe | S | 🔴 Crítico | 🟢 Baixo | MVP | — |
| CHILD-08 | **Cadastrar responsável via formulário** | MVP | 🔴 Não existe | S | 🔴 Crítico | 🟢 Baixo | MVP | — |
| CHILD-09 | **Cadastrar escola via formulário** | MVP | 🔴 Não existe | S | 🟡 Importante | 🟢 Baixo | MVP | — |
| CHILD-10 | Excluir criança (com confirmação e cascade) | P0 | ❌ Não existe | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| CHILD-11 | Busca por nome de criança | P1 | ❌ Não existe | S | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| CHILD-12 | Foto de perfil da criança (upload) | P2 | ❌ Não existe | S | 🟢 Desejável | 🟢 Baixo | v1.1 | — |
| CHILD-13 | Autorizar/revogar acesso de escola (toggle) | P1 | ⚠️ Campo existe no banco | S | 🟡 Importante | 🟢 Baixo | v1.1 | CHILD-06 |

---

## Grupo 4 — Triagem M-CHAT

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| MCHAT-01 | Aplicar M-CHAT (20 perguntas, progresso) | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| MCHAT-02 | Classificação de risco (baixo/moderado/alto) | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| MCHAT-03 | Salvar sessão e respostas | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| MCHAT-04 | Gerar relatório preliminar (profissional/admin) | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| MCHAT-05 | **Exportar resultado em PDF** | MVP | ❌ Não existe | M | 🔴 Crítico | 🟢 Baixo | MVP | — |
| MCHAT-06 | Retomada de sessão interrompida | P0 | ❌ Não existe | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| MCHAT-07 | Histórico de aplicações por criança | P0 | ⚠️ Banco tem; UI básica | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| MCHAT-08 | Aviso obrigatório (não diagnóstico) | MVP | ✅ Presente | — | 🔴 Crítico (legal) | — | MVP | — |
| MCHAT-09 | Detalhamento por item de risco no relatório | P1 | ❌ Não existe | M | 🟡 Importante | 🟢 Baixo | v1.1 | MCHAT-05 |
| MCHAT-10 | M-CHAT Follow-Up (F) para casos moderados | Futuro | ❌ | L | 🟡 Importante | 🟡 Médio | v1.5 | — |

---

## Grupo 5 — Análise Facial

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| FACE-01 | Upload da foto (Storage privado) | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| FACE-02 | Consentimento registrado no banco | MVP | ✅ Completo | — | 🔴 Crítico (legal) | — | MVP | — |
| FACE-03 | Preview da foto antes do envio | MVP | ✅ Completo | — | 🟡 Importante | — | MVP | — |
| FACE-04 | **Remover resultado mock da UI de produção** | MVP | 🔴 Urgente | XS | 🔴 Crítico (ético) | 🟢 Baixo | MVP | — |
| FACE-05 | Mensagem "análise em processamento / sob avaliação" | MVP | ❌ Não existe | XS | 🔴 Crítico | 🟢 Baixo | MVP | FACE-04 |
| FACE-06 | Histórico de análises por criança | P0 | ⚠️ Parcial | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| FACE-07 | Integração com serviço de IA real (inferência) | Futuro | ❌ | XL | 🔴 Crítico | 🔴 Alto | v1.5 | Harness de avaliação |
| FACE-08 | Relatório de análise facial com indicadores | Futuro | ❌ | L | 🟡 Importante | 🟡 Médio | v1.5 | FACE-07 |

> **Decisão CTO:** A análise facial mock é o maior risco ético do produto.
> FACE-04 e FACE-05 são obrigatórios antes de qualquer deploy para cliente.

---

## Grupo 6 — Triagem Digital Assistiva (Comportamental)

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| TDA-01 | Arquitetura da pipeline (18 etapas) | ✅ Done | ✅ Completo | — | — | — | Done | — |
| TDA-02 | MockProvider (pipeline determinística) | ✅ Done | ✅ Completo | — | — | — | Done | — |
| TDA-03 | Upload de vídeo/foto para `screening-media` | ✅ Done | ✅ Completo | — | — | — | Done | — |
| TDA-04 | Gravação em 4 tabelas (sessions, signals, fusions, audit) | ✅ Done | ✅ Completo | — | — | — | Done | — |
| TDA-05 | **Validar E2E no Supabase real** | MVP | 🔴 Não validado | S | 🔴 Crítico | 🟢 Baixo | MVP | — |
| TDA-06 | **Badge "Preview Científico" na UI** | MVP | ❌ | XS | 🔴 Crítico (ético) | 🟢 Baixo | MVP | — |
| TDA-07 | Harness de avaliação de IA (golden dataset) | P0 | ❌ | L | 🔴 Crítico | 🟡 Médio | v1.5 pre-req | — |
| TDA-08 | Integração MediaPipe (landmarks faciais reais) | Futuro | ❌ | XL | 🔴 Crítico | 🔴 Alto | v1.5 | TDA-07 |
| TDA-09 | Processamento assíncrono (fila + worker) | Futuro | ❌ | XL | 🟡 Importante | 🔴 Alto | v1.5 | TDA-08 |
| TDA-10 | Validação clínica por neuropediatra | Futuro | ❌ | — (processo, não código) | 🔴 Crítico (legal) | — | v1.5 | TDA-08 |
| TDA-11 | Webhook de resultado assíncrono para UI | Futuro | ❌ | M | 🟡 Importante | 🟡 Médio | v1.5 | TDA-09 |

---

## Grupo 7 — Relatórios

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| REP-01 | Lista de relatórios de triagem | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| REP-02 | **PDF do relatório de triagem M-CHAT** | MVP | ❌ Não existe | M | 🔴 Crítico | 🟢 Baixo | MVP | MCHAT-05 |
| REP-03 | Detalhe individual do relatório de triagem | P0 | ❌ Não existe | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| REP-04 | Relatórios evolutivos: contagens reais | MVP | ✅ Completo | — | 🟡 Importante | — | MVP | — |
| REP-05 | PDF do relatório evolutivo (básico) | P1 | ❌ Não existe | M | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| REP-06 | Gráfico de evolução temporal (semana a semana) | P1 | ❌ Não existe | M | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| REP-07 | Filtro por período em relatórios | P1 | ❌ Não existe | S | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| REP-08 | Comparativo entre períodos | P2 | ❌ Não existe | M | 🟢 Desejável | 🟢 Baixo | v1.1 | REP-07 |
| REP-09 | Assinatura digital do profissional | Futuro | ❌ | L | 🟡 Importante | 🟡 Médio | v2.0 | — |
| REP-10 | Envio de relatório por e-mail para família | P1 | ❌ Não existe | S | 🟡 Importante | 🟢 Baixo | v1.1 | REP-02 |

---

## Grupo 8 — Acompanhamento Longitudinal

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| ACOMP-01 | Linha do tempo: listar eventos | MVP | ✅ Completo | — | 🟡 Importante | — | MVP | — |
| ACOMP-02 | **Criar evento na timeline via UI clara** | MVP | ⚠️ Pouco claro | S | 🟡 Importante | 🟢 Baixo | MVP | — |
| ACOMP-03 | Editar evento da timeline | P1 | ❌ | S | 🟢 Desejável | 🟢 Baixo | v1.1 | — |
| ACOMP-04 | Filtrar timeline por tipo/período | P1 | ❌ | S | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| ACOMP-05 | Tarefas: criar e concluir | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| ACOMP-06 | Tarefas: editar | P0 | ❌ | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| ACOMP-07 | Tarefas: excluir | P0 | ❌ | XS | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| ACOMP-08 | Diário: criar e listar | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| ACOMP-09 | Diário: editar e excluir | P1 | ❌ | S | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| ACOMP-10 | Diário: gráfico de tendência de humor | P1 | ❌ | M | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| ACOMP-11 | Notas do profissional na linha do tempo | P1 | ⚠️ Banco tem; UI ausente | S | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| ACOMP-12 | Notas da escola | P1 | ⚠️ Banco tem; UI ausente | S | 🟡 Importante | 🟢 Baixo | v1.1 | — |

---

## Grupo 9 — Jogos e Atividades

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| GAME-01 | Jogo da memória (client-side) | MVP | ✅ Completo | — | 🟡 Importante | — | MVP | — |
| GAME-02 | **Persistir `game_sessions` (pontuação, fase)** | MVP | 🔴 Não existe | S | 🔴 Crítico | 🟢 Baixo | MVP | — |
| GAME-03 | Histórico de sessões por criança | P0 | ❌ | S | 🟡 Importante | 🟢 Baixo | v1.0 | GAME-02 |
| GAME-04 | 3+ jogos novos (atenção, associação, comunicação) | P1 | ❌ | L | 🟡 Importante | 🟢 Baixo | v1.5 | GAME-02 |
| GAME-05 | Métricas de desempenho por jogo em relatório | P1 | ❌ | M | 🟡 Importante | 🟢 Baixo | v1.5 | GAME-04 |
| GAME-06 | Personalização de dificuldade por criança | P2 | ❌ | M | 🟢 Desejável | 🟢 Baixo | v1.5 | GAME-04 |

> **Decisão CTO:** Remover as 7 categorias de jogos "fantasmas" da UI (apenas
> visual sem conteúdo). Manter apenas Jogo da Memória funcional com
> persistência. As outras categorias entram com GAME-04 quando tiverem
> implementação real.

---

## Grupo 10 — Genética e Laudos

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| GEN-01 | Solicitar exame genético | MVP | ✅ Completo | — | 🟡 Importante | — | MVP | — |
| GEN-02 | Lista de solicitações com status | MVP | ✅ Completo | — | 🟡 Importante | — | MVP | — |
| GEN-03 | Upload de laudo (PDF/imagem) via Storage | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| GEN-04 | Download seguro por URL assinada | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| GEN-05 | Atualizar status do exame via UI | P0 | ❌ Não existe | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| GEN-06 | Resumo para família via IA (linguagem simples) | P1 | 🔴 Dormente | L | 🟡 Importante | 🟡 Médio | v1.5 | Provider IA |
| GEN-07 | Resumo técnico para profissional via IA | P1 | 🔴 Dormente | L | 🟡 Importante | 🟡 Médio | v1.5 | GEN-06 |
| GEN-08 | Aviso obrigatório (não substitui geneticista) | MVP | ✅ Presente | — | 🔴 Crítico (legal) | — | MVP | — |

---

## Grupo 11 — Dashboard e Observabilidade

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| DASH-01 | Contadores reais (crianças, triagens, tarefas...) | MVP | ✅ Completo | — | 🔴 Crítico | — | MVP | — |
| DASH-02 | Atividade recente (timeline real) | MVP | ✅ Completo | — | 🟡 Importante | — | MVP | — |
| DASH-03 | Filtro por período no dashboard | P1 | ❌ | S | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| DASH-04 | Alertas (tarefa vencida, resultado novo) | P1 | ❌ | M | 🟡 Importante | 🟢 Baixo | v1.1 | — |
| DASH-05 | Painel de auditoria de IA (`ai_requests`) | P1 | ❌ | M | 🟢 Desejável | 🟢 Baixo | v1.1 | — |
| DASH-06 | Métricas de IA (sucesso, latência, custo) | P2 | ❌ | M | 🟢 Desejável | 🟡 Médio | v1.5 | DASH-05 |
| OBS-01 | **Sentry (erros server + client)** | P0 | ❌ | S | 🔴 Crítico | 🟢 Baixo | v1.0 | — |
| OBS-02 | **`/api/health` (DB + Storage)** | P0 | ❌ | XS | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| OBS-03 | Logging em storage/ai/runAction | P0 | ⚠️ Parcial (só queries) | S | 🔴 Crítico | 🟢 Baixo | v1.0 | — |
| OBS-04 | OpenTelemetry (tracing distribuído) | P2 | ❌ | L | 🟢 Desejável | 🟡 Médio | v1.5 | — |

---

## Grupo 12 — Segurança e Qualidade

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| SEC-01 | Auth / RLS / 3 camadas de defesa | ✅ Done | ✅ Completo | — | 🔴 Crítico | — | Done | — |
| SEC-02 | Rate limiting (lead público + upload/IA) | P0 | ❌ | M | 🔴 Crítico | 🟡 Médio | v1.0 | Redis/Upstash |
| SEC-03 | Validação MIME por magic-bytes | P0 | ⚠️ Só client-side | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| SEC-04 | Confirmação de e-mail no signup | MVP | ⚠️ Config pendente | XS | 🔴 Crítico | 🟢 Baixo | MVP | — |
| SEC-05 | LGPD: processo de erasure por titular | P2 | ❌ | L | 🟡 Importante (legal) | 🟡 Médio | v2.0 | — |
| SEC-06 | Trilha de acesso a dados sensíveis (auditoria) | P2 | ❌ | M | 🟡 Importante | 🟡 Médio | v2.0 | — |
| QA-01 | 39 testes unitários (M-CHAT, validação, IA mock) | ✅ Done | ✅ Completo | — | — | — | Done | — |
| QA-02 | Testes de integração auth/RLS | P0 | ❌ | L | 🔴 Crítico | 🟢 Baixo | v1.0 | — |
| QA-03 | Testes E2E (Playwright): fluxo crítico | P0 | ❌ | L | 🔴 Crítico | 🟡 Médio | v1.0 | — |
| QA-04 | Cobertura de testes > 60% | P1 | ❌ | M | — | — | v1.1 | QA-02, QA-03 |
| QA-05 | Codegen de tipos do Supabase (CLI) | P2 | ❌ | S | — | 🟡 Médio | v1.1 | — |
| QA-06 | Migrations versionadas (Supabase CLI) | P2 | ❌ | M | — | 🟡 Médio | v1.1 | — |

---

## Grupo 13 — Site Público e Conversão

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| SITE-01 | Site público completo (8 páginas) | ✅ Done | ✅ Completo | — | 🟡 Importante | — | Done | — |
| SITE-02 | Formulário de contato → lead real | ✅ Done | ✅ Completo | — | 🟡 Importante | — | Done | — |
| SITE-03 | **Página de pricing** | P0 | ❌ | S | 🔴 Crítico | 🟢 Baixo | v1.0 | INF-01 |
| SITE-04 | Fluxo de cadastro guiado (wizard) | P0 | ❌ | M | 🔴 Crítico | 🟡 Médio | v1.0 | INF-04 |
| SITE-05 | Onboarding in-app (checklist primeiro uso) | P0 | ❌ | M | 🔴 Crítico | 🟢 Baixo | v1.0 | SITE-04 |
| SITE-06 | Blog / conteúdo educacional | Futuro | ❌ | L | 🟢 Desejável | 🟢 Baixo | v2.0 | — |

---

## Grupo 14 — Comercial (Salas Sensoriais)

| ID | Feature | Prio | Status | Esforço | Impacto cliente | Impacto técnico | Versão | Dependências |
|---|---|---|---|---|---|---|---|---|
| COM-01 | Página pública de salas sensoriais | ✅ Done | ✅ Completo | — | 🟡 Importante | — | Done | — |
| COM-02 | Lead público → Supabase | ✅ Done | ✅ Completo | — | 🟡 Importante | — | Done | — |
| COM-03 | Lista de solicitações (admin/consultor) | ✅ Done | ✅ Completo | — | 🟡 Importante | — | Done | — |
| COM-04 | Atualizar status do lead via UI | P1 | ❌ | S | 🟡 Importante | 🟢 Baixo | v1.0 | — |
| COM-05 | CRM básico (comentários, próximo passo) | P2 | ❌ | M | 🟢 Desejável | 🟢 Baixo | v1.1 | COM-04 |

---

## Resumo por versão

| Versão | Features MVP/P0 | Features P1 | Features Futuro | Foco |
|---|---|---|---|---|
| MVP | INF-08,10 · AUTH-04–08 · CHILD-05–09 · MCHAT-05 · FACE-04,05 · TDA-05,06 · REP-02 · ACOMP-02 · GAME-01,02 · GEN-03,04 · DASH-01,02 | — | — | Funciona sem mentiras |
| v1.0 | INF-01–07,09 · AUTH-07 · CHILD-10 · MCHAT-06,07 · ACOMP-06,07 · GAME-03 · GEN-05 · OBS-01–03 · SEC-02–04 · QA-02,03 · SITE-03–05 · COM-04 | DASH-03–05 · CHILD-11–13 · REP-03 | — | Vende sozinho |
| v1.1 | — | REP-05–08,10 · ACOMP-03,04,09–12 · DASH-03,04 · QA-04–06 · COM-05 | — | Clientes felizes |
| v1.5 | — | TDA-07–11 · FACE-07,08 · GEN-06,07 · GAME-04–06 | — | Diferenciação IA |
| v2.0 | — | — | AUTH-11,12 · SEC-05,06 · INF-11+ · SITE-06 | Plataforma |

---

*Última revisão: 2026-06-26 · Aprovação CTO necessária para qualquer alteração de prioridade*
