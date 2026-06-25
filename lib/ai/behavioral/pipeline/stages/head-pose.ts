// Etapa 7 — Head pose. Reaproveita `extractHeadMovement`. Substituível por: solvePnP
// (OpenCV) / MediaPipe / OpenFace.

import { extractHeadMovement } from "../../features/headpose";
import { makeSeries } from "../series";
import type {
  PipelineContext,
  PipelineStage,
  SignalStageInput,
  SignalStageResult,
} from "../types";

export type HeadPoseStage = PipelineStage<SignalStageInput, SignalStageResult>;

export class MockHeadPoseStage implements HeadPoseStage {
  readonly name = "head-pose";

  run({ tracks }: SignalStageInput, _ctx: PipelineContext): SignalStageResult {
    const result = extractHeadMovement(tracks.source.input, tracks.landmarks);
    return {
      result,
      series: {
        signal: "head_movement",
        samples: makeSeries(
          tracks.landmarks.seedHex,
          "head_movement",
          tracks.landmarks.framesAnalyzed,
        ),
      },
    };
  }
}
