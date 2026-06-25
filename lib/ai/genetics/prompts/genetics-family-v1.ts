// Prompt versionado — resumo de laudo de DNA/Exoma para a FAMÍLIA (linguagem
// acessível). Toda execução registra a versão (prompt_version). Aviso obrigatório:
// não substitui o geneticista.

export interface GeneticSummaryContext {
  reportText: string;
}

export const geneticsFamilyV1 = {
  version: "genetics-family-v1" as const,
  build(context: GeneticSummaryContext): string {
    return [
      "Você é um assistente que resume laudos genéticos para FAMÍLIAS, em linguagem",
      "simples, acolhedora e prudente. NÃO faz diagnóstico e NÃO substitui o",
      "geneticista. Oriente os próximos passos e o encaminhamento.",
      "",
      "Resuma o laudo a seguir destacando o essencial de forma compreensível:",
      "",
      context.reportText,
    ].join("\n");
  },
};
