// Etapa 8 — Expressões faciais. Reaproveita `extractExpressions`. Substituível por:
// modelo de Action Units (OpenFace) / classificador de expressões.

import { extractExpressions } from "../../features/expressions";
import { makeSeries } from "../series";
import type {
  PipelineContext,
  PipelineStage,
  SignalStageInput,
  SignalStageResult,
} from "../types";

export type ExpressionStage = PipelineStage<SignalStageInput, SignalStageResult>;

export class MockExpressionStage implements ExpressionStage {
  readonly name = "expressions";

  run({ tracks }: SignalStageInput, _ctx: PipelineContext): SignalStageResult {
    const result = extractExpressions(tracks.source.input, tracks.landmarks);
    return {
      result,
      series: {
        signal: "facial_expression",
        samples: makeSeries(
          tracks.landmarks.seedHex,
          "facial_expression",
          tracks.landmarks.framesAnalyzed,
        ),
      },
    };
  }
}
