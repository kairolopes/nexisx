// Etapa 10 — Resposta aos estímulos registrados (ex.: chamada pelo nome). Reaproveita
// `extractResponseToName`, que usa os `stimuli` da coleta. Substituível por: alinhamento
// temporal entre o estímulo e a orientação de cabeça/olhar.

import { extractResponseToName } from "../../features/response";
import { makeSeries } from "../series";
import type {
  PipelineContext,
  PipelineStage,
  SignalStageInput,
  SignalStageResult,
} from "../types";

export type ResponseStage = PipelineStage<SignalStageInput, SignalStageResult>;

export class MockResponseStage implements ResponseStage {
  readonly name = "response";

  run({ tracks }: SignalStageInput, _ctx: PipelineContext): SignalStageResult {
    const result = extractResponseToName(tracks.source.input, tracks.landmarks);
    return {
      result,
      series: {
        signal: "response_to_name",
        samples: makeSeries(
          tracks.landmarks.seedHex,
          "response_to_name",
          tracks.landmarks.framesAnalyzed,
        ),
      },
    };
  }
}
