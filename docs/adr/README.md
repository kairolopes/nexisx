# Architecture Decision Records (ADR)

Registro de decisões arquiteturais do NexisX. Cada ADR captura **uma** decisão estrutural,
seu contexto e suas consequências. ADRs são **imutáveis**: para reverter uma decisão, crie um
novo ADR que a substitua (`Substitui: NNNN`) e marque o antigo como `Substituído por: NNNN`.

Formato: `NNNN-titulo-em-kebab-case.md`. Status possíveis: `Proposto`, `Aceito`,
`Substituído`, `Obsoleto`.

| # | Decisão | Status |
|---|---|---|
| [0001](0001-uso-do-supabase.md) | Uso do Supabase como backend (Auth + Postgres + Storage) | Aceito |
| [0002](0002-rls-como-fonte-de-seguranca.md) | RLS como fonte de verdade da segurança | Aceito |
| [0003](0003-arquitetura-de-ia-provider-agnostic.md) | Arquitetura de IA provider-agnóstica | Aceito |
| [0004](0004-storage-privado-url-assinada.md) | Storage privado com acesso só por URL assinada | Aceito |
| [0005](0005-server-actions-para-escrita.md) | Server Actions como única via de escrita | Aceito |
| [0006](0006-sem-provider-real-de-ia.md) | Ausência temporária de provider real de IA | Aceito |

> Quando registrar um ADR novo, atualize esta tabela e o `CHANGELOG.md`.
