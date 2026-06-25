// Normaliza a saída do provedor para o contrato `BehavioralScreeningOutput`,
// validando o `schemaVersion`. ESTRUTURA criada no Passo 1; implementação futura.

import { AINotImplementedError } from "../core/errors";
import type { BehavioralScreeningOutput } from "../core/types";

export function parseBehavioralOutput(_raw: unknown): BehavioralScreeningOutput {
  throw new AINotImplementedError("behavioral/parser.parseBehavioralOutput");
}
