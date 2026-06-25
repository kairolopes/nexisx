"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import {
  ValidationError,
  requiredUuid,
  intInRange,
  oneOf,
} from "@/lib/validation";
import { runAction } from "./helpers";
import type { RiskLevel } from "@/lib/types";

const RISKS: readonly RiskLevel[] = ["baixo", "moderado", "alto"];

export interface MchatAnswerInput {
  question_id: unknown;
  answer: unknown;
}

export interface MchatSessionInput {
  child_id: unknown;
  score: unknown;
  risk: unknown;
  answers?: MchatAnswerInput[];
}

function normalizeAnswers(answers: MchatAnswerInput[] | undefined, sessionId: string) {
  if (!answers?.length) return [];
  return answers.map((a) => ({
    session_id: sessionId,
    question_id: intInRange(a.question_id, "Pergunta", 1, 20),
    answer: oneOf(a.answer, "Resposta", ["yes", "no"] as const),
  }));
}

/**
 * Salva uma sessão M-CHAT (pontuação + risco) e, opcionalmente, suas respostas.
 * Permitido a admin, profissional e responsável (RLS valida acesso à criança).
 */
export async function saveMchatSession(input: MchatSessionInput) {
  return runAction(async () => {
    const actor = await getActor(["admin", "profissional", "responsavel"]);
    const session = {
      child_id: requiredUuid(input.child_id, "Criança"),
      score: intInRange(input.score, "Pontuação", 0, 20),
      risk: oneOf(input.risk, "Classificação de risco", RISKS),
      completed_at: new Date().toISOString(),
      created_by: actor.profile.id,
    };

    const db = createClient();
    const { data, error } = await db
      .from("mchat_sessions")
      .insert(session)
      .select("id")
      .single();
    if (error) throw new ValidationError("Não foi possível salvar a sessão M-CHAT.");

    const sessionId = data.id as string;
    const rows = normalizeAnswers(input.answers, sessionId);
    if (rows.length) {
      const { error: aErr } = await db.from("mchat_answers").insert(rows);
      if (aErr) throw new ValidationError("Sessão salva, mas houve erro ao gravar as respostas.");
    }
    return { id: sessionId };
  });
}

/** Salva (ou complementa) as respostas de uma sessão M-CHAT existente. */
export async function saveMchatAnswers(sessionId: unknown, answers: MchatAnswerInput[]) {
  return runAction(async () => {
    await getActor(["admin", "profissional", "responsavel"]);
    const id = requiredUuid(sessionId, "Sessão");
    const rows = normalizeAnswers(answers, id);
    if (!rows.length) throw new ValidationError("Nenhuma resposta para salvar.");

    const db = createClient();
    const { error } = await db.from("mchat_answers").insert(rows);
    if (error) throw new ValidationError("Não foi possível salvar as respostas.");
    return { count: rows.length };
  });
}
