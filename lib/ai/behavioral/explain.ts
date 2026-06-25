// Explicabilidade — interpretação consolidada dos sinais (quais pesaram no risco).
// ESTRUTURA criada no Passo 1; implementação virá em passo futuro.

import { AINotImplementedError } from "../core/errors";
import type { BehavioralSignalResult } from "../core/types";

export function explainSignals(_signals: BehavioralSignalResult[]): string {
  throw new AINotImplementedError("behavioral/explain.explainSignals");
}
