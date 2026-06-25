// Etapa 5 — Rastreamento facial. Extrai landmarks faciais (base de pose/olhar/expressões).
// Reaproveita `extractLandmarks` (determinístico). Substituível por: MediaPipe FaceMesh /
// OpenFace / dlib.

import { extractLandmarks } from "../../features/landmarks";
import type {
  ChildDetection,
  FaceTracks,
  PipelineContext,
  PipelineStage,
} from "../types";

export interface FacialTrackingInput {
  detection: ChildDetection;
}

export type FacialTrackingStage = PipelineStage<FacialTrackingInput, FaceTracks>;

export class MockFacialTrackingStage implements FacialTrackingStage {
  readonly name = "track-face";

  run({ detection }: FacialTrackingInput, _ctx: PipelineContext): FaceTracks {
    const landmarks = extractLandmarks(detection.source.input);
    return { source: detection.source, detection, landmarks };
  }
}
