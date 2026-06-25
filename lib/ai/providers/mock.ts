// MockProvider — único provedor da primeira entrega (Passo 1).
// Implementa TODAS as capacidades de forma DETERMINÍSTICA (derivada do requestId),
// permitindo construir e testar a camada e os fluxos ponta a ponta sem chave de
// API, sem custo e sem decidir o provedor real. As saídas respeitam estritamente
// os contratos e a linguagem de TRIAGEM (nunca diagnóstico).

import type { AIProvider } from "../core/provider";
import { sha256Hex } from "../shared/hash";
import {
  BEHAVIORAL_SIGNALS,
  type AICallOptions,
  type AICapability,
  type BehavioralScreeningInput,
  type BehavioralScreeningOutput,
  type BehavioralSignalResult,
  type GeneticSummaryInput,
  type GeneticSummaryOutput,
  type RiskLevel,
  type ScreeningRecommendation,
} from "../core/types";

const SUPPORTED: readonly AICapability[] = [
  "behavioral.digitalScreening",
  "behavioral.staticPhoto",
  "text.geneticSummary",
];

/** Pseudo-aleatório determinístico em [0,1) a partir de um seed hex e um offset. */
function pseudo(seedHex: string, offset: number): number {
  const span = seedHex.length - 8;
  const start = span > 0 ? (offset * 4) % span : 0;
  const hex = seedHex.slice(start, start + 8);
  return parseInt(hex, 16) / 0xffffffff;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 0.66) return "alto";
  if (score >= 0.33) return "moderado";
  return "baixo";
}

export class MockProvider implements AIProvider {
  readonly id = "mock";
  readonly model = "mock-1";

  supports(capability: AICapability): boolean {
    return SUPPORTED.includes(capability);
  }

  async behavioralScreening(
    input: BehavioralScreeningInput,
    opts: AICallOptions,
  ): Promise<BehavioralScreeningOutput> {
    const seed = sha256Hex(`${opts.requestId}:${input.mediaKind}`);
    const isPhoto = input.mediaKind === "photo";

    // Foto (etapa inicial simples) tende a menor qualidade/confiança que vídeo.
    const captureQuality = round2(
      isPhoto ? 0.5 + pseudo(seed, 0) * 0.25 : 0.7 + pseudo(seed, 0) * 0.25,
    );

    const signals: BehavioralSignalResult[] = BEHAVIORAL_SIGNALS.map(
      (signal, i) => ({
        signal,
        indicator: round2(pseudo(seed, i + 1)),
        confidence: round2(
          (isPhoto ? 0.5 : 0.7) * (0.7 + pseudo(seed, i + 8) * 0.3),
        ),
        note: `Indicador do sinal "${signal}" estimado a partir da coleta (mock).`,
      }),
    );

    const riskScore = round2(avg(signals.map((s) => s.indicator)));
    const riskLevel = levelFromScore(riskScore);
    const predictionConfidence = round2(
      avg(signals.map((s) => s.confidence)) * captureQuality,
    );

    const recaptureRequired = captureQuality < 0.6;
    const recommendation: ScreeningRecommendation = recaptureRequired
      ? "repetir_coleta"
      : riskLevel === "baixo"
        ? "acompanhar"
        : "encaminhar";

    return {
      schemaVersion: 1,
      captureQuality,
      riskScore,
      riskLevel,
      predictionConfidence,
      signals,
      explanation:
        "Resultado de TRIAGEM assistiva (mock): combina indicadores comportamentais " +
        "para orientar o encaminhamento. Não é diagnóstico.",
      recommendation,
      recaptureRequired,
      disclaimerRequired: true,
    };
  }

  async geneticSummary(
    input: GeneticSummaryInput,
    opts: AICallOptions,
  ): Promise<GeneticSummaryOutput> {
    // Seed mantém o determinismo; o conteúdo é ilustrativo (mock).
    void sha256Hex(`${opts.requestId}:${input.audience}`);
    const isFamily = input.audience === "family";

    return {
      schemaVersion: 1,
      summary: isFamily
        ? "Resumo em linguagem acessível para a família (mock). Orienta os próximos " +
          "passos; não substitui o geneticista."
        : "Resumo técnico para o profissional (mock). Apresenta achados de forma " +
          "estruturada; não substitui avaliação especializada.",
      keyPoints: [
        "Ponto de atenção 1 (mock).",
        "Ponto de atenção 2 (mock).",
      ],
      disclaimerRequired: true,
    };
  }
}
