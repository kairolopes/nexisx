// Movimentos de cabeça (head pose) → sinal de triagem "head_movement".
// Indicador maior = padrão de orientação de cabeça que MERECE ATENÇÃO na triagem
// (ex.: menor orientação a estímulos sociais). Não é diagnóstico.

import { frac, round2, type FaceLandmarks } from "./landmarks";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractHeadMovement(
  input: BehavioralScreeningInput,
  landmarks: FaceLandmarks,
): BehavioralSignalResult {
  const indicator = round2(frac(landmarks.seedHex, 3));
  const confidence = round2(
    (input.mediaKind === "photo" ? 0.5 : 0.75) * landmarks.faceDetectionRate,
  );
  return {
    signal: "head_movement",
    indicator,
    confidence,
    note:
      "Indicador de orientação e movimentação de cabeça frente a estímulos sociais, " +
      "estimado a partir da pose facial ao longo da coleta.",
  };
}
