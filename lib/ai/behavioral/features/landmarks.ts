// Extração de face landmarks (pontos faciais) — base geométrica para head pose,
// gaze e expressões. ESTRUTURA criada no Passo 1; implementação futura (trocável,
// igual ao padrão de providers). Retorna dados crus de pontos, não um sinal.

import { AINotImplementedError } from "../../core/errors";
import type { BehavioralScreeningInput } from "../../core/types";

export interface FaceLandmarks {
  /** Pontos por frame (futuro). Estrutura definida na implementação real. */
  framesAnalyzed: number;
}

export function extractLandmarks(_input: BehavioralScreeningInput): FaceLandmarks {
  throw new AINotImplementedError("behavioral/features/landmarks.extractLandmarks");
}
