// Etapa 3 — Pré-processamento. Normalização de frames (iluminação, escala, recorte).
// Mock: pass-through marcado como normalizado. Substituível por: OpenCV/transformações.

import type {
  FrameSet,
  PipelineContext,
  PipelineStage,
  PreprocessedFrameSet,
} from "../types";

export type PreprocessingStage = PipelineStage<FrameSet, PreprocessedFrameSet>;

export class MockPreprocessingStage implements PreprocessingStage {
  readonly name = "preprocess";

  run(set: FrameSet, _ctx: PipelineContext): PreprocessedFrameSet {
    return { source: set.source, frames: set.frames, normalized: true };
  }
}
