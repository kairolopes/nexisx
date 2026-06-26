# PRODUCT_VISION.md — Visão Oficial de Produto
# Portal NexisX

> Documento de referência estratégica do produto. Toda decisão de roadmap,
> priorização e arquitetura deve ser avaliada contra esta visão.
> Autor: CTO/PIO — 2026-06-26. Revisão obrigatória a cada release major.

---

## 1. Missão

**Transformar a jornada do neurodesenvolvimento — do caos e da angústia em
clareza, organização e orientação.**

Famílias que identificam sinais de neurodivergência num filho enfrentam meses
de espera, informações fragmentadas, profissionais desconectados e a sensação
de estarem sozinhas. O NexisX resolve isso reunindo triagem orientadora,
acompanhamento longitudinal e organização completa em uma plataforma única,
segura e acolhedora.

---

## 2. Problema que resolve

### Para famílias
- Não sabem por onde começar (sinais precoces sem orientação)
- Informações fragmentadas entre médicos, escola e terapeutas
- Dificuldade de acompanhar evolução ao longo do tempo
- Documentos e laudos espalhados, perdidos ou inacessíveis

### Para profissionais (neuropediatras, psicólogos, fonoaudiólogos, TOs)
- Falta de histórico longitudinal dos pacientes
- Sem canal seguro para comunicação com família e escola
- Relatórios gerados manualmente, repetitivos e sem padrão
- Instrumentos de triagem aplicados em papel, sem dados estruturados

### Para clínicas e escolas
- Impossibilidade de acompanhar múltiplas crianças de forma organizada
- Ausência de dados estruturados para decisões institucionais
- Sem rastreamento de encaminhamentos e próximos passos

---

## 3. Público-alvo

### Primário (pagadores — B2B)
| Segmento | Perfil | Caso de uso principal |
|---|---|---|
| Clínicas de neurodesenvolvimento | 5–50 profissionais | Gestão de pacientes, triagem, relatórios |
| Neuropediatras / psicólogos autônomos | 1–3 profissionais | Triagem digital, histórico do paciente |
| Escolas com suporte a NEE | 10–200 alunos monitorados | Acompanhamento comportamental, comunicação família |

### Secundário (usuários — B2C2B)
| Segmento | Perfil | Caso de uso principal |
|---|---|---|
| Famílias / responsáveis | Pais de crianças 0–12 anos com suspeita de TEA/TDAH | Registro diário, acompanhamento, organização de laudos |

### Terciário (futuro)
- Redes de clínicas (franquias, hospitais)
- Planos de saúde (triagem em escala)
- Pesquisadores (dados anonimizados e consentidos)

---

## 4. Proposta de valor

> "O NexisX é o sistema operacional da jornada do neurodesenvolvimento:
> do primeiro sinal ao acompanhamento de longo prazo, com segurança,
> clareza e tecnologia a serviço da criança."

### Para clínicas e profissionais
- Triagem estruturada com instrumentos validados (M-CHAT) e assistência digital
- Histórico longitudinal completo por paciente
- Relatórios exportáveis em PDF para encaminhamentos
- Redução de trabalho manual (checklists, anotações, laudos repetitivos)

### Para famílias
- Clareza sobre os próximos passos em cada fase
- Organização de toda a documentação da criança em um lugar seguro
- Comunicação com profissional e escola dentro da plataforma
- Registro do dia a dia com reflexos nos relatórios

### Para gestores institucionais
- Visão consolidada de todos os pacientes/alunos
- Controle de acesso por papel (família, profissional, escola separados)
- Dados para tomada de decisão institucional
- Conformidade com LGPD by design

---

## 5. Diferenciais competitivos

| Diferencial | Descrição | Força |
|---|---|---|
| **Triagem Digital Assistiva** | Pipeline de análise comportamental por vídeo + fusão com M-CHAT — diferencial técnico único no mercado BR | 🔴 Dormente (mock) |
| **Segurança de dados de crianças** | RLS por papel, Storage privado, LGPD by design | ✅ Ativo |
| **Jornada integrada** | Do site público até o acompanhamento clínico numa plataforma única | ✅ Ativo |
| **Design premium acolhedor** | UX de produto tech de referência (Linear/Stripe) aplicada à saúde | ✅ Ativo |
| **Multi-papel em tempo real** | Família, profissional e escola veem a mesma criança com escopos diferentes | ✅ Ativo |
| **Banco de dados longitudinal** | Linha do tempo unificada de eventos clínicos ao longo dos anos | ✅ Parcial |
| **IA assistiva responsável** | Nunca substitui o profissional; sempre orienta e encaminha | ✅ Princípio definido |

---

## 6. Modelo de negócio (orientador de produto)

### Tiers planejados
| Tier | Público | Capacidade | Posicionamento |
|---|---|---|---|
| **Starter** | Profissional autônomo | 1 profissional, até 30 pacientes | Entrada no mercado |
| **Clínica** | Clínica pequena-média | Até 10 profissionais, pacientes ilimitados | Core do negócio |
| **Institucional** | Escola / rede de clínicas | Múltiplas unidades, admin central | Expansão |
| **Enterprise** | Redes / planos de saúde | Volume, SLA, API | Futuro (v2.0+) |

> Implicação técnica: o produto **precisa de multi-tenancy** (organizações
> isoladas por `org_id`) antes de abrir signup público. Esta é a decisão
> arquitetural mais crítica para a v1.0 SaaS.

---

## 7. Funcionalidades obrigatórias da versão 1.0 comercial

As funcionalidades abaixo são **pré-requisitos de comercialização**. Sem
qualquer uma delas, o produto não pode ser vendido de forma responsável.

### 7.1 Infraestrutura SaaS
- [ ] Tabela `organizations` com isolamento por `org_id` (multi-tenancy)
- [ ] RLS estendida para incluir `org_id` em todas as políticas
- [ ] Signup público → criação de organização + admin inicial
- [ ] Onboarding guiado (configuração inicial da organização)

### 7.2 Gestão de usuários operável
- [ ] Admin convida usuário por e-mail (sem SQL)
- [ ] Admin promove papel (responsavel → profissional/escola/consultor) via UI
- [ ] Admin desativa usuário
- [ ] Vinculação de profissional ↔ criança via UI
- [ ] Vinculação de escola ↔ criança via UI

### 7.3 Triagem M-CHAT completa
- [ ] Retomada de sessão interrompida
- [ ] Exportação do resultado em PDF
- [ ] Histórico de aplicações por criança

### 7.4 Análise facial honesta
- [ ] Remover resultado mock da UI de produção
- [ ] Exibir "análise em processamento" ou "funcionalidade em desenvolvimento"
  (upload e registro continuam funcionando)

### 7.5 Relatórios exportáveis
- [ ] PDF do relatório de triagem (M-CHAT + dados da criança)
- [ ] Detalhe individual do relatório de triagem

### 7.6 Configurações funcionais
- [ ] Configurações da organização persistem no banco
- [ ] Nome, e-mail, URL configuráveis pelo admin

### 7.7 Produto íntegro
- [ ] Zero botões que não fazem nada (configurações, convite)
- [ ] Zero resultados fixos apresentados como reais (análise facial)
- [ ] Zero progresso que se perde ao recarregar (jogos — ao menos persistência básica)

### 7.8 Qualidade mínima de produção
- [ ] Testes de auth/RLS passando (TEST_PLAN.md)
- [ ] Monitoramento de erros (Sentry)
- [ ] Health check (`/api/health`)
- [ ] CI/CD com deploy automatizado

---

## 8. Funcionalidades futuras (pós-v1.0)

### v1.1
- Busca e filtros avançados em todas as listagens
- PDF do relatório evolutivo
- Gráficos de tendência (humor no diário, evolução de tarefas)
- Rate limiting (proteção contra abuso)
- Editar/excluir entidades (tarefas, diário, eventos da timeline)

### v1.5
- Triagem Digital Assistiva com IA real (MediaPipe / serviço externo)
- Resumos automáticos de genética por IA
- Jogos: persistência completa + 3+ jogos novos
- Notificações in-app e por e-mail
- Painel de auditoria de IA (`ai_requests`) para admin

### v2.0
- App mobile (React Native / Expo)
- API pública (REST/tRPC) para integrações
- Multi-unidade (rede de clínicas sob uma holding)
- Módulo de pesquisa com dados anonimizados e consentidos
- Integração com planos de saúde
- Telemedicina básica (agendamento + videoconferência)

---

## 9. Princípios inegociáveis do produto

1. **A triagem orienta; o diagnóstico é do profissional.** Nunca apresentar
   resultado de IA como diagnóstico. Avisos obrigatórios sempre presentes.
2. **Dados de crianças são sagrados.** LGPD by design, não como feature.
   Consentimento explícito em toda coleta. Erasure possível.
3. **Nunca inventar.** Zero resultados fictícios, zero depoimentos falsos,
   zero métricas fabricadas. Se não há dado, mostrar estado vazio.
4. **Clareza reduz ansiedade.** Linguagem simples, próximos passos sempre
   visíveis, sem jargão clínico desnecessário para as famílias.
5. **Premium não é vaidade.** A qualidade do design serve à função de
   acolhimento, não à exibição. Sofisticação discreta.
6. **Segurança nunca é sacrificada por velocidade.** Nenhuma feature que
   enfraqueça as 3 camadas de defesa (menu → requireRole → RLS).

---

*Última revisão: 2026-06-26 · Próxima revisão obrigatória: antes da Sprint 1*
