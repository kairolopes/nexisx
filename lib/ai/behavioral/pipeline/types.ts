// Contratos da PIPELINE de processamento comportamental da Triagem Digital Assistiva.
//
// A pipeline reproduz, em ETAPAS INDEPENDENTES, o fluxo de fenotipagem comportamental
// digital descrito no artigo "Early detection of autism using digital behavioral
// phenotyping" (Nature Medicine, 2023): ingestão de vídeo → extração/limpeza de frames
// → detecção e rastreamento da criança → extração de sinais (olhar, pose, expressões,
// piscar, resposta a estímulos, movimento) → agregação temporal → vetor de features →
// qualidade/confiança → explicabilidade → fusão com o M-CHAT → resultado estruturado.
//
// Toda comunicação entre etapas acontece por estes contratos tipados. NENHUMA etapa
// depende de um provider de IA nem de um framework de visão específico — cada etapa pode,
// no futuro, ser trocada por MediaPipe, OpenFace, OpenCV, YOLO, PyTorch, etc., sem alterar
// o restante da aplicação. É TRIAGEM assistiva, nunca diagnóstico.

import type {
  AIMediaRef,
  BehavioralScreeningInput,
  BehavioralScreeningOutput,
  BehavioralSignalKind,
  BehavioralSignalResult,
  MediaKind,
  StimulusEvent,
} from "../../core/types";
import type { AggregateResult } from "../aggregate";
import type { CaptureQualityResult } from "../capture-quality";
import type { FaceLandmarks } from "../features/landmarks";

/** Contexto comum repassado a todas as etapas (correlação/auditoria — não-PII). */
export interface PipelineContext {
  requestId?: string;
}

/**
 * Contrato genérico de UMA etapa da pipeline: recebe um contrato de entrada tipado e
 * devolve um contrato de saída tipado. Implementações (mock, MediaPipe, OpenCV, ...)
 * apenas implementam esta interface.
 */
export interface PipelineStage<I, O> {
  readonly name: string;
  run(input: I, ctx: PipelineContext): O | Promise<O>;
}

// ── 1. Ingestão ────────────────────────────────────────────────────────────────
export interface VideoSource {
  /** Coleta original (referência para as etapas que extraem sinais). */
  input: BehavioralScreeningInput;
  media: AIMediaRef;
  mediaKind: MediaKind;
  durationMs: number;
  frameRate: number;
  width: number;
  height: number;
  bytesLength: number;
  /** Seed determinística desta coleta (deriva todos os mocks). */
  seedHex: string;
}

// ── 2. Extração de frames ────────────────────────────────────────────────────────
export interface Frame {
  index: number;
  atMs: number;
}
export interface FrameSet {
  source: VideoSource;
  frames: Frame[];
}

// ── 3. Pré-processamento ─────────────────────────────────────────────────────────
export interface PreprocessedFrameSet {
  source: VideoSource;
  frames: Frame[];
  normalized: true;
}

// ── 4. Detecção da criança ───────────────────────────────────────────────────────
export interface ChildDetection {
  source: VideoSource;
  framesAnalyzed: number;
  detectionRate: number; // 0..1 — proporção de frames com a criança detectada
}

// ── 5. Rastreamento facial ───────────────────────────────────────────────────────
export interface FaceTracks {
  source: VideoSource;
  detection: ChildDetection;
  landmarks: FaceLandmarks;
}

// ── 6–11. Sinais por etapa (séries temporais + sinal agregado) ───────────────────
export interface SignalSeries {
  signal: BehavioralSignalKind;
  samples: number[]; // amostras por frame (0..1)
}
export interface SignalStageInput {
  tracks: FaceTracks;
}
export interface SignalStageResult {
  result: BehavioralSignalResult; // indicador/confiança/nota agregados do sinal
  series: SignalSeries; // série temporal (explicabilidade futura)
}

// ── 12. Agregação temporal ───────────────────────────────────────────────────────
export interface TemporalAggregationInput {
  stageResults: SignalStageResult[];
}
export interface AggregatedSignals {
  signals: BehavioralSignalResult[]; // 7 sinais (inclui atenção social derivada)
  series: SignalSeries[];
}

// ── 13. Vetor de features ────────────────────────────────────────────────────────
export interface FeatureVector {
  dimensions: string[];
  values: number[];
}

// ── 15. Confiança ────────────────────────────────────────────────────────────────
export interface ConfidenceInput {
  signals: BehavioralSignalResult[];
  captureQuality: number;
}

// ── 18. Montagem do resultado ────────────────────────────────────────────────────
export interface ResultAssemblyInput {
  captureQuality: number;
  recaptureRequired: boolean;
  aggregate: AggregateResult;
  signals: BehavioralSignalResult[];
  explanation: string;
}

/** Resultado completo da pipeline (inclui artefatos intermediários para inspeção). */
export interface BehavioralPipelineResult {
  screening: BehavioralScreeningOutput;
  featureVector: FeatureVector;
  series: SignalSeries[];
  captureQuality: CaptureQualityResult;
}
