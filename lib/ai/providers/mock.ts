// MockProvider — único provedor desta fase.
// A triagem comportamental é produzida pela PIPELINE de etapas independentes
// (behavioral/pipeline), composta por implementações Mock determinísticas. O provider
// apenas delega à pipeline — não conhece os frameworks de visão por trás de cada etapa.
// As saídas respeitam os contratos e a linguagem de TRIAGEM (nunca diagnóstico).

import type { AIProvider } from "../core/provider";
import {
  type AICallOptions,
  type AICapability,
  type BehavioralScreeningInput,
  type BehavioralScreeningOutput,
  type GeneticSummaryInput,
  type GeneticSummaryOutput,
} from "../core/types";
import { runBehavioralPipeline } from "../behavioral/pipeline";

const SUPPORTED: readonly AICapability[] = [
  "behavioral.digitalScreening",
  "behavioral.staticPhoto",
  "text.geneticSummary",
];

export class MockProvider implements AIProvider {
  readonly id = "mock";
  readonly model = "mock-1";

  supports(capability: AICapability): boolean {
    return SUPPORTED.includes(capability);
  }

  async behavioralScreening(
    input: BehavioralScreeningInput,
    opts: AICallOptions,
  ): Promise<BehavioralScreeningOutput> {
    return runBehavioralPipeline(input, { requestId: opts.requestId });
  }

  async geneticSummary(
    input: GeneticSummaryInput,
    _opts: AICallOptions,
  ): Promise<GeneticSummaryOutput> {
    const isFamily = input.audience === "family";
    return {
      schemaVersion: 1,
      summary: isFamily
        ? "Resumo em linguagem acessível para a família (mock). Orienta os próximos " +
          "passos; não substitui o geneticista."
        : "Resumo técnico para o profissional (mock). Apresenta achados de forma " +
          "estruturada; não substitui avaliação especializada.",
      keyPoints: ["Ponto de atenção 1 (mock).", "Ponto de atenção 2 (mock)."],
      disclaimerRequired: true,
    };
  }
}
