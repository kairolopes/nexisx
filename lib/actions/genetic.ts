"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import {
  ValidationError,
  requiredText,
  optionalText,
  optionalUuid,
} from "@/lib/validation";
import { runAction } from "./helpers";

export interface GeneticExamRequestInput {
  child_id?: unknown;
  exam_type: unknown;
  family_summary?: unknown;
  technical_summary?: unknown;
}

/** Cria uma solicitação de exame genético. Permitido a admin, profissional e responsável. */
export async function createGeneticExamRequest(input: GeneticExamRequestInput) {
  return runAction(async () => {
    const actor = await getActor(["admin", "profissional", "responsavel", "consultor"]);
    const payload = {
      child_id: optionalUuid(input.child_id, "Criança"),
      exam_type: requiredText(input.exam_type, "Tipo de exame", 120),
      family_summary: optionalText(input.family_summary, 4000),
      technical_summary: optionalText(input.technical_summary, 4000),
      created_by: actor.profile.id,
    };

    const db = createClient();
    const { data, error } = await db
      .from("genetic_exam_requests")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new ValidationError("Não foi possível registrar a solicitação de exame.");
    return { id: data.id as string };
  });
}
