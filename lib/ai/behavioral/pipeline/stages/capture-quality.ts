// Etapa 14 — Score de qualidade da coleta. Reaproveita `assessCaptureQuality` (porteiro:
// coleta ruim → repetir, sem confiar na triagem). Substituível por: métricas reais de
// nitidez/iluminação/oclusão por frame.

import { assessCaptureQuality, type CaptureQualityResult } from "../../capture-quality";
import type { PipelineContext, PipelineStage, VideoSource } from "../types";

export type CaptureQualityStage = PipelineStage<VideoSource, CaptureQualityResult>;

export class MockCaptureQualityStage implements CaptureQualityStage {
  readonly name = "capture-quality";

  run(source: VideoSource, _ctx: PipelineContext): CaptureQualityResult {
    return assessCaptureQuality(source.input);
  }
}
