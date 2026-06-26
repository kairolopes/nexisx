# RELEASE_PLAN.md — Plano de Release e Critérios de Aceite
# Portal NexisX

> Define os critérios objetivos que determinam se uma versão está pronta
> para deploy em produção. Nenhuma versão é liberada sem aprovação
> explícita contra esta checklist.
> Autor: CTO/PIO — 2026-06-26

---

## Filosofia de release

**"Slow is smooth, smooth is fast."**

Preferimos atrasar um release a colocar código que mente, quebra ou
expõe dados. A pressão comercial nunca justifica pular os critérios
de qualidade — especialmente num produto que lida com dados de crianças
em situação de saúde sensível.

### Tipos de release
| Tipo | Quando | Aprovação |
|---|---|---|
| **Major** (v1.0, v2.0) | Mudança arquitetural ou novo segmento | CTO + revisão externa |
| **Minor** (v1.1, v1.5) | Novas features ou módulo completo | CTO |
| **Patch** (v1.0.x) | Bug fix, texto, ajuste visual | PR aprovado + CI verde |
| **Hotfix** | Bug crítico em produção | CTO + deploy imediato após CI |

---

## Critérios universais (obrigatórios em TODA versão)

Estes critérios se aplicam a qualquer release, sem exceção:

### CI/CD
- [ ] `npm run lint` — zero erros
- [ ] `npm run typecheck` — zero erros TypeScript
- [ ] `npm run build` — build de produção sem warnings críticos
- [ ] `npm run test` — todos os testes passando (zero falhas)
- [ ] Branch `main` com todos os critérios acima no CI (`.github/workflows/quality-gate.yml`)

### Segurança
- [ ] Nenhuma `SUPABASE_SERVICE_ROLE_KEY` ou secret no client
- [ ] Nenhum `console.log` com dados de usuário ou payload
- [ ] `images.remotePatterns` restrito (não usar `**`)
- [ ] RLS habilitado em todas as tabelas (verificar no Supabase Dashboard)
- [ ] Buckets de Storage marcados como `private`
- [ ] Zero `dangerouslySetInnerHTML` novo sem revisão

### Integridade do produto
- [ ] Zero botões/ações que não fazem nada (sem handlers silenciosos)
- [ ] Zero resultados de IA apresentados como reais sem disclaimers claros
- [ ] Todos os estados de loading/error/empty cobertos nas telas afetadas
- [ ] Avisos obrigatórios presentes (análise facial, M-CHAT, genética)

### Documentação
- [ ] `CHANGELOG.md` atualizado com o que mudou
- [ ] `HANDOFF.md` e `AI_CONTEXT.md` refletem o estado real
- [ ] `DEPLOY.md` com instruções atualizadas se houver mudança de infra
- [ ] `TECH_DEBT.md` atualizado (novas dívidas identificadas, antigas resolvidas)

---

## Critérios por versão

---

### MVP — Deploy Interno / Piloto Fechado

**Objetivo de negócio:** 1–3 clientes piloto conseguem usar o produto
sem intervenção técnica.

#### Funcionalidades
- [ ] Auth: login, logout, recuperação de senha, confirmação de e-mail funcionando
- [ ] Admin: convidar usuário por e-mail → usuário recebe e-mail → cria conta
- [ ] Admin: promover papel via UI (responsavel → profissional)
- [ ] Admin: cadastrar profissional via formulário
- [ ] Admin: vincular profissional ↔ criança via UI
- [ ] Criança: criar, listar, perfil completo
- [ ] M-CHAT: aplicar, salvar, classificar, gerar relatório
- [ ] M-CHAT: exportar resultado em PDF básico
- [ ] Análise facial: upload funciona, **resultado mock removido** da UI
- [ ] Triagem Digital: badge "Preview Científico" visível
- [ ] Triagem Digital: validada E2E no Supabase real
- [ ] Diário: criar e listar entradas
- [ ] Tarefas: criar e concluir
- [ ] Genética: solicitar exame, upload de laudo, download
- [ ] Jogos: jogo da memória com persistência de `game_sessions`
- [ ] Jogos: grade de categorias fantasmas removida (ou marcada como "em breve")
- [ ] Configurações: salvar nome da organização e e-mail persistem
- [ ] Dashboard: métricas reais

#### Qualidade
- [ ] `npm run test` — 39+ testes passando
- [ ] CI quality-gate verde
- [ ] Teste manual do fluxo crítico (admin → convite → profissional → criança → M-CHAT → PDF)

#### Deploy
- [ ] Variáveis de ambiente configuradas no Vercel/ambiente de produção
- [ ] SQLs aplicados em ordem: `schema.sql` → `schema_rls.sql` → `storage.sql` → `screening_digital.sql`
- [ ] **NÃO aplicar `seed.sql` em produção**
- [ ] RLS testado com 2 contas (checklist de `DEPLOY.md`)
- [ ] Domínio configurado e HTTPS ativo
- [ ] `NEXT_PUBLIC_SITE_URL` apontando para o domínio correto

#### Aceite final
- [ ] CTO navegou o sistema completo como cada papel (admin, responsavel, profissional)
- [ ] Nenhum fluxo crítico com erro 500 ou comportamento inesperado
- [ ] 1 cliente piloto testou e não reportou bloqueador

---

### v1.0 — Produto Comercial Inicial

**Objetivo de negócio:** Signup público aberto. Qualquer clínica pode
se cadastrar e começar sem falar com ninguém.

#### Arquitetura (bloqueador — não liberar sem isso)
- [ ] Tabela `organizations` criada e migração aplicada
- [ ] `org_id` em todas as tabelas de dados (migração com zero-downtime)
- [ ] RLS estendida para `org_id` — testada em 3 organizações diferentes
- [ ] Isolamento verificado: organização A não vê dados da B

#### Funcionalidades adicionais ao MVP
- [ ] Signup público → cria organização → onboarding de 3 passos
- [ ] Página de pricing no site público
- [ ] Planos: controle de capacidade básico (número de profissionais)
- [ ] Desativar usuário (admin)
- [ ] Tarefas: editar e excluir
- [ ] Genética: atualizar status do exame
- [ ] Análise facial: histórico por criança
- [ ] Relatórios: detalhe individual
- [ ] Triagem Digital: fluxo validado em múltiplas organizações
- [ ] M-CHAT: retomada de sessão interrompida
- [ ] Salas sensoriais: atualizar status do lead via UI

#### Qualidade
- [ ] Testes de integração: auth/RLS com 3+ cenários por papel
- [ ] Testes de integração: isolamento entre organizações
- [ ] E2E Playwright: signup → onboarding → criança → M-CHAT → PDF
- [ ] E2E Playwright: admin → convite → profissional → vinculação → triagem
- [ ] Zero regressão nos 39 testes unitários

#### Observabilidade
- [ ] Sentry configurado (project, DSN, scrubbing de PII)
- [ ] `/api/health` retornando 200 com DB + Storage reachable
- [ ] Logging em `storage`, `ai/service`, `runAction` (estendido do MVP)
- [ ] Alertas de erro crítico no Sentry configurados

#### Segurança
- [ ] Rate limiting no lead público (`/contato`) — Upstash Redis ou alternativa
- [ ] Rate limiting no signup público
- [ ] Validação MIME por magic-bytes (server-side) nos uploads
- [ ] Confirmação de e-mail testada end-to-end

#### Deploy
- [ ] Variáveis `AI_PROVIDER`, `AI_PROVIDER_FALLBACK` documentadas e configuradas
- [ ] Redis/Upstash configurado (rate limiting)
- [ ] CI/CD com deploy automático no merge para `main`
- [ ] Rollback documentado (procedimento de reverter deploy com zero perda de dados)
- [ ] Backup automático do banco configurado (Supabase Pro ou PITRecovery)
- [ ] Plano de disaster recovery documentado

#### Documentação
- [ ] Documentação de onboarding para clientes (como criar conta, primeiros passos)
- [ ] FAQ básico no site
- [ ] Política de privacidade e termos de uso publicados
- [ ] `DEPLOY.md` com todas as variáveis da v1.0

#### Aceite final
- [ ] Penetration test básico (checklist OWASP Top 10 manual)
- [ ] 3 clientes piloto do MVP promovidos para v1.0 sem perda de dados
- [ ] Revisão legal dos disclaimers (análise facial, M-CHAT) por profissional
- [ ] CTO aprova release formally

---

### v1.1 — Qualidade e Completude

**Objetivo de negócio:** NPS ≥ 7. Churn < 5% nos primeiros 30 dias.

#### Funcionalidades
- [ ] Busca por nome (crianças, usuários)
- [ ] Filtros por período em relatórios e timeline
- [ ] PDF do relatório evolutivo
- [ ] Gráfico de tendência de humor no diário
- [ ] Notificações in-app (tarefa vencida, resultado novo)
- [ ] Envio de relatório por e-mail
- [ ] Editar/excluir evento da timeline
- [ ] Editar/excluir entradas do diário
- [ ] Editar/excluir criança (com confirmação)
- [ ] Notas de profissional e escola visíveis na UI
- [ ] Perfil de usuário editável (nome, avatar, telefone)

#### Qualidade
- [ ] Cobertura de testes > 60% (`lib/**`)
- [ ] Codegen de tipos do Supabase ativo (sem tipos manuais)
- [ ] Migrations versionadas com Supabase CLI
- [ ] Zero `TODO`/`FIXME` em código de produção
- [ ] Acessibilidade: 0 erros críticos no Axe/Lighthouse

#### Performance
- [ ] LCP < 2.5s no site público (Lighthouse)
- [ ] `createClient()` deduplificado com React `cache()` por request
- [ ] Queries com `select` enxuto (sem `select *` em tabelas grandes)

#### Aceite final
- [ ] Survey com 5+ clientes: NPS ≥ 7
- [ ] Nenhum "não consegui encontrar X" em feedback qualitativo

---

### v1.5 — IA Real e Diferenciação

**Objetivo de negócio:** IA da triagem comportamental validada em
produção. Primeiro caso de uso de IA real entregue.

#### Pré-requisitos antes de qualquer código de IA real
- [ ] Harness de avaliação com golden dataset (≥ 50 casos)
- [ ] Definição de métricas de qualidade por sinal comportamental
- [ ] Revisão clínica por ao menos 1 neuropediatra
- [ ] Atualização dos disclaimers legais com assessoria jurídica
- [ ] SLA de acurácia mínima documentado e aprovado

#### IA
- [ ] 1 provider real integrado (MediaPipe ou equivalente)
- [ ] Pipeline assíncrona (fila + worker) sem timeout na request
- [ ] Avaliação automática antes de cada deploy de modelo
- [ ] Webhook de resultado para UI
- [ ] Resumos de genética via LLM com rate de alucinação < 2%
- [ ] Todos os resultados de IA com confidence score visível
- [ ] Botão "reportar resultado incorreto" para feedback do profissional

#### Aceitação
- [ ] 10 casos reais revisados por profissional habilitado
- [ ] Aprovação clínica formal documentada
- [ ] CTO + assessoria jurídica aprovam disclaimers antes do deploy

---

### v2.0 — Plataforma e Escala

**Objetivo de negócio:** 100+ organizações. App mobile nas stores.

#### Pré-requisitos arquiteturais
- [ ] Application services (use-cases) extraídos das Server Actions
- [ ] Repositórios atrás de interfaces (Ports & Adapters para dados)
- [ ] API pública (REST/tRPC) documentada com OpenAPI
- [ ] Testes de carga (k6 / Locust): 1000 usuários simultâneos sem degradação

#### Mobile
- [ ] App iOS publicado na App Store (review aprovado)
- [ ] App Android publicado no Google Play
- [ ] Paridade de funcionalidades core com web (família + profissional)

#### Enterprise
- [ ] Multi-unidade funcional (rede de clínicas)
- [ ] SLA de 99.9% uptime documentado e monitorado
- [ ] Processo de LGPD completo (erasure, portabilidade, trilha de acesso)
- [ ] Contrato enterprise padrão revisado juridicamente

---

## Processo de aprovação de release

```
1. Dev branch → PR aberto
2. CI quality-gate passa (lint + typecheck + build + tests)
3. Code review (ao menos 1 aprovação para patches, CTO para minor/major)
4. Merge para main → CI passa novamente
5. Deploy para staging (preview URL no Vercel)
6. Teste manual do fluxo crítico no staging
7. Checklist da versão preenchida pelo CTO
8. Tag de versão criada (ex: v1.0.0)
9. Deploy para produção
10. Monitoramento ativo por 30 min após deploy (Sentry + logs)
11. CHANGELOG.md atualizado com a tag
```

### Critério de rollback automático
Se qualquer um dos seguintes ocorrer nos primeiros 30 minutos após deploy:
- Taxa de erro > 1% no Sentry
- `/api/health` retornando erro
- Falha de RLS relatada por usuário
→ Rollback imediato, post-mortem em 24h.

---

*Última revisão: 2026-06-26 · Aprovação CTO necessária para alterar critérios*
