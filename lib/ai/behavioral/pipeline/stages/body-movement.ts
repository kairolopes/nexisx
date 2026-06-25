// Etapa 11 — Movimento corporal (comportamentos motores). Reaproveita
// `extractMotorBehavior`. Substituível por: pose estimation corporal (MediaPipe Pose /
// MoveNet / OpenPose).

import { extractMotorBehavior } from "../../features/motor";
import { makeSeries } from "../series";
import type {
  PipelineContext,
  PipelineStage,
  SignalStageInput,
  SignalStageResult,
} from "../types";

export type BodyMovementStage = PipelineStage<SignalStageInput, SignalStageResult>;

export class MockBodyMovementStage implements BodyMovementStage {
  readonly name = "body-movement";

  run({ tracks }: SignalStageInput, _ctx: PipelineContext): SignalStageResult {
    const result = extractMotorBehavior(tracks.source.input, tracks.landmarks);
    return {
      result,
      series: {
        signal: "motor_behavior",
        samples: makeSeries(
          tracks.landmarks.seedHex,
          "motor_behavior",
          tracks.landmarks.framesAnalyzed,
        ),
      },
    };
  }
}
