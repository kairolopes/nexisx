// Agregação dos sinais comportamentais → score de risco de triagem + score de
// confiança da predição. Pondera cada sinal pela sua confiança (sinais medidos com
// baixa confiança pesam menos no risco). É triagem assistiva, não diagnóstico.

import { round2 } from "./features/landmarks";
import type {
  BehavioralSignalKind,
  BehavioralSignalResult,
  RiskLevel,
} from "../core/types";

export interface AggregateResult {
  riskScore: number; // 0..1
  riskLevel: RiskLevel;
  predictionConfidence: number; // 0..1
}

/** Limiares de risco de TRIAGEM (orientadores, nunca diagnósticos). */
export function levelFromScore(score: number): RiskLevel {
  if (score >= 0.66) return "alto";
  if (score >= 0.33) return "moderado";
  return "baixo";
}

/**
 * Atenção social é um construto de ALTA ORDEM: combina o olhar (gaze) e a
 * orientação de cabeça (head_movement). Derivada a partir desses dois sinais.
 */
export function deriveSocialAttention(
  signals: BehavioralSignalResult[],
): BehavioralSignalResult {
  const pick = (k: BehavioralSignalKind) => signals.find((s) => s.signal === k);
  const gaze = pick("gaze");
  const head = pick("head_movement");
  const parts = [gaze, head].filter(Boolean) as BehavioralSignalResult[];

  const indicator = round2(mean(parts.map((s) => s.indicator)));
  const confidence = round2(mean(parts.map((s) => s.confidence)));
  return {
    signal: "social_attention",
    indicator,
    confidence,
    note:
      "Indicador composto de atenção social, derivado da combinação de direção do " +
      "olhar e orientação de cabeça frente a estímulos sociais.",
  };
}

export function aggregateSignals(
  signals: BehavioralSignalResult[],
  captureQuality: number,
): AggregateResult {
  if (signals.length === 0) {
    return { riskScore: 0, riskLevel: "baixo", predictionConfidence: 0 };
  }

  // Risco = média dos indicadores ponderada pela confiança de cada sinal.
  const totalWeight = signals.reduce((acc, s) => acc + s.confidence, 0);
  const riskScore =
    totalWeight > 0
      ? round2(
          signals.reduce((acc, s) => acc + s.indicator * s.confidence, 0) /
            totalWeight,
        )
      : round2(mean(signals.map((s) => s.indicator)));

  // Confiança da predição = confiança média dos sinais, limitada pela qualidade da coleta.
  const predictionConfidence = round2(
    mean(signals.map((s) => s.confidence)) * captureQuality,
  );

  return { riskScore, riskLevel: levelFromScore(riskScore), predictionConfidence };
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
