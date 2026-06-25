// Agregação dos sinais comportamentais → score de risco + score de confiança.
// ESTRUTURA criada no Passo 1; implementação virá em passo futuro.

import { AINotImplementedError } from "../core/errors";
import type { BehavioralSignalResult, RiskLevel } from "../core/types";

export interface AggregateResult {
  riskScore: number;
  riskLevel: RiskLevel;
  predictionConfidence: number;
}

export function aggregateSignals(
  _signals: BehavioralSignalResult[],
  _captureQuality: number,
): AggregateResult {
  throw new AINotImplementedError("behavioral/aggregate.aggregateSignals");
}
