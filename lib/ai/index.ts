// API pública da camada de IA do NexisX.
// A aplicação importa SOMENTE deste módulo — nunca de um provedor concreto.
// Trocar de provedor (OpenAI, Anthropic, Gemini, ...) não altera estes contratos.
//
// Passo 1: infraestrutura provider-agnóstica (core + MockProvider + shared) e a
// estrutura dos domínios behavioral/genetics (ainda sem implementação funcional).

export * from "./core/types";
export * from "./core/errors";
export { resolveProvider, resetProviderCache } from "./core/registry";
export type { AIProvider } from "./core/provider";

// Capacidades por domínio (estrutura; implementação funcional virá em passos futuros).
export { analyzeBehavioralScreening } from "./behavioral/service";
export { fuseScreening } from "./behavioral/fusion";
export { summarizeGeneticReport } from "./genetics/service";
