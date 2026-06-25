// Contratos da camada de IA do NexisX (provider-agnóstica).
// Estes tipos são a fonte única de verdade dos formatos trocados entre a aplicação,
// o registry e os providers. Nenhum domínio deve depender de um SDK específico.

import type { AIError } from "./errors";

/** Envelope de retorno usado pelas capacidades de IA. Nunca lança para a aplicação. */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AIError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}
export function err<T = never>(error: AIError): Result<T> {
  return { ok: false, error };
}

/** Capacidades abstratas oferecidas pela camada (tarefas, não modelos). */
export type AICapability =
  | "behavioral.digitalScreening" // vídeo — análise principal (fenotipagem comportamental)
  | "behavioral.staticPhoto" // foto — etapa inicial simples (não é a análise principal)
  | "text.geneticSummary"; // resumo de laudo de DNA/Exoma

export type RiskLevel = "baixo" | "moderado" | "alto";

/** Recomendações de TRIAGEM (nunca diagnóstico). */
export type ScreeningRecommendation = "encaminhar" | "repetir_coleta" | "acompanhar";

/** Opções de execução comuns a qualquer chamada de capacidade. */
export interface AICallOptions {
  /** Correlação/auditoria — não-PII. */
  requestId: string;
  /** Timeout/cancelamento. */
  signal?: AbortSignal;
  /** Tentativas em erros recuperáveis. */
  maxRetries?: number;
  /** Override de modelo (opcional). */
  model?: string;
}

// ───────────────────────── Triagem Digital Assistiva (comportamental) ─────────
// Conceito alinhado ao artigo "Early detection of autism using digital behavioral
// phenotyping" (Nature Medicine, 2023): TRIAGEM assistiva, nunca diagnóstico.

export type BehavioralSignalKind =
  | "social_attention" // atenção social
  | "gaze" // direção do olhar
  | "head_movement" // movimentos de cabeça
  | "facial_expression" // expressões faciais
  | "response_to_name" // resposta ao nome
  | "blink_rate" // taxa de piscar
  | "motor_behavior"; // comportamentos motores

export const BEHAVIORAL_SIGNALS: readonly BehavioralSignalKind[] = [
  "social_attention",
  "gaze",
  "head_movement",
  "facial_expression",
  "response_to_name",
  "blink_rate",
  "motor_behavior",
] as const;

export type MediaKind = "video" | "photo";

/** Estímulo aplicado durante a coleta (ex.: chamar o nome), com marca temporal. */
export interface StimulusEvent {
  kind: "name_call" | "visual";
  atMs: number;
}

/** Referência de mídia — bytes obtidos server-side; nunca trafega pelo client. */
export interface AIMediaRef {
  bytes: Uint8Array;
  mimeType: string;
  durationMs?: number;
}

export interface BehavioralScreeningInput {
  mediaKind: MediaKind;
  media: AIMediaRef;
  childAgeMonths?: number;
  stimuli?: StimulusEvent[];
}

/** Resultado por sinal medido — base da explicabilidade. */
export interface BehavioralSignalResult {
  signal: BehavioralSignalKind;
  indicator: number; // 0..1 — sinal de risco de triagem
  confidence: number; // 0..1 — qualidade da medição deste sinal
  note: string; // explicabilidade legível (texto tratado, não bruto)
}

export interface BehavioralScreeningOutput {
  schemaVersion: 1;
  captureQuality: number; // 0..1 — score de QUALIDADE da coleta
  riskScore: number; // 0..1 — risco agregado de triagem
  riskLevel: RiskLevel;
  predictionConfidence: number; // 0..1 — score de CONFIANÇA da predição
  signals: BehavioralSignalResult[];
  explanation: string; // interpretação consolidada (sinais que pesaram)
  recommendation: ScreeningRecommendation;
  recaptureRequired: boolean; // true se a qualidade da coleta for insuficiente
  disclaimerRequired: true; // sempre — força o aviso obrigatório na UI
}

// ───────────────────────── Fusão com M-CHAT ───────────────────────────────────
export interface MchatRef {
  score: number;
  risk: RiskLevel;
}

export interface ScreeningFusionInput {
  behavioral?: BehavioralScreeningOutput;
  mchat?: MchatRef;
}

export interface ScreeningFusionOutput {
  schemaVersion: 1;
  combinedRisk: RiskLevel;
  combinedConfidence: number;
  rationale: string; // como os dois instrumentos de triagem se combinaram
  recommendation: ScreeningRecommendation;
  disclaimerRequired: true;
}

// ───────────────────────── Resumo de DNA/Exoma ────────────────────────────────
export type GeneticAudience = "family" | "professional";

export interface GeneticSummaryInput {
  reportText: string; // texto já extraído por OCR (PDF nunca vai direto à IA)
  audience: GeneticAudience;
}

export interface GeneticSummaryOutput {
  schemaVersion: 1;
  summary: string;
  keyPoints: string[];
  disclaimerRequired: true;
}
