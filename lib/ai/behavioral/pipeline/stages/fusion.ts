// Etapa 17 — Fusão com o M-CHAT. Reaproveita `fuseScreening`: combina a triagem
// comportamental com o M-CHAT (adota o maior risco; concordância eleva a confiança).
// Etapa opcional — só se aplica quando há M-CHAT da criança. Substituível por: modelos de
// fusão multimodal calibrados.

import { fuseScreening } from "../../fusion";
import type {
  ScreeningFusionInput,
  ScreeningFusionOutput,
} from "../../../core/types";
import type { PipelineContext, PipelineStage } from "../types";

export type FusionStage = PipelineStage<ScreeningFusionInput, ScreeningFusionOutput>;

export class MockFusionStage implements FusionStage {
  readonly name = "fusion";

  run(input: ScreeningFusionInput, _ctx: PipelineContext): ScreeningFusionOutput {
    return fuseScreening(input);
  }
}
