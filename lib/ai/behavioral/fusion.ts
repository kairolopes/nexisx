// Fusão da triagem comportamental com o M-CHAT — combina os DOIS instrumentos de
// TRIAGEM num risco/recomendação unificados, com racional explicável. Quando há
// ambos, eles se reforçam (concordância eleva a confiança; divergência mantém a
// prudência, adotando o maior risco). É triagem assistiva, nunca diagnóstico.

import { round2 } from "./features/landmarks";
import type {
  RiskLevel,
  ScreeningFusionInput,
  ScreeningFusionOutput,
  ScreeningRecommendation,
} from "../core/types";

const RANK: Record<RiskLevel, number> = { baixo: 0, moderado: 1, alto: 2 };
const BY_RANK: RiskLevel[] = ["baixo", "moderado", "alto"];

function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return BY_RANK[Math.max(RANK[a], RANK[b])];
}

function recommendFromRisk(risk: RiskLevel): ScreeningRecommendation {
  return risk === "baixo" ? "acompanhar" : "encaminhar";
}

export function fuseScreening(input: ScreeningFusionInput): ScreeningFusionOutput {
  const { behavioral, mchat } = input;

  // Nenhum instrumento disponível: não há triagem suficiente para orientar.
  if (!behavioral && !mchat) {
    return {
      schemaVersion: 1,
      combinedRisk: "baixo",
      combinedConfidence: 0,
      rationale:
        "Sem dados de triagem suficientes (nem análise comportamental, nem M-CHAT). " +
        "Recomenda-se realizar a coleta. É triagem, não substitui avaliação profissional.",
      recommendation: "repetir_coleta",
      disclaimerRequired: true,
    };
  }

  // Apenas M-CHAT.
  if (!behavioral && mchat) {
    return {
      schemaVersion: 1,
      combinedRisk: mchat.risk,
      combinedConfidence: 0.6,
      rationale:
        `Triagem baseada apenas no M-CHAT (risco ${mchat.risk}, pontuação ${mchat.score}). ` +
        "Sem análise comportamental por vídeo para reforçar o resultado. É triagem, " +
        "não substitui avaliação profissional.",
      recommendation: recommendFromRisk(mchat.risk),
      disclaimerRequired: true,
    };
  }

  // Apenas análise comportamental.
  if (behavioral && !mchat) {
    return {
      schemaVersion: 1,
      combinedRisk: behavioral.riskLevel,
      combinedConfidence: behavioral.predictionConfidence,
      rationale:
        `Triagem baseada apenas na análise comportamental por vídeo (risco ` +
        `${behavioral.riskLevel}). Sem M-CHAT para reforçar o resultado. É triagem, ` +
        "não substitui avaliação profissional.",
      recommendation: behavioral.recommendation,
      disclaimerRequired: true,
    };
  }

  // Ambos disponíveis: combinam-se adotando o maior risco (prudência).
  const b = behavioral!;
  const m = mchat!;
  const agree = b.riskLevel === m.risk;
  const combinedRisk = maxRisk(b.riskLevel, m.risk);
  // Concordância entre instrumentos eleva a confiança; divergência a reduz.
  const combinedConfidence = round2(
    Math.min(1, b.predictionConfidence * (agree ? 1.15 : 0.85) + 0.15),
  );

  return {
    schemaVersion: 1,
    combinedRisk,
    combinedConfidence,
    rationale:
      `Fusão de dois instrumentos de triagem: análise comportamental (risco ` +
      `${b.riskLevel}) e M-CHAT (risco ${m.risk}, pontuação ${m.score}). ` +
      (agree
        ? "Os instrumentos concordam, o que reforça o indicador de risco. "
        : "Os instrumentos divergem; por prudência adota-se o maior risco. ") +
      "É triagem assistiva, não substitui avaliação profissional.",
    recommendation: recommendFromRisk(combinedRisk),
    disclaimerRequired: true,
  };
}
