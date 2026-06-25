// Etapa 16 — Explicabilidade. Reaproveita `explainSignals`: destaca os sinais que mais
// elevaram o risco de triagem, em linguagem prudente. Substituível por: explicadores de
// modelo (SHAP/atenção) traduzidos para linguagem de triagem.

import { explainSignals } from "../../explain";
import type { BehavioralSignalResult } from "../../../core/types";
import type { PipelineContext, PipelineStage } from "../types";

export type ExplainabilityStage = PipelineStage<BehavioralSignalResult[], string>;

export class MockExplainabilityStage implements ExplainabilityStage {
  readonly name = "explainability";

  run(signals: BehavioralSignalResult[], _ctx: PipelineContext): string {
    return explainSignals(signals);
  }
}
