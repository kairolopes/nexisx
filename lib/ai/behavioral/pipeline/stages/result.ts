// Etapa 18 — Resultado estruturado. Monta o `BehavioralScreeningOutput` (contrato público
// da triagem comportamental) a partir dos artefatos das etapas anteriores. Sempre força o
// aviso obrigatório. É TRIAGEM assistiva, nunca diagnóstico.

import type {
  BehavioralScreeningOutput,
  ScreeningRecommendation,
} from "../../../core/types";
import type { PipelineContext, PipelineStage, ResultAssemblyInput } from "../types";

export type ResultAssemblyStage = PipelineStage<ResultAssemblyInput, BehavioralScreeningOutput>;

export class MockResultAssemblyStage implements ResultAssemblyStage {
  readonly name = "result";

  run(input: ResultAssemblyInput, _ctx: PipelineContext): BehavioralScreeningOutput {
    const recommendation: ScreeningRecommendation = input.recaptureRequired
      ? "repetir_coleta"
      : input.aggregate.riskLevel === "baixo"
        ? "acompanhar"
        : "encaminhar";

    return {
      schemaVersion: 1,
      captureQuality: input.captureQuality,
      riskScore: input.aggregate.riskScore,
      riskLevel: input.aggregate.riskLevel,
      predictionConfidence: input.aggregate.predictionConfidence,
      signals: input.signals,
      explanation: input.explanation,
      recommendation,
      recaptureRequired: input.recaptureRequired,
      disclaimerRequired: true,
    };
  }
}
