// Triagem Digital Assistiva (Análise Comportamental Digital) — orquestrador.
// ESTRUTURA criada no Passo 1; implementação funcional virá em passo futuro.
//
// Fluxo previsto (alinhado ao artigo da Nature Medicine, 2023): qualidade da coleta
// → extração de sinais (features/*) → agregação (risco) → explicabilidade → fusão
// com M-CHAT. É TRIAGEM assistiva, nunca diagnóstico.

import { AINotImplementedError } from "../core/errors";
import type {
  AICallOptions,
  BehavioralScreeningInput,
  BehavioralScreeningOutput,
  Result,
} from "../core/types";

export async function analyzeBehavioralScreening(
  _input: BehavioralScreeningInput,
  _opts: AICallOptions,
): Promise<Result<BehavioralScreeningOutput>> {
  throw new AINotImplementedError("behavioral/service.analyzeBehavioralScreening");
}
