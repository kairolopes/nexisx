// Etapa 2 — Extração de frames. Amostra frames ao longo da coleta (mock).
// Substituível por: decodificação real de vídeo (ffmpeg/WebCodecs) por taxa de amostragem.

import { MAX_SAMPLES } from "../series";
import type { Frame, FrameSet, PipelineContext, PipelineStage, VideoSource } from "../types";

export type FrameExtractionStage = PipelineStage<VideoSource, FrameSet>;

export class MockFrameExtractionStage implements FrameExtractionStage {
  readonly name = "frames";

  run(source: VideoSource, _ctx: PipelineContext): FrameSet {
    const stepMs = 1000 / source.frameRate;
    const total =
      source.mediaKind === "photo"
        ? 1
        : Math.min(MAX_SAMPLES, Math.max(1, Math.round(source.durationMs / stepMs)));

    const frames: Frame[] = Array.from({ length: total }, (_, index) => ({
      index,
      atMs: Math.round(index * stepMs),
    }));
    return { source, frames };
  }
}
