# 0006 — Ausência temporária de provider real de IA

- **Status:** Aceito
- **Contexto data:** Fase 3 (camada de IA)

## Contexto
A arquitetura de IA está pronta (ADR 0003) e a Triagem Digital Assistiva consome a pipeline
ponta a ponta. Porém, integrar um provider real (visão computacional, LLM) envolve custo,
chaves, latência, decisões de privacidade e calibração científica — e a prioridade atual é
**maturidade de engenharia** (docs, testes, CI), não funcionalidade nova.

## Decisão
Manter, por ora, **apenas o `MockProvider`** (determinístico, sem chave/custo/IA real) como
único provider registrado em `lib/ai/core/registry.ts`. Nenhum SDK de IA nas dependências. Os
resultados são **mock** e a UI exibe os **avisos obrigatórios** (triagem não fecha
diagnóstico). As variáveis `AI_PROVIDER`/`AI_PROVIDER_FALLBACK` existem mas só resolvem
`mock`.

## Consequências
- **Positivas:** evolução de qualidade sem custo/risco de IA; contratos já exercitados pelo
  mock; integração real depois é trocar a implementação de uma etapa/provider, sem mexer na
  app.
- **Negativas / trade-offs:** resultados não são reais (risco de expectativa — `TECH_DEBT.md`
  R4); o domínio de genética (`lib/ai/genetics`) está dormente (D6).

## Quando reavaliar
Ao iniciar a integração de IA real (ROADMAP P2): registrar novo ADR descrevendo provider,
capacidade, privacidade e custo; documentar `AI_PROVIDER*` no `.env.example`; adicionar testes
da etapa integrada antes de ativar em produção.
