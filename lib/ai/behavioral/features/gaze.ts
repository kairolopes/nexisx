// Direção do olhar (gaze) → sinal de triagem "gaze". Base, junto com head pose,
// do indicador composto de atenção social. Indicador maior = padrão de olhar que
// MERECE ATENÇÃO na triagem (ex.: menor fixação em faces). Não é diagnóstico.

import { frac, round2, type FaceLandmarks } from "./landmarks";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractGaze(
  input: BehavioralScreeningInput,
  landmarks: FaceLandmarks,
): BehavioralSignalResult {
  const indicator = round2(frac(landmarks.seedHex, 1));
  const confidence = round2(
    (input.mediaKind === "photo" ? 0.55 : 0.8) * landmarks.faceDetectionRate,
  );
  return {
    signal: "gaze",
    indicator,
    confidence,
    note:
      "Indicador de direção do olhar e fixação em faces/estímulos sociais, " +
      "estimado a partir dos pontos faciais ao longo da coleta.",
  };
}
