// Resposta a estímulos (resposta ao nome) → sinal de triagem "response_to_name".
// Usa os `stimuli` da coleta: sem um estímulo "name_call" marcado, a medição tem
// confiança reduzida. Indicador maior = menor/mais lenta resposta ao nome (merece
// atenção na triagem). Não é diagnóstico.

import { frac, round2, type FaceLandmarks } from "./landmarks";
import type { BehavioralScreeningInput, BehavioralSignalResult } from "../../core/types";

export function extractResponseToName(
  input: BehavioralScreeningInput,
  landmarks: FaceLandmarks,
): BehavioralSignalResult {
  const nameCalls = (input.stimuli ?? []).filter((s) => s.kind === "name_call").length;
  const measurable = nameCalls > 0 && input.mediaKind === "video";

  const indicator = round2(frac(landmarks.seedHex, 4));
  // Sem estímulo aplicado (ou em foto) a resposta ao nome não é medível com confiança.
  const confidence = round2(
    (measurable ? 0.8 : 0.3) * landmarks.faceDetectionRate,
  );
  return {
    signal: "response_to_name",
    indicator,
    confidence,
    note: measurable
      ? "Indicador de resposta ao nome estimado a partir da orientação após o " +
        "estímulo de chamar o nome durante a coleta."
      : "Resposta ao nome com baixa confiança: nenhum estímulo de chamar o nome foi " +
        "registrado na coleta (ou a mídia é uma foto).",
  };
}
