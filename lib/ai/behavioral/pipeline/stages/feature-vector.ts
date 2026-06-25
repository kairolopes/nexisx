// Etapa 13 — Geração do vetor de features. Achata os sinais agregados (indicador +
// confiança por sinal) num vetor numérico estável — entrada para classificadores futuros.
// Substituível por: extratores de features mais ricos (estatísticas temporais, embeddings).

import type {
  AggregatedSignals,
  FeatureVector,
  PipelineContext,
  PipelineStage,
} from "../types";

export type FeatureVectorStage = PipelineStage<AggregatedSignals, FeatureVector>;

export class MockFeatureVectorStage implements FeatureVectorStage {
  readonly name = "feature-vector";

  run({ signals }: AggregatedSignals, _ctx: PipelineContext): FeatureVector {
    const dimensions: string[] = [];
    const values: number[] = [];
    for (const s of signals) {
      dimensions.push(`${s.signal}.indicator`, `${s.signal}.confidence`);
      values.push(s.indicator, s.confidence);
    }
    return { dimensions, values };
  }
}
