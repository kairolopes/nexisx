import { describe, it, expect } from "vitest";
import { scoreMchat, MCHAT_QUESTIONS } from "@/lib/mchat";

// Helpers para montar respostas determinísticas.
function answerAllSafe(): Record<number, "yes" | "no"> {
  // Responde o OPOSTO do riskAnswer em todos os itens → 0 ponto de risco.
  const out: Record<number, "yes" | "no"> = {};
  for (const q of MCHAT_QUESTIONS) out[q.id] = q.riskAnswer === "no" ? "yes" : "no";
  return out;
}
function answerAllRisk(): Record<number, "yes" | "no"> {
  const out: Record<number, "yes" | "no"> = {};
  for (const q of MCHAT_QUESTIONS) out[q.id] = q.riskAnswer;
  return out;
}
function answerRiskCount(n: number): Record<number, "yes" | "no"> {
  const out = answerAllSafe();
  for (const q of MCHAT_QUESTIONS.slice(0, n)) out[q.id] = q.riskAnswer;
  return out;
}

describe("scoreMchat", () => {
  it("tem 20 itens no instrumento", () => {
    expect(MCHAT_QUESTIONS).toHaveLength(20);
  });

  it("pontua 0 e classifica baixo quando nenhuma resposta é de risco", () => {
    expect(scoreMchat(answerAllSafe())).toEqual({ score: 0, risk: "baixo" });
  });

  it("pontua 20 e classifica alto quando todas são de risco", () => {
    expect(scoreMchat(answerAllRisk())).toEqual({ score: 20, risk: "alto" });
  });

  it("classifica baixo para score 2 (limite inferior do moderado é 3)", () => {
    expect(scoreMchat(answerRiskCount(2))).toEqual({ score: 2, risk: "baixo" });
  });

  it("classifica moderado para score 3 (limite)", () => {
    expect(scoreMchat(answerRiskCount(3)).risk).toBe("moderado");
  });

  it("classifica moderado para score 7 (logo abaixo do alto)", () => {
    expect(scoreMchat(answerRiskCount(7)).risk).toBe("moderado");
  });

  it("classifica alto para score 8 (limite)", () => {
    expect(scoreMchat(answerRiskCount(8)).risk).toBe("alto");
  });

  it("respostas ausentes não contam ponto", () => {
    expect(scoreMchat({})).toEqual({ score: 0, risk: "baixo" });
  });
});
