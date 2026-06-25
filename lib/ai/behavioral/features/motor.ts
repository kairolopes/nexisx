// Comportamentos motores (motor behaviors). ESTRUTURA criada no Passo 1; futura.

import { AINotImplementedError } from "../../core/errors";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractMotorBehavior(
  _input: BehavioralScreeningInput,
): BehavioralSignalResult {
  throw new AINotImplementedError("behavioral/features/motor.extractMotorBehavior");
}
