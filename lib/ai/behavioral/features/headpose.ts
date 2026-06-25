// Movimentos de cabeça (head pose). ESTRUTURA criada no Passo 1; implementação futura.

import { AINotImplementedError } from "../../core/errors";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractHeadMovement(
  _input: BehavioralScreeningInput,
): BehavioralSignalResult {
  throw new AINotImplementedError("behavioral/features/headpose.extractHeadMovement");
}
