// Normaliza/valida a saída do provedor para o contrato `BehavioralScreeningOutput`,
// validando o `schemaVersion`, faixas [0,1] e enums. Protege a aplicação de saídas
// fora do formato — converte qualquer divergência em AIValidationError.

import { AIValidationError } from "../core/errors";
import {
  BEHAVIORAL_SIGNALS,
  type BehavioralScreeningOutput,
  type BehavioralSignalKind,
  type BehavioralSignalResult,
  type RiskLevel,
  type ScreeningRecommendation,
} from "../core/types";

const RISK_LEVELS: readonly RiskLevel[] = ["baixo", "moderado", "alto"];
const RECOMMENDATIONS: readonly ScreeningRecommendation[] = [
  "encaminhar",
  "repetir_coleta",
  "acompanhar",
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function unit(value: unknown, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
    throw new AIValidationError(`Campo "${field}" fora da faixa esperada [0,1].`);
  }
  return value;
}

function parseSignal(raw: unknown, index: number): BehavioralSignalResult {
  if (!isRecord(raw)) {
    throw new AIValidationError(`Sinal #${index} em formato inválido.`);
  }
  const signal = raw.signal;
  if (
    typeof signal !== "string" ||
    !BEHAVIORAL_SIGNALS.includes(signal as BehavioralSignalKind)
  ) {
    throw new AIValidationError(`Sinal #${index} com tipo desconhecido.`);
  }
  if (typeof raw.note !== "string") {
    throw new AIValidationError(`Sinal #${index} sem explicabilidade (note).`);
  }
  return {
    signal: signal as BehavioralSignalKind,
    indicator: unit(raw.indicator, `signals[${index}].indicator`),
    confidence: unit(raw.confidence, `signals[${index}].confidence`),
    note: raw.note,
  };
}

export function parseBehavioralOutput(raw: unknown): BehavioralScreeningOutput {
  if (!isRecord(raw)) {
    throw new AIValidationError("Saída de triagem comportamental em formato inválido.");
  }
  if (raw.schemaVersion !== 1) {
    throw new AIValidationError("schemaVersion da triagem comportamental incompatível.");
  }
  if (!Array.isArray(raw.signals)) {
    throw new AIValidationError("Saída de triagem sem lista de sinais.");
  }
  if (!RISK_LEVELS.includes(raw.riskLevel as RiskLevel)) {
    throw new AIValidationError("Nível de risco de triagem inválido.");
  }
  if (!RECOMMENDATIONS.includes(raw.recommendation as ScreeningRecommendation)) {
    throw new AIValidationError("Recomendação de triagem inválida.");
  }
  if (typeof raw.explanation !== "string") {
    throw new AIValidationError("Saída de triagem sem explicação.");
  }

  return {
    schemaVersion: 1,
    captureQuality: unit(raw.captureQuality, "captureQuality"),
    riskScore: unit(raw.riskScore, "riskScore"),
    riskLevel: raw.riskLevel as RiskLevel,
    predictionConfidence: unit(raw.predictionConfidence, "predictionConfidence"),
    signals: raw.signals.map(parseSignal),
    explanation: raw.explanation,
    recommendation: raw.recommendation as ScreeningRecommendation,
    recaptureRequired: Boolean(raw.recaptureRequired),
    disclaimerRequired: true,
  };
}
