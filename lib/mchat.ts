import type { RiskLevel } from "@/lib/types";

export interface MchatQuestion {
  id: number;
  text: string;
  // resposta que conta ponto de risco ("no" na maioria; itens 2,5,12 contam em "yes")
  riskAnswer: "yes" | "no";
}

/** Itens inspirados no M-CHAT-R (20 itens). Conteúdo adaptado para triagem. */
export const MCHAT_QUESTIONS: MchatQuestion[] = [
  { id: 1, text: "Se você aponta algo do outro lado da sala, a criança olha para o objeto?", riskAnswer: "no" },
  { id: 2, text: "Você já se perguntou se a criança poderia ser surda?", riskAnswer: "yes" },
  { id: 3, text: "A criança brinca de faz de conta (ex.: fingir beber de um copo vazio)?", riskAnswer: "no" },
  { id: 4, text: "A criança gosta de subir em coisas (escadas, móveis)?", riskAnswer: "no" },
  { id: 5, text: "A criança faz movimentos incomuns com os dedos perto dos olhos?", riskAnswer: "yes" },
  { id: 6, text: "A criança aponta com o dedo para pedir algo ou conseguir ajuda?", riskAnswer: "no" },
  { id: 7, text: "A criança aponta para mostrar algo interessante a você?", riskAnswer: "no" },
  { id: 8, text: "A criança tem interesse por outras crianças?", riskAnswer: "no" },
  { id: 9, text: "A criança traz objetos ou levanta para mostrar algo a você?", riskAnswer: "no" },
  { id: 10, text: "A criança responde quando você a chama pelo nome?", riskAnswer: "no" },
  { id: 11, text: "Quando você sorri para a criança, ela retribui o sorriso?", riskAnswer: "no" },
  { id: 12, text: "A criança se incomoda com ruídos do dia a dia (aspirador, música)?", riskAnswer: "yes" },
  { id: 13, text: "A criança anda sem apoio?", riskAnswer: "no" },
  { id: 14, text: "A criança olha nos seus olhos durante interações?", riskAnswer: "no" },
  { id: 15, text: "A criança imita o que você faz (gestos, caretas)?", riskAnswer: "no" },
  { id: 16, text: "Se você vira a cabeça para olhar algo, a criança olha na mesma direção?", riskAnswer: "no" },
  { id: 17, text: "A criança tenta atrair sua atenção para si mesma?", riskAnswer: "no" },
  { id: 18, text: "A criança entende ordens simples (ex.: 'pegue o sapato')?", riskAnswer: "no" },
  { id: 19, text: "Diante de algo novo, a criança olha seu rosto para ver sua reação?", riskAnswer: "no" },
  { id: 20, text: "A criança gosta de atividades com movimento (ser balançada, pular)?", riskAnswer: "no" },
];

export function scoreMchat(answers: Record<number, "yes" | "no">): {
  score: number;
  risk: RiskLevel;
} {
  let score = 0;
  for (const q of MCHAT_QUESTIONS) {
    if (answers[q.id] === q.riskAnswer) score++;
  }
  let risk: RiskLevel = "baixo";
  if (score >= 8) risk = "alto";
  else if (score >= 3) risk = "moderado";
  return { score, risk };
}
