// Etapa 12 — Agregação temporal dos sinais. Consolida as séries por sinal e deriva o
// sinal composto de atenção social. Reaproveita `deriveSocialAttention`. Substituível
// por: modelos de séries temporais (HMM/RNN) que considerem a dinâmica frame a frame.

import { deriveSocialAttention } from "../../aggregate";
import type {
  AggregatedSignals,
  PipelineContext,
  PipelineStage,
  TemporalAggregationInput,
} from "../types";

export type TemporalAggregationStage = PipelineStage<
  TemporalAggregationInput,
  AggregatedSignals
>;

export class MockTemporalAggregationStage implements TemporalAggregationStage {
  readonly name = "temporal-aggregate";

  run({ stageResults }: TemporalAggregationInput, _ctx: PipelineContext): AggregatedSignals {
    const base = stageResults.map((r) => r.result);
    const signals = [deriveSocialAttention(base), ...base];
    const series = stageResults.map((r) => r.series);
    return { signals, series };
  }
}
