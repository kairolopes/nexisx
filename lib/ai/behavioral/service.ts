// Triagem Digital Assistiva (Análise Comportamental Digital) — orquestrador.
//
// Fluxo (alinhado ao artigo da Nature Medicine, 2023):
//   qualidade da coleta (porteiro) → se insuficiente, NÃO chama IA e recomenda
//   repetir a coleta → senão, o provedor produz os sinais → validação (parser).
// É TRIAGEM assistiva, nunca diagnóstico. Nunca lança para a aplicação: retorna
// sempre um `Result`.

import { AIError, AIProviderError, AIUnsupportedError } from "../core/errors";
import { resolveProvider } from "../core/registry";
import { err, ok } from "../core/types";
import type {
  AICallOptions,
  BehavioralScreeningInput,
  BehavioralScreeningOutput,
  Result,
} from "../core/types";
import { assessCaptureQuality } from "./capture-quality";
import { parseBehavioralOutput } from "./parser";

/** Saída de triagem quando a coleta é insuficiente: orienta repetir, sem chamar IA. */
function recaptureOutput(
  captureQuality: number,
  reasons: string[],
): BehavioralScreeningOutput {
  return {
    schemaVersion: 1,
    captureQuality,
    riskScore: 0,
    riskLevel: "baixo",
    predictionConfidence: 0,
    signals: [],
    explanation:
      "Qualidade da coleta insuficiente para uma triagem confiável" +
      (reasons.length > 0 ? `: ${reasons.join(" ")}` : ".") +
      " Recomenda-se repetir a coleta. É triagem assistiva, não substitui avaliação profissional.",
    recommendation: "repetir_coleta",
    recaptureRequired: true,
    disclaimerRequired: true,
  };
}

export async function analyzeBehavioralScreening(
  input: BehavioralScreeningInput,
  opts: AICallOptions,
): Promise<Result<BehavioralScreeningOutput>> {
  try {
    // 1) Porteiro: qualidade da coleta. Coleta ruim → não gasta IA, pede recoleta.
    const quality = assessCaptureQuality(input);
    if (quality.recaptureRequired) {
      return ok(recaptureOutput(quality.score, quality.reasons));
    }

    // 2) Provedor (apenas MockProvider nesta fase) produz os sinais de triagem.
    const provider = resolveProvider("behavioral.digitalScreening");
    if (!provider.behavioralScreening) {
      throw new AIUnsupportedError(
        "Provedor não suporta triagem comportamental digital.",
      );
    }
    const raw = await provider.behavioralScreening(input, opts);

    // 3) Validação do formato antes de devolver à aplicação.
    return ok(parseBehavioralOutput(raw));
  } catch (e) {
    if (e instanceof AIError) return err(e);
    return err(new AIProviderError("Falha inesperada na triagem comportamental."));
  }
}
