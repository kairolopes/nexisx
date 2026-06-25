// MockProvider — único provedor desta fase.
// A triagem comportamental é composta DELEGANDO aos módulos do domínio
// (behavioral/*): extração de landmarks → 7 sinais (6 features + atenção social
// derivada) → agregação (risco) → explicabilidade. Assim há UMA implementação do
// pipeline, exercitável ponta a ponta sem chave de API, custo ou provedor real.
// As saídas respeitam os contratos e a linguagem de TRIAGEM (nunca diagnóstico).

import type { AIProvider } from "../core/provider";
import {
  type AICallOptions,
  type AICapability,
  type BehavioralScreeningInput,
  type BehavioralScreeningOutput,
  type BehavioralSignalResult,
  type GeneticSummaryInput,
  type GeneticSummaryOutput,
  type ScreeningRecommendation,
} from "../core/types";
import { aggregateSignals, deriveSocialAttention } from "../behavioral/aggregate";
import { assessCaptureQuality } from "../behavioral/capture-quality";
import { explainSignals } from "../behavioral/explain";
import { extractLandmarks } from "../behavioral/features/landmarks";
import { extractHeadMovement } from "../behavioral/features/headpose";
import { extractGaze } from "../behavioral/features/gaze";
import { extractExpressions } from "../behavioral/features/expressions";
import { extractResponseToName } from "../behavioral/features/response";
import { extractBlinkRate } from "../behavioral/features/blink";
import { extractMotorBehavior } from "../behavioral/features/motor";

const SUPPORTED: readonly AICapability[] = [
  "behavioral.digitalScreening",
  "behavioral.staticPhoto",
  "text.geneticSummary",
];

export class MockProvider implements AIProvider {
  readonly id = "mock";
  readonly model = "mock-1";

  supports(capability: AICapability): boolean {
    return SUPPORTED.includes(capability);
  }

  async behavioralScreening(
    input: BehavioralScreeningInput,
    _opts: AICallOptions,
  ): Promise<BehavioralScreeningOutput> {
    const captureQuality = assessCaptureQuality(input).score;
    const landmarks = extractLandmarks(input);

    // 6 sinais extraídos das features + 1 sinal composto (atenção social).
    const base: BehavioralSignalResult[] = [
      extractGaze(input, landmarks),
      extractHeadMovement(input, landmarks),
      extractExpressions(input, landmarks),
      extractResponseToName(input, landmarks),
      extractBlinkRate(input, landmarks),
      extractMotorBehavior(input, landmarks),
    ];
    const signals: BehavioralSignalResult[] = [
      deriveSocialAttention(base),
      ...base,
    ];

    const { riskScore, riskLevel, predictionConfidence } = aggregateSignals(
      signals,
      captureQuality,
    );

    const recommendation: ScreeningRecommendation =
      riskLevel === "baixo" ? "acompanhar" : "encaminhar";

    return {
      schemaVersion: 1,
      captureQuality,
      riskScore,
      riskLevel,
      predictionConfidence,
      signals,
      explanation: explainSignals(signals),
      recommendation,
      recaptureRequired: false,
      disclaimerRequired: true,
    };
  }

  async geneticSummary(
    input: GeneticSummaryInput,
    _opts: AICallOptions,
  ): Promise<GeneticSummaryOutput> {
    const isFamily = input.audience === "family";
    return {
      schemaVersion: 1,
      summary: isFamily
        ? "Resumo em linguagem acessível para a família (mock). Orienta os próximos " +
          "passos; não substitui o geneticista."
        : "Resumo técnico para o profissional (mock). Apresenta achados de forma " +
          "estruturada; não substitui avaliação especializada.",
      keyPoints: ["Ponto de atenção 1 (mock).", "Ponto de atenção 2 (mock)."],
      disclaimerRequired: true,
    };
  }
}
