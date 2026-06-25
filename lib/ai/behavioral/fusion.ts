// Fusão da triagem comportamental com o M-CHAT — combina os dois instrumentos de
// TRIAGEM num risco/recomendação unificados. ESTRUTURA criada no Passo 1;
// implementação virá em passo futuro.

import { AINotImplementedError } from "../core/errors";
import type { ScreeningFusionInput, ScreeningFusionOutput } from "../core/types";

export function fuseScreening(
  _input: ScreeningFusionInput,
): ScreeningFusionOutput {
  throw new AINotImplementedError("behavioral/fusion.fuseScreening");
}
