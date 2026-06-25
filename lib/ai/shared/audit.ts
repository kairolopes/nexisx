// Montagem do registro de auditoria de IA (futura tabela `ai_requests`).
// IMPORTANTE: auditoria NUNCA contém PII nem o texto bruto retornado pela IA —
// apenas metadados operacionais (provedor, modelo, versão de prompt, custo, etc.).
// Este módulo apenas constrói o registro; a persistência será feita por uma
// Server Action em passos futuros (não neste Passo 1).

import type { AICapability } from "../core/types";

export interface AiRequestRecord {
  provider: string;
  model: string;
  capability: AICapability;
  promptVersion: string | null;
  requestId: string;
  durationMs: number;
  estimatedCost: number;
  success: boolean;
  /** Categoria do erro (ex.: "timeout") — nunca conteúdo clínico. */
  error: string | null;
  childId: string | null;
  createdAt: string;
}

export interface AuditInput {
  provider: string;
  model: string;
  capability: AICapability;
  requestId: string;
  durationMs: number;
  estimatedCost: number;
  success: boolean;
  promptVersion?: string | null;
  error?: string | null;
  childId?: string | null;
  createdAt?: string;
}

export function buildAuditRecord(input: AuditInput): AiRequestRecord {
  return {
    provider: input.provider,
    model: input.model,
    capability: input.capability,
    promptVersion: input.promptVersion ?? null,
    requestId: input.requestId,
    durationMs: input.durationMs,
    estimatedCost: input.estimatedCost,
    success: input.success,
    error: input.error ?? null,
    childId: input.childId ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}
