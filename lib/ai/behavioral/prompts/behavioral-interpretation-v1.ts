// Prompt versionado para a interpretação textual dos sinais da triagem digital.
// Toda execução registra a versão usada (prompt_version). Linguagem estritamente
// de TRIAGEM: "triagem", "sinais", "indicadores", "risco", "encaminhamento" —
// nunca "diagnóstico" ou "detecção definitiva".

export interface BehavioralInterpretationContext {
  /** Resumo textual dos sinais agregados (indicadores e confianças). */
  signalsSummary: string;
  childAgeMonths?: number;
}

export const behavioralInterpretationV1 = {
  version: "behavioral-interpretation-v1" as const,
  build(context: BehavioralInterpretationContext): string {
    return [
      "Você é um assistente de TRIAGEM de neurodesenvolvimento. Seu papel é apoiar,",
      "nunca diagnosticar. NÃO use as palavras 'diagnóstico' ou 'detecção definitiva'.",
      "Use sempre: triagem, sinais, indicadores, risco e encaminhamento.",
      "",
      "Com base nos indicadores comportamentais a seguir, escreva uma interpretação",
      "clara, prudente e acolhedora, destacando quais sinais elevaram o risco e",
      "recomendando o encaminhamento adequado. Deixe explícito que é triagem e não",
      "substitui avaliação profissional.",
      "",
      context.childAgeMonths != null
        ? `Idade da criança (meses): ${context.childAgeMonths}.`
        : "Idade da criança: não informada.",
      "",
      "Indicadores:",
      context.signalsSummary,
    ].join("\n");
  },
};
