// Etapa 1 — Ingestão do vídeo. Lê a mídia da coleta e expõe seus metadados, sem
// decodificar conteúdo aqui. Mock determinístico (deriva uma seed dos bytes).
// Substituível por: ffmpeg/ffprobe, demuxer nativo, etc.

import { sha256Hex } from "../../../shared/hash";
import type { BehavioralScreeningInput } from "../../../core/types";
import type { PipelineContext, PipelineStage, VideoSource } from "../types";

export type IngestionStage = PipelineStage<BehavioralScreeningInput, VideoSource>;

export class MockIngestionStage implements IngestionStage {
  readonly name = "ingest";

  run(input: BehavioralScreeningInput, _ctx: PipelineContext): VideoSource {
    const isPhoto = input.mediaKind === "photo";
    const seedHex = sha256Hex(`${input.mediaKind}:${sha256Hex(input.media.bytes)}`);
    return {
      input,
      media: input.media,
      mediaKind: input.mediaKind,
      durationMs: isPhoto ? 0 : input.media.durationMs ?? 10_000,
      frameRate: isPhoto ? 1 : 30,
      width: isPhoto ? 1080 : 1280,
      height: isPhoto ? 1080 : 720,
      bytesLength: input.media.bytes.byteLength,
      seedHex,
    };
  }
}
