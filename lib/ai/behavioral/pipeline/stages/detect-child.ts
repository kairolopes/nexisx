// Etapa 4 — Detecção da criança. Localiza a criança nos frames (mock: taxa de detecção
// determinística). Substituível por: YOLO / detector de pessoas / SSD.

import { frac } from "../../features/landmarks";
import type {
  ChildDetection,
  PipelineContext,
  PipelineStage,
  PreprocessedFrameSet,
} from "../types";

export type ChildDetectionStage = PipelineStage<PreprocessedFrameSet, ChildDetection>;

export class MockChildDetectionStage implements ChildDetectionStage {
  readonly name = "detect-child";

  run(pre: PreprocessedFrameSet, _ctx: PipelineContext): ChildDetection {
    const isPhoto = pre.source.mediaKind === "photo";
    const detectionRate =
      Math.round(((isPhoto ? 0.55 : 0.75) + frac(pre.source.seedHex, 31) * 0.2) * 100) / 100;
    return {
      source: pre.source,
      framesAnalyzed: pre.frames.length,
      detectionRate,
    };
  }
}
