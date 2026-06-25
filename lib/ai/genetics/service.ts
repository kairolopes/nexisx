// Resumo de DNA/Exoma — orquestrador. ESTRUTURA criada no Passo 1; futura.
//
// Fluxo previsto: PDF → OCR (ocr.ts) → texto estruturado → SHA256 (cache) →
// prompt versionado → provedor → parser. Aviso obrigatório: não substitui o
// geneticista.

import { AINotImplementedError } from "../core/errors";
import type {
  AICallOptions,
  GeneticSummaryInput,
  GeneticSummaryOutput,
  Result,
} from "../core/types";

export async function summarizeGeneticReport(
  _input: GeneticSummaryInput,
  _opts: AICallOptions,
): Promise<Result<GeneticSummaryOutput>> {
  throw new AINotImplementedError("genetics/service.summarizeGeneticReport");
}
