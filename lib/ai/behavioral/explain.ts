// Explicabilidade — interpretação consolidada dos sinais: quais indicadores mais
// elevaram o RISCO DE TRIAGEM. Texto tratado e prudente, em linguagem de triagem
// (sinais, indicadores, risco, encaminhamento). Nunca diagnóstico.

import type { BehavioralSignalKind, BehavioralSignalResult } from "../core/types";

const LABELS: Record<BehavioralSignalKind, string> = {
  social_attention: "atenção social",
  gaze: "direção do olhar",
  head_movement: "movimentos de cabeça",
  facial_expression: "expressões faciais",
  response_to_name: "resposta ao nome",
  blink_rate: "taxa de piscar",
  motor_behavior: "comportamentos motores",
};

export function explainSignals(signals: BehavioralSignalResult[]): string {
  if (signals.length === 0) {
    return (
      "Não há sinais comportamentais suficientes para uma interpretação de triagem. " +
      "Recomenda-se repetir a coleta."
    );
  }

  // Sinais que mais pesaram = maior indicador, ponderado pela confiança da medição.
  const ranked = [...signals]
    .sort((a, b) => b.indicator * b.confidence - a.indicator * a.confidence)
    .slice(0, 3)
    .filter((s) => s.indicator >= 0.33);

  const head =
    ranked.length > 0
      ? `Os sinais que mais elevaram o risco de triagem foram: ${ranked
          .map((s) => LABELS[s.signal])
          .join(", ")}.`
      : "Os indicadores comportamentais permaneceram, em geral, em faixa de baixo risco de triagem.";

  return (
    `${head} Trata-se de uma TRIAGEM assistiva que combina indicadores comportamentais ` +
    "para orientar o encaminhamento — é triagem e não substitui a avaliação de um " +
    "profissional habilitado."
  );
}
