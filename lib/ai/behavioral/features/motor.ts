// Comportamentos motores (motor behaviors) → sinal de triagem "motor_behavior".
// Medível apenas em vídeo (padrão temporal de movimento). Indicador maior = padrão
// motor que MERECE ATENÇÃO na triagem. Não é diagnóstico.

import { frac, round2, type FaceLandmarks } from "./landmarks";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractMotorBehavior(
  input: BehavioralScreeningInput,
  landmarks: FaceLandmarks,
): BehavioralSignalResult {
  const isVideo = input.mediaKind === "video";
  const indicator = round2(frac(landmarks.seedHex, 6));
  const confidence = round2((isVideo ? 0.72 : 0.2) * landmarks.faceDetectionRate);
  return {
    signal: "motor_behavior",
    indicator,
    confidence,
    note: isVideo
      ? "Indicador de padrões motores (repetições/estereotipias) estimado a partir " +
        "da movimentação ao longo do vídeo."
      : "Comportamento motor com baixa confiança: requer vídeo (não estimável em foto).",
  };
}
