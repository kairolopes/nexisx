// Expressões faciais → sinal de triagem "facial_expression". Indicador maior =
// repertório/variação de expressões que MERECE ATENÇÃO na triagem. Não é diagnóstico.

import { frac, round2, type FaceLandmarks } from "./landmarks";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractExpressions(
  input: BehavioralScreeningInput,
  landmarks: FaceLandmarks,
): BehavioralSignalResult {
  const indicator = round2(frac(landmarks.seedHex, 2));
  const confidence = round2(
    (input.mediaKind === "photo" ? 0.6 : 0.78) * landmarks.faceDetectionRate,
  );
  return {
    signal: "facial_expression",
    indicator,
    confidence,
    note:
      "Indicador de variação e responsividade das expressões faciais, estimado a " +
      "partir da movimentação dos pontos faciais durante a coleta.",
  };
}
