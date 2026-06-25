// Direção do olhar / atenção social (gaze). ESTRUTURA criada no Passo 1; futura.

import { AINotImplementedError } from "../../core/errors";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractGaze(
  _input: BehavioralScreeningInput,
): BehavioralSignalResult {
  throw new AINotImplementedError("behavioral/features/gaze.extractGaze");
}
