// Normaliza a saída do provedor para o contrato `GeneticSummaryOutput`,
// validando o `schemaVersion`. ESTRUTURA criada no Passo 1; implementação futura.

import { AINotImplementedError } from "../core/errors";
import type { GeneticSummaryOutput } from "../core/types";

export function parseGeneticSummary(_raw: unknown): GeneticSummaryOutput {
  throw new AINotImplementedError("genetics/parser.parseGeneticSummary");
}
