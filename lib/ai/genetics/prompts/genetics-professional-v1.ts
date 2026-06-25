// Prompt versionado — resumo de laudo de DNA/Exoma para o PROFISSIONAL (linguagem
// técnica). Toda execução registra a versão (prompt_version). Aviso obrigatório:
// não substitui avaliação especializada.

export interface GeneticSummaryContext {
  reportText: string;
}

export const geneticsProfessionalV1 = {
  version: "genetics-professional-v1" as const,
  build(context: GeneticSummaryContext): string {
    return [
      "Você é um assistente que resume laudos genéticos para PROFISSIONAIS de saúde,",
      "de forma técnica, estruturada e objetiva. NÃO faz diagnóstico e NÃO substitui",
      "avaliação especializada do geneticista.",
      "",
      "Resuma o laudo a seguir destacando achados, relevância clínica e lacunas:",
      "",
      context.reportText,
    ].join("\n");
  },
};
