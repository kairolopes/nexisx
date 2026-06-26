# 0003 — Arquitetura de IA provider-agnóstica

- **Status:** Aceito
- **Contexto data:** Fase 3 (camada de IA + Triagem Digital Assistiva)

## Contexto
O NexisX terá IA assistiva (triagem comportamental por vídeo, resumos de genética, análise
facial). O mercado de provedores (OpenAI, Anthropic, Gemini) muda rápido, e a triagem
comportamental segue um fluxo científico (fenotipagem comportamental digital — Nature
Medicine, 2023) que combina visão computacional em etapas. Não queremos acoplar a aplicação a
nenhum provedor nem a nenhum framework de visão.

## Decisão
Criar uma **camada de IA provider-agnóstica** em `lib/ai/`, com a aplicação importando
**somente** de `lib/ai/index.ts`:
- `core/` define `AIProvider`, capacidades e `resolveProvider(capability)` (seleção por
  `AI_PROVIDER`/`AI_PROVIDER_FALLBACK`, default `mock`);
- a triagem comportamental é uma **pipeline de 18 etapas independentes**
  (`behavioral/pipeline/`), cada uma com interface própria (`PipelineStage<I,O>`) e
  implementação trocável (Mock hoje; MediaPipe/OpenFace/OpenCV/YOLO/PyTorch no futuro) sem
  alterar o orquestrador nem o restante da app;
- toda chamada registra auditoria operacional (sem PII) em `ai_requests`.

## Consequências
- **Positivas:** trocar/adicionar provider ou substituir uma etapa por visão real não toca a
  UI, o banco ou os contratos; testabilidade por etapa; auditoria padronizada.
- **Negativas / trade-offs:** mais indireção/estrutura antes de haver IA real; risco de
  "arquitetura sem uso" se um provider real não chegar (mitigado pela Triagem Digital já
  consumir a pipeline mock ponta a ponta).

## Relacionado
ADR `0006-sem-provider-real-de-ia.md` (por que ainda é tudo mock).
