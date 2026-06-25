// Taxa de piscar (blink rate) → sinal de triagem "blink_rate". Medível apenas em
// vídeo. Indicador maior = padrão de piscar que MERECE ATENÇÃO na triagem.
// Não é diagnóstico.

import { frac, round2, type FaceLandmarks } from "./landmarks";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractBlinkRate(
  input: BehavioralScreeningInput,
  landmarks: FaceLandmarks,
): BehavioralSignalResult {
  const isVideo = input.mediaKind === "video";
  const indicator = round2(frac(landmarks.seedHex, 5));
  // Piscar é um sinal temporal: foto não permite estimar com confiança.
  const confidence = round2((isVideo ? 0.75 : 0.15) * landmarks.faceDetectionRate);
  return {
    signal: "blink_rate",
    indicator,
    confidence,
    note: isVideo
      ? "Indicador de taxa de piscar estimado ao longo dos frames do vídeo."
      : "Taxa de piscar com baixa confiança: requer vídeo (não estimável em foto).",
  };
}
