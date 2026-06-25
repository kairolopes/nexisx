// Orquestrador da PIPELINE comportamental — compõe as 18 etapas independentes em ordem,
// passando contratos tipados entre elas. Cada etapa é trocável por uma implementação real
// (MediaPipe, OpenFace, OpenCV, YOLO, PyTorch, ...) sem alterar este orquestrador nem o
// restante da aplicação. Usa, nesta fase, apenas implementações Mock determinísticas.
// É TRIAGEM assistiva, nunca diagnóstico.

import type {
  BehavioralScreeningInput,
  BehavioralScreeningOutput,
} from "../../core/types";
import type { BehavioralPipelineResult, PipelineContext } from "./types";

import { MockIngestionStage } from "./stages/ingest";
import { MockFrameExtractionStage } from "./stages/frames";
import { MockPreprocessingStage } from "./stages/preprocess";
import { MockChildDetectionStage } from "./stages/detect-child";
import { MockFacialTrackingStage } from "./stages/track-face";
import { MockEyeTrackingStage } from "./stages/track-eyes";
import { MockHeadPoseStage } from "./stages/head-pose";
import { MockExpressionStage } from "./stages/expressions";
import { MockBlinkStage } from "./stages/blink";
import { MockResponseStage } from "./stages/response";
import { MockBodyMovementStage } from "./stages/body-movement";
import { MockTemporalAggregationStage } from "./stages/temporal-aggregate";
import { MockFeatureVectorStage } from "./stages/feature-vector";
import { MockCaptureQualityStage } from "./stages/capture-quality";
import { MockConfidenceStage } from "./stages/confidence";
import { MockExplainabilityStage } from "./stages/explainability";
import { MockResultAssemblyStage } from "./stages/result";

export * from "./types";
export { MockFusionStage } from "./stages/fusion";

/**
 * Executa a pipeline completa e devolve o resultado detalhado (resultado de triagem +
 * vetor de features + séries + qualidade da coleta). A fusão com o M-CHAT (etapa 17) é
 * aplicada fora daqui, pois depende de dados do M-CHAT da criança.
 */
export async function runBehavioralPipelineDetailed(
  input: BehavioralScreeningInput,
  ctx: PipelineContext = {},
): Promise<BehavioralPipelineResult> {
  // 1–5: ingestão → frames → pré-processamento → detecção → rastreamento facial.
  const source = await new MockIngestionStage().run(input, ctx);
  const frames = await new MockFrameExtractionStage().run(source, ctx);
  const pre = await new MockPreprocessingStage().run(frames, ctx);
  const detection = await new MockChildDetectionStage().run(pre, ctx);
  const tracks = await new MockFacialTrackingStage().run({ detection }, ctx);

  // 6–11: sinais comportamentais (olhar, pose, expressões, piscar, resposta, movimento).
  const stageResults = [
    await new MockEyeTrackingStage().run({ tracks }, ctx),
    await new MockHeadPoseStage().run({ tracks }, ctx),
    await new MockExpressionStage().run({ tracks }, ctx),
    await new MockResponseStage().run({ tracks }, ctx),
    await new MockBlinkStage().run({ tracks }, ctx),
    await new MockBodyMovementStage().run({ tracks }, ctx),
  ];

  // 12–13: agregação temporal → vetor de features.
  const aggregated = await new MockTemporalAggregationStage().run({ stageResults }, ctx);
  const featureVector = await new MockFeatureVectorStage().run(aggregated, ctx);

  // 14–16: qualidade da coleta → confiança/risco → explicabilidade.
  const captureQuality = await new MockCaptureQualityStage().run(source, ctx);
  const aggregate = await new MockConfidenceStage().run(
    { signals: aggregated.signals, captureQuality: captureQuality.score },
    ctx,
  );
  const explanation = await new MockExplainabilityStage().run(aggregated.signals, ctx);

  // 18: resultado estruturado (a fusão — etapa 17 — é opcional e aplicada externamente).
  const screening = await new MockResultAssemblyStage().run(
    {
      captureQuality: captureQuality.score,
      recaptureRequired: captureQuality.recaptureRequired,
      aggregate,
      signals: aggregated.signals,
      explanation,
    },
    ctx,
  );

  return { screening, featureVector, series: aggregated.series, captureQuality };
}

/** Atalho provider-facing: devolve apenas o contrato público da triagem comportamental. */
export async function runBehavioralPipeline(
  input: BehavioralScreeningInput,
  ctx: PipelineContext = {},
): Promise<BehavioralScreeningOutput> {
  const { screening } = await runBehavioralPipelineDetailed(input, ctx);
  return screening;
}
