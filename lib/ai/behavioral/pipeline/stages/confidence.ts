// Etapa 15 — Score de confiança (e risco agregado). Reaproveita `aggregateSignals`:
// risco ponderado pela confiança dos sinais e confiança da predição limitada pela
// qualidade da coleta. Substituível por: calibração probabilística de um classificador.

import { aggregateSignals, type AggregateResult } from "../../aggregate";
import type { ConfidenceInput, PipelineContext, PipelineStage } from "../types";

export type ConfidenceStage = PipelineStage<ConfidenceInput, AggregateResult>;

export class MockConfidenceStage implements ConfidenceStage {
  readonly name = "confidence";

  run({ signals, captureQuality }: ConfidenceInput, _ctx: PipelineContext): AggregateResult {
    return aggregateSignals(signals, captureQuality);
  }
}
