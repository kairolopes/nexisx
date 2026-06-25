// Etapa 9 — Piscar (blink rate). Reaproveita `extractBlinkRate`. Substituível por:
// Eye Aspect Ratio (dlib) / detector de piscadas por landmarks oculares.

import { extractBlinkRate } from "../../features/blink";
import { makeSeries } from "../series";
import type {
  PipelineContext,
  PipelineStage,
  SignalStageInput,
  SignalStageResult,
} from "../types";

export type BlinkStage = PipelineStage<SignalStageInput, SignalStageResult>;

export class MockBlinkStage implements BlinkStage {
  readonly name = "blink";

  run({ tracks }: SignalStageInput, _ctx: PipelineContext): SignalStageResult {
    const result = extractBlinkRate(tracks.source.input, tracks.landmarks);
    return {
      result,
      series: {
        signal: "blink_rate",
        samples: makeSeries(
          tracks.landmarks.seedHex,
          "blink_rate",
          tracks.landmarks.framesAnalyzed,
        ),
      },
    };
  }
}
