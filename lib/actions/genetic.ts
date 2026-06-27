"use server";

import { createClient } from "@/lib/supabase/server";
import { getActor } from "@/lib/guard";
import {
  ValidationError,
  requiredText,
  optionalText,
  optionalUuid,
  requiredUuid,
  oneOf,
} from "@/lib/validation";
import { runAction } from "./helpers";

/** Status operacionais de uma solicitação de exame genético (sem IA). */
export const GENETIC_EXAM_STATUSES = [
  "solicitado",
  "em_andamento",
  "concluido",
  "cancelado",
] as const;

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

export interface GeneticExamUpdateInput {
  id: unknown;
  status?: unknown;
  family_summary?: unknown;
  technical_summary?: unknown;
}

/**
 * Atualiza status e/ou os resumos (familiar e técnico, manuais) de uma solicitação de
 * exame genético. Permitido a admin e profissional; o escopo por criança é garantido pelo
 * RLS (`can_access_child`). Sem IA — os resumos são preenchidos manualmente.
 */
export async function updateGeneticExamRequest(input: GeneticExamUpdateInput) {
  return runAction(async () => {
    await getActor(["admin", "profissional"]);
    const id = requiredUuid(input.id, "Solicitação de exame");

    const payload: Record<string, unknown> = {};
    if (input.status !== undefined) {
      payload.status = oneOf(input.status, "Status", GENETIC_EXAM_STATUSES);
    }
    if ("family_summary" in input) {
      payload.family_summary = optionalText(input.family_summary, 4000);
    }
    if ("technical_summary" in input) {
      payload.technical_summary = optionalText(input.technical_summary, 4000);
    }
    if (Object.keys(payload).length === 0) {
      throw new ValidationError("Nada para atualizar.");
    }

    const db = createClient();
    const { error } = await db.from("genetic_exam_requests").update(payload).eq("id", id);
    if (error) throw new ValidationError("Não foi possível atualizar a solicitação de exame.");
    return { id };
  });
}
