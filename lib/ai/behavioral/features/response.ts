// Resposta a estímulos (ex.: resposta ao nome). Usa os `stimuli` da coleta.
// ESTRUTURA criada no Passo 1; implementação futura.

import { AINotImplementedError } from "../../core/errors";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractResponseToName(
  _input: BehavioralScreeningInput,
): BehavioralSignalResult {
  throw new AINotImplementedError("behavioral/features/response.extractResponseToName");
}
