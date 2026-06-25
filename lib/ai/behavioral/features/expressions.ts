// Expressões faciais. ESTRUTURA criada no Passo 1; implementação futura.

import { AINotImplementedError } from "../../core/errors";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractExpressions(
  _input: BehavioralScreeningInput,
): BehavioralSignalResult {
  throw new AINotImplementedError("behavioral/features/expressions.extractExpressions");
}
