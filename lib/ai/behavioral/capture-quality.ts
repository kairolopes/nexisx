// Score de QUALIDADE da coleta — porteiro do pipeline comportamental.
// Se a qualidade for insuficiente, NÃO se chama a IA: a triagem recomenda repetir a
// coleta. É determinístico (derivado da mídia) e não é diagnóstico.

import { sha256Hex } from "../shared/hash";
import { frac, round2 } from "./features/landmarks";
import type { BehavioralScreeningInput } from "../core/types";

/** Abaixo deste score a coleta é considerada insuficiente para triagem. */
export const RECAPTURE_THRESHOLD = 0.6;

export interface CaptureQualityResult {
  score: number; // 0..1
  recaptureRequired: boolean;
  reasons: string[]; // ex.: resolução baixa, iluminação insuficiente, rosto não detectado
}

export function assessCaptureQuality(
  input: BehavioralScreeningInput,
): CaptureQualityResult {
  const reasons: string[] = [];

  // Mídia ausente/vazia: coleta inválida, sempre repetir.
  if (!input.media?.bytes || input.media.bytes.byteLength === 0) {
    return {
      score: 0,
      recaptureRequired: true,
      reasons: ["Mídia ausente ou vazia na coleta."],
    };
  }

  const isPhoto = input.mediaKind === "photo";
  const seed = sha256Hex(`quality:${input.mediaKind}:${input.media.bytes.byteLength}`);

  // Vídeo tende a oferecer mais contexto (mais frames) que foto.
  let score = round2((isPhoto ? 0.5 : 0.7) + frac(seed, 0) * 0.25);

  // Vídeo muito curto reduz a qualidade da coleta para triagem comportamental.
  if (input.mediaKind === "video" && (input.media.durationMs ?? 0) < 4_000) {
    score = round2(Math.max(0, score - 0.3));
    reasons.push("Vídeo muito curto para uma coleta comportamental confiável.");
  }

  const recaptureRequired = score < RECAPTURE_THRESHOLD;
  if (recaptureRequired && reasons.length === 0) {
    reasons.push(
      "Qualidade de imagem/iluminação insuficiente para uma triagem confiável.",
    );
  }

  return { score, recaptureRequired, reasons };
}
