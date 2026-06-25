// Gerador determinístico de séries temporais (mock) por sinal. Substituível, no futuro,
// pela saída real de um framework de visão (MediaPipe/OpenFace/OpenCV) por frame.

import { frac } from "../features/landmarks";
import type { BehavioralSignalKind } from "../../core/types";

const OFFSET: Record<BehavioralSignalKind, number> = {
  social_attention: 40,
  gaze: 10,
  head_movement: 16,
  facial_expression: 22,
  response_to_name: 28,
  blink_rate: 34,
  motor_behavior: 38,
};

/** Cap de amostras por série — mantém os artefatos enxutos. */
export const MAX_SAMPLES = 60;

export function makeSeries(
  seedHex: string,
  signal: BehavioralSignalKind,
  frames: number,
): number[] {
  const n = Math.min(MAX_SAMPLES, Math.max(1, frames));
  const base = OFFSET[signal];
  return Array.from(
    { length: n },
    (_, i) => Math.round(frac(seedHex, base + i) * 100) / 100,
  );
}
