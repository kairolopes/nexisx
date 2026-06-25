// Extração de face landmarks (pontos faciais) — base geométrica para head pose,
// gaze e expressões. No MockProvider a extração é DETERMINÍSTICA (derivada dos bytes
// da mídia), permitindo construir o pipeline ponta a ponta sem CV/IA real. Em um
// provedor real, isto seria substituído por um extrator de visão computacional, sem
// alterar os contratos. Retorna dados crus de pontos (não um sinal de triagem).

import { sha256Hex } from "../../shared/hash";
import type { BehavioralScreeningInput } from "../../core/types";

export interface FaceLandmarks {
  /** Quantidade de frames considerados na extração (vídeo) ou 1 (foto). */
  framesAnalyzed: number;
  /** Proporção de frames com rosto detectado (0..1) — base da confiança dos sinais. */
  faceDetectionRate: number;
  /** Seed hex determinística usada pelas features derivadas. */
  seedHex: string;
}

/** Fração determinística em [0,1) a partir de um seed hex e um deslocamento. */
export function frac(seedHex: string, offset = 0): number {
  const span = seedHex.length - 8;
  const start = span > 0 ? (offset * 4) % span : 0;
  const hex = seedHex.slice(start, start + 8);
  const n = parseInt(hex || "0", 16);
  return Number.isNaN(n) ? 0 : n / 0xffffffff;
}

/** Arredonda para 2 casas — mantém os scores legíveis e estáveis. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function extractLandmarks(input: BehavioralScreeningInput): FaceLandmarks {
  const base = sha256Hex(input.media.bytes);
  const seedHex = sha256Hex(`${input.mediaKind}:${base}`);

  const isPhoto = input.mediaKind === "photo";
  // Vídeo tende a analisar muitos frames; foto é uma etapa inicial simples (1 frame).
  const framesAnalyzed = isPhoto
    ? 1
    : Math.max(1, Math.round((input.media.durationMs ?? 10_000) / 200));

  // Rosto detectado: foto costuma render menos contexto que vídeo.
  const faceDetectionRate = round2(
    (isPhoto ? 0.55 : 0.75) + frac(seedHex, 31) * 0.2,
  );

  return { framesAnalyzed, faceDetectionRate, seedHex };
}
