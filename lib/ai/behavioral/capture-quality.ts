// Score de QUALIDADE da coleta — porteiro do pipeline comportamental.
// Se a qualidade for insuficiente, NÃO se chama a IA e recomenda-se repetir a
// coleta. ESTRUTURA criada no Passo 1; implementação virá em passo futuro.

import { AINotImplementedError } from "../core/errors";
import type { BehavioralScreeningInput } from "../core/types";

export interface CaptureQualityResult {
  score: number; // 0..1
  recaptureRequired: boolean;
  reasons: string[]; // ex.: resolução baixa, iluminação insuficiente, rosto não detectado
}

export function assessCaptureQuality(
  _input: BehavioralScreeningInput,
): CaptureQualityResult {
  throw new AINotImplementedError("behavioral/capture-quality.assessCaptureQuality");
}
