// Seleção de provedor por configuração (variáveis de ambiente), com fallback e
// negociação de capacidade. A aplicação chama `resolveProvider(capability)` e
// recebe um `AIProvider` — sem nunca conhecer qual provedor concreto está ativo.
//
// Passo 1: apenas o MockProvider está registrado. Provedores reais (Anthropic,
// OpenAI, Gemini, ...) entram aqui no futuro, sem alterar a aplicação.

import { MockProvider } from "../providers/mock";
import { AIConfigError, AIUnsupportedError } from "./errors";
import type { AIProvider } from "./provider";
import type { AICapability } from "./types";

type ProviderId = "mock";

const FACTORIES: Record<ProviderId, () => AIProvider> = {
  mock: () => new MockProvider(),
};

function isKnown(id: string): id is ProviderId {
  return Object.prototype.hasOwnProperty.call(FACTORIES, id);
}

let cache: Partial<Record<ProviderId, AIProvider>> = {};

function instantiate(id: ProviderId): AIProvider {
  const existing = cache[id];
  if (existing) return existing;
  const created = FACTORIES[id]();
  cache[id] = created;
  return created;
}

/**
 * Resolve o provedor para uma capacidade:
 * 1. usa `AI_PROVIDER` (padrão "mock") se ele suportar a capacidade;
 * 2. senão tenta `AI_PROVIDER_FALLBACK` (padrão "mock");
 * 3. senão lança `AIUnsupportedError`.
 */
export function resolveProvider(capability: AICapability): AIProvider {
  const primaryId = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  const fallbackId = (process.env.AI_PROVIDER_FALLBACK ?? "mock").toLowerCase();

  if (!isKnown(primaryId)) {
    throw new AIConfigError(`Provedor de IA desconhecido: "${primaryId}".`);
  }

  const primary = instantiate(primaryId);
  if (primary.supports(capability)) return primary;

  if (isKnown(fallbackId)) {
    const fallback = instantiate(fallbackId);
    if (fallback.supports(capability)) return fallback;
  }

  throw new AIUnsupportedError(
    `Nenhum provedor de IA suporta a capacidade "${capability}".`,
  );
}

/** Limpa o cache de instâncias (uso em testes). */
export function resetProviderCache(): void {
  cache = {};
}
