// Etapa 6 — Rastreamento ocular (gaze). Reaproveita `extractGaze`. Substituível por:
// MediaPipe Iris / OpenFace gaze / modelo de estimativa de olhar.

import { extractGaze } from "../../features/gaze";
import { makeSeries } from "../series";
import type {
  PipelineContext,
  PipelineStage,
  SignalStageInput,
  SignalStageResult,
} from "../types";

export type EyeTrackingStage = PipelineStage<SignalStageInput, SignalStageResult>;

export class MockEyeTrackingStage implements EyeTrackingStage {
  readonly name = "track-eyes";

  run({ tracks }: SignalStageInput, _ctx: PipelineContext): SignalStageResult {
    const result = extractGaze(tracks.source.input, tracks.landmarks);
    return {
      result,
      series: {
        signal: "gaze",
        samples: makeSeries(tracks.landmarks.seedHex, "gaze", tracks.landmarks.framesAnalyzed),
      },
    };
  }
}
