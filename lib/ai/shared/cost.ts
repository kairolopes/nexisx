// Estimativa de custo por chamada de IA. As tabelas reais por provedor/modelo
// entram junto com os provedores reais; o MockProvider tem custo zero.

import type { AICapability } from "../core/types";

export interface CostInput {
  provider: string;
  model: string;
  capability: AICapability;
  /** Unidades de cobrança (ex.: tokens, imagens, segundos) — depende do provedor. */
  units?: number;
}

export function estimateCost(input: CostInput): number {
  if (input.provider === "mock") return 0;
  // Provedores reais definirão sua precificação ao serem implementados.
  return 0;
}
